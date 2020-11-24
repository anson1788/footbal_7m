

let hkjcBetEngine = require('./class/hkjcBetEngine.js');
var fs = require('fs');

var acct = require('./accountInfo.json');
let hkjcBE = new hkjcBetEngine()

/*
http://bf.win007.com/football/big/Over_20201022.htm

*/

async function init(){
    var liveMatchList  = fs.readFileSync("liveData/liveListTable.json");
    liveMatchList = JSON.parse(liveMatchList)
    await hkjcBE.outputDiffMatchName(liveMatchList);

}

init()
