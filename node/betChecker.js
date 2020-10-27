let basicUtils = require('./class/basicUtils.js');
let bfWinBetUtils = require('./class/bfWinBetUtils.js');

let bcUtils = new basicUtils()
let bfBetUtils = new bfWinBetUtils()
let filterUtils = require('./class/dataFilter.js');

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
        var LiveMatchList  = bfBetUtils.parseBFLiveMatch(dom)
    // console.log(JSON.stringify(LiveMatchList))
        LiveMatchList  = bfBetUtils.filterOutImmediateList(LiveMatchList)
        
        let ftUtils = new filterUtils()
        var targetData = ftUtils.lookUpTwoMatch(LiveMatchList)
        console.table(targetData)
    }
}


init()