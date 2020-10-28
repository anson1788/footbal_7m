let basicUtils = require('./class/basicUtils.js');
let bfWinBetUtils = require('./class/bfWinBetUtils.js');

let bcUtils = new basicUtils()
let bfBetUtils = new bfWinBetUtils()
let filterUtils = require('./class/dataFilter.js');


const TelegramBot = require('node-telegram-bot-api');
var token = '';

async function init(){

    var liveUrl = "http://live.win007.com/indexall_big.aspx"
    var dom = null
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
    // console.log(JSON.stringify(LiveMatchList))
        liveMatchList  = bfBetUtils.filterOutImmediateList(liveMatchList)
        var list = await bfBetUtils.addOddData(liveMatchList,bcUtils)
        liveMatchList = list
        console.table(liveMatchList)
        let ftUtils = new filterUtils()
        var targetData = ftUtils.lookUpTwoMatch(liveMatchList)
        console.table(targetData)
    }
}


init()