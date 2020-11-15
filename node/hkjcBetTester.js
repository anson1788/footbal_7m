

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
        "home":"神戶勝利船",
        "away":"湘南比馬",
        "place":"客",
        "oddVal":"0.78"
    }, {
        "home":"水戶蜀葵",
        "away":"京都不死鳥",
        "place":"客",
        "oddVal":"1.02"
    },{
        "home":"匈牙利",
        "away":"冰島",
        "place":"客"
    }],
    acct
    )
}

init()
