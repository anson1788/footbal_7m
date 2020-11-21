

let hkjcBetEngine = require('./class/hkjcBetEngine.js');
var fs = require('fs');

var acct = require('./accountInfo.json');
let hkjcBE = new hkjcBetEngine()

/*
http://bf.win007.com/football/big/Over_20201022.htm

*/

async function init(){
    await hkjcBE.buyOdd([
   {
        "home":"FC首爾",
        "away":"FC北京",
        "place":"客",
        "oddVal":"0.78"
    }],
    acct
    )
}

init()
