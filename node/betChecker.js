let basicUtils = require('./class/basicUtils.js');
let bfWinBetUtils = require('./class/bfWinBetUtils.js');

let bcUtils = new basicUtils()
let bfBetUtils = new bfWinBetUtils()


async function init(){

    var liveUrl = "http://live.win007.com/indexall_big.aspx"
    var dom = null
    try{
        dom = await bcUtils.getHttpDomAsyn(liveUrl,"") 
    }catch(e){
        console.log("mean error "+e)
        return
    }
    if(dom==null){
        console.log("get 7m data error")
        return
    }
    var LiveMatchList  = bfBetUtils.parseBFLiveMatch(dom)
    console.log(JSON.stringify(LiveMatchList,null,2))
}


init()