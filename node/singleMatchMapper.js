

let basicUtils = require('./class/basicUtils.js');
let bfwinUtils = require('./class/bfWinUtils.js');
let filterUtils = require('./class/dataFilterStable.js');
var fs = require('fs');

let bcUtils = new basicUtils()
let bfUtils = new bfwinUtils()
/*
http://bf.win007.com/football/big/Over_20201022.htm

*/

async function getCacheData(url, folder, cacheId , type ,isCache = true){

    var rtnArr = []
    if(isCache && fs.existsSync(folder+cacheId+".json")){
        let rawdata = fs.readFileSync(folder+cacheId+".json");
        rtnArr = JSON.parse(rawdata);   
    }else{        
        
        try{
                dom = await bcUtils.getHttpDomAsyn(url,type) 
                if(type=="bflist"){
                    rtnArr = await bfUtils.parseBFDailyList(dom)  
                }else if(type=="bfDetails"){
                    rtnArr = await bfUtils.parseBFLiveMatchDetails(dom)  
                }else if(type=="bfOdd"){
                    rtnArr = await bfUtils.parseOdd(dom)  
                }else if(type=="bfHistory"){
                    rtnArr = await bfUtils.parseBFHistory(dom)  
                }
                if(rtnArr.length>0){
                    if (!fs.existsSync(folder)){
                        fs.mkdirSync(folder);
                    }           
                    console.log(folder+cacheId+".json")
                    fs.writeFileSync(folder+cacheId+".json", JSON.stringify(rtnArr,null,2))
                }
        }catch(e){
                console.log("mean error")
        }
    }
    return rtnArr
}

async function init(defaultRange=50){
    /*
    let rawdata = fs.readFileSync("oddBook.json");
    let dataList = JSON.parse(rawdata)
    let ftUtils = new filterUtils()
    var matchId = ["1913851"]
    for(var i=0;i<matchId.length;i++){
        var url = "http://vip.win007.com/AsianOdds_n.aspx?id="+matchId[i]
        var OddData =  await getCacheData(url,"bfData/odd/crt/",  matchId[i],"bfOdd",false)
        match = {

            "id":matchId[i],
            "OddData":OddData
        }
        var feature = ftUtils.extraSimilarMatch(match,dataList)
        console.table(feature)
    }*/

    var rawdata = fs.readFileSync("oddBook.json");
    let dataList = JSON.parse(rawdata)
    let ftUtils = new filterUtils()
    rawdata = fs.readFileSync("bfData/20201030.json");
    let crt = JSON.parse(rawdata)
    for(var i=0;i<crt.length;i++){
        var url = "http://vip.win007.com/AsianOdds_n.aspx?id="+crt[i].id
        var OddData =  await getCacheData(url,"bfData/odd/20201030/",  crt[i].id ,"bfOdd")
        match = {
            "id":crt[i].id,
            "OddData":OddData
        }
        var feature = ftUtils.extraSimilarMatch(match,dataList)
        if(feature.length>0){
            console.log("print similar Map " +feature.length)
        }
        //console.table(feature)
    }
 
    
}

init(450)
