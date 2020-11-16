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
        if(msg!=""){
           await bot.sendMessage(tgChanelId,msg);
        }
   
       await bot.sendMessage(tgLogChannel,log+"----------");

            
       console.log(JSON.stringify(calculatedResult[3]))
       var betArr = calculatedResult[3];
       var NameMapping = {
            "克里科":"古里高聯",
            "科金博":"哥甘保",
            "金澤聯隊":"金澤薩維根",
            "名古屋八鯨":"名古屋鯨魚",
            "草津溫泉":"群馬草津溫泉",
            "丹博斯治":"丹保殊",
            "喜百年":"喜伯年",
            "雲達拿斯":"聖地牙哥漫遊者",
            "科布雷索":"科布雷素",
            "塔勒瑞斯":"泰拿尼斯",
            "伯拉根森":"巴拉干天奴紅牛",
            "科爾多瓦中央SDE":"CA科爾多瓦中央"
        };
       for(var i=0;i<betArr.length;i++){
           if(typeof(NameMapping[betArr[i].home])!="undefined"){
                betArr[i].home = NameMapping[betArr[i].home]
           }
           if(typeof(NameMapping[betArr[i].away])!="undefined"){
                betArr[i].away = NameMapping[betArr[i].away]
           }
       }

       await hkjcBE.buyOdd(
            betArr,
            acct
       )
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