

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
        "place":"客"
    },{
        "home":"北愛爾蘭",
        "away":"斯洛伐克",
        "place":"客"
    },{
        "home":"匈牙利",
        "away":"冰島",
        "place":"客"
    }],
    acct
    )
}

init()
