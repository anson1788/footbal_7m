

let hkjcBetEngine = require('./class/hkjcBetEngine.js');
var fs = require('fs');

var acct = require('./accountInfo.json');
let hkjcBE = new hkjcBetEngine()

/*
http://bf.win007.com/football/big/Over_20201022.htm

*/

async function init(){
    await hkjcBE.buyOdd([{
        "home":"塞爾維亞",
        "away":"蘇格蘭",
        "place":"主"
    }],
    acct
    )
}

init()
