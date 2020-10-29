let basicUtils = require('./class/basicUtils.js');
let bfWinBetUtils = require('./class/bfWinBetUtils.js');

let bcUtils = new basicUtils()
let bfBetUtils = new bfWinBetUtils()
let filterUtils = require('./class/dataFilter.js');

var acct = require('./accountInfo.json');
const TelegramBot = require('node-telegram-bot-api');
var token = '';
var fs = require('fs');

async function init(){

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
    }else{
        var liveMatchList  = bfBetUtils.parseBFLiveMatch(dom)
        var separateList  = bfBetUtils.filterOutImmediateList(liveMatchList)

        log += "Total Match :"+liveMatchList.length +"\n"
        var hkjcList = fs.readFileSync("liveData/hkjcMatchList.json");
        hkjcList = JSON.parse(hkjcList)

        var m20List = separateList[0]
        var m7List = separateList[1]
       
        log += "m20 Match :"+m20List.length +"\n"
        log += "m7 Match :"+m7List.length +"\n"

        var hkjcCrtList = bfBetUtils.getCrtHKJCList(m7List,hkjcList)
        log += "liveHKJC Match :"+hkjcCrtList.length +"\n"

        crtOddList = await bfBetUtils.addOddData(hkjcCrtList,bcUtils)
        let ftUtils = new filterUtils()
        var targetData = ftUtils.oneGoalOdd(crtOddList)
        console.table(targetData)
        var msg = ""
        for(var i=0;i<targetData.length;i++){
            msg += targetData[i].home +" vs "+targetData[i].away + " "+" "+targetData[i].hkjcOdd + " 主 " + targetData[i].betOdd
        }
        if(msg!=""){
            bot.sendMessage(tgChanelId,msg);
        }
        crtOddList = await bfBetUtils.addOddData(m20List,bcUtils)
        var hkjcId = []
        for(var i=0;i<crtOddList.length;i++){
            console.log(JSON.stringify(crtOddList[i].OddData))
            if(typeof(crtOddList[i].OddData) !="undefined"  &&
                crtOddList[i].OddData.length > 0 &&
               typeof(crtOddList[i].OddData[0]["香港马会"])!=="undefined"){
                hkjcId.push(crtOddList[i].id)
            }
        }
        log += "futureHKJC Match :"+hkjcId.length +"\n"
       fs.writeFileSync("liveData/hkjcMatchList.json", JSON.stringify(hkjcId,null,2));
       
        /*
        var list = await bfBetUtils.addOddData(liveMatchList,bcUtils)
        liveMatchList = list
        console.table(liveMatchList)
        let ftUtils = new filterUtils()
        var targetData = ftUtils.lookUpTwoMatch(liveMatchList)
        console.table(targetData)
        */
       bot.sendMessage(tgLogChannel,log+"----------");
    }
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