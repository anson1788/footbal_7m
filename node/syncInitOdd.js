

let hkjcBetEngine = require('./class/hkjcBetEngine.js');
var fs = require('fs');
let basicUtils = require('./class/basicUtils.js');
let bcUtils = new basicUtils()
var acct = require('./accountInfo.json');
let bfWinBetUtils = require('./class/bfWinBetUtils.js');
let bfBetUtils = new bfWinBetUtils()
/*
http://bf.win007.com/football/big/Over_20201022.htm

*/

async function init(){
    var liveMatchList  = fs.readFileSync("liveData/hkjcList.json");
    liveMatchList = JSON.parse(liveMatchList)
    liveMatchList = liveMatchList["matchList"]
    var crtOddPath = "./liveData/crtOdd"

    if (!fs.existsSync(crtOddPath)){
        fs.mkdirSync(crtOddPath);
    }else{
        fs.rmdirSync(crtOddPath, { recursive: true })
        fs.mkdirSync(crtOddPath);
    }
    console.table(liveMatchList)
    var result = await bfBetUtils.addOddDataWithCachePath(liveMatchList,bcUtils,crtOddPath)

}

init()
