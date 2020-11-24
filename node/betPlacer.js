let basicUtils = require('./class/basicUtils.js');
let bfWinBetUtils = require('./class/bfWinBetUtils.js');
let hkjcBetEngine = require('./class/hkjcBetEngine.js');
let bcUtils = new basicUtils()
let bfBetUtils = new bfWinBetUtils()
let filterUtils = require('./class/dataFilterStable.js');

var acct = require('./accountInfo.json');
const TelegramBot = require('node-telegram-bot-api');
var token = '';
var fs = require('fs');
const { type } = require('os');
let hkjcBE = new hkjcBetEngine()

let programVersion = 1.27
async function init(){

        var log = ""
        var hkjcTodayData = fs.readFileSync("liveData/hkjcList.json");
        hkjcTodayData = JSON.parse(hkjcTodayData)

        var hkjcMatchList = hkjcTodayData["matchList"]
        var result = bfBetUtils.filterGetClosestMatch(hkjcMatchList,6)
        hkjcMatchList = result[1]
        //coneThisJson out
        var readyToStartList = JSON.parse(JSON.stringify(result[0]))

        console.log("------TBC match------")
        console.table(readyToStartList)
        var crtOddList = await bfBetUtils.addOddData(readyToStartList,bcUtils)

        let ftUtils = new filterUtils()
        var styList = bfBetUtils.getHKJCList(crtOddList)
        var calculatedResult = ftUtils.matchChecker(styList)

        
        var msg = calculatedResult[0]
        log += calculatedResult[1]
        log += calculatedResult[2]
        if(msg!="" && acct.isTgMsgEnble ){
            msg = "Program Version :" + programVersion +"\n" + msg
           await bot.sendMessage(tgChanelId,msg);
        }
        if(acct.isTgMsgEnble){
            log = "Program Version :" + programVersion +"\n" + log
            await bot.sendMessage(tgLogChannel,log+"----------");
        }
            
       var betArr = calculatedResult[3];
       var noMatchArr = calculatedResult[4];

        
     
   
       var finalPlaceBetArr = await hkjcBE.calculateAccumulatedOdd(betArr,noMatchArr)
       var newBetArr = finalPlaceBetArr[0]
       var ListSummary = finalPlaceBetArr[2]
       console.log("")
       console.log("bet summary table")
       console.table(finalPlaceBetArr[1]["matchList"])
       var winingVal = hkjcBE.shouldPlaceBet(ListSummary,acct)
       try{
            
            if(winingVal[0]){
                console.log("Total Daily Wining Bet :" + winingVal[1])
                    await hkjcBE.buyOdd(
                        betArr,
                        acct
                    )
            }   
       }catch(e){
            console.log(e.message)
            console.log("---- ")
            await hkjcBE.buyOdd(
                betArr,
                acct
            )
       }
       process.exit()
    //}
}

if(typeof(acct.tgToken) !== 'undefined'){
    token = acct.tgToken
}

var tgChanelId = ""
var tgLogChannel = ""
if(typeof(acct.tgMainChanelId) !== 'undefined'){
    tgChanelId = acct.tgMainChanelId
    tgLogChannel = acct.tgLogChanelId
}

bot = new TelegramBot(token, {polling: false});
init()