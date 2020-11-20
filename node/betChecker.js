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

let programVersion = 1.25
async function init(){


    /*
    var liveUrl = "http://live.win007.com/indexall_big.aspx"
    var dom = null
    var log = ""
    try{
        dom = await bcUtils.getHttpDomAsyn(liveUrl,"") 
    }catch(e){
        console.log("mean error "+e)
        return null
    }
    if(dom==null){
        console.log("get 7m data error")
        await init()
        process.exit()
    }else{
    */
        var log = ""
       // var liveMatchList  = bfBetUtils.parseBFLiveMatch(dom)
        var liveMatchList  = fs.readFileSync("liveData/liveListTable.json");
        liveMatchList = JSON.parse(liveMatchList)
        
        var separateList  = bfBetUtils.filterOutImmediateList(liveMatchList)

       
        var hkjcList = fs.readFileSync("liveData/hkjcMatchList.json");
        hkjcList = JSON.parse(hkjcList)
        console.log(JSON.stringify(hkjcList))
        var m20List = separateList[0]
        var m7List = separateList[1]
       
        log += "hkjc Live Match :\n"
        var hkjcCrtList = bfBetUtils.getCrtHKJCList(m7List,hkjcList)
        for(var i=0;i<hkjcCrtList.length;i++){
            log += hkjcCrtList[i].id + " "+hkjcCrtList[i]["home"] + " vs "+hkjcCrtList[i]["away"] +"\n"
        }

        crtOddList = await bfBetUtils.addOddData(hkjcCrtList,bcUtils)
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
       if(winingVal[0]){
            console.log("Total Daily Wining Bet :" + winingVal[1])
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