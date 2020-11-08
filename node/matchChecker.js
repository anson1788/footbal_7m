let basicUtils = require('./class/basicUtils.js');
let bfWinBetUtils = require('./class/bfWinBetUtils.js');

let bcUtils = new basicUtils()
let bfBetUtils = new bfWinBetUtils()
let filterUtils = require('./class/dataFilterStable.js');

var acct = require('./accountInfo.json');
const TelegramBot = require('node-telegram-bot-api');
var token = '';
var fs = require('fs');

async function init(){
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
        var liveMatchList  = bfBetUtils.parseBFLiveMatch(dom)
        var separateList  = bfBetUtils.filterOutImmediateList(liveMatchList)

        var hkjcList = fs.readFileSync("liveData/hkjcMatchList.json");
        hkjcList = JSON.parse(hkjcList)

        var nonhkjcList = fs.readFileSync("liveData/nonhkjcMatchList.json");
        nonhkjcList = JSON.parse(nonhkjcList)

        for(var i=0;i<separateList[1].length;i++){
            separateList[0].push(separateList[1][i])
        }
        var workingList = separateList[0]
        var result =bfBetUtils.listSeparator(workingList,hkjcList)
        var InListDataHKJC = result[0]
        var notInListDataHKJC = result[1]
   
        result =bfBetUtils.listSeparator(notInListDataHKJC,nonhkjcList)
        var InListDataNONHKJC = result[0]
        var notInListDataNONHKJC = result[1]


        var hkjcListNew = []
        var nonhkjcListNew = []
        
        for(var i=0;i<InListDataHKJC.length;i++){
            hkjcListNew.push(InListDataHKJC[i].id)
        }
        for(var i=0;i<InListDataNONHKJC.length;i++){
            nonhkjcListNew.push(InListDataNONHKJC[i].id)
        }
        
        
        var dataWithOddList = await bfBetUtils.addOddData(notInListDataNONHKJC,bcUtils,true)
        
        for(var i=0;i<dataWithOddList.length;i++){
            if(dataWithOddList[i].isOddReady){
                if(bfBetUtils.isHKJCData(dataWithOddList[i])){
                    hkjcListNew.push(dataWithOddList[i].id)
                }else{
                    nonhkjcListNew.push(dataWithOddList[i].id)
                }
            }    
        }

        
    
        console.log(JSON.stringify(hkjcListNew))
        console.log(JSON.stringify(nonhkjcListNew))

    
        fs.writeFileSync("liveData/hkjcMatchList.json", JSON.stringify(hkjcListNew,null,2));
        fs.writeFileSync("liveData/nonhkjcMatchList.json", JSON.stringify(nonhkjcListNew,null,2));
        var log = "hkjcMatch : " + hkjcListNew.length +"\n"
        for(var i=0;i<hkjcListNew.length;i++){
            log += hkjcListNew[i]+"\n"
        }
        log += "non-hkjcMatch : " + nonhkjcListNew.length +"\n"
        for(var i=0;i<nonhkjcListNew.length;i++){
            log += nonhkjcListNew[i]+"\n"
        }
        await bot.sendMessage(tgLogChannel,log+"----------");
       
        process.exit()

    }
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