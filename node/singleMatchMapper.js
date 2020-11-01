

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
    let rawdata = fs.readFileSync("oddBook.json");
    let dataList = JSON.parse(rawdata)
    let ftUtils = new filterUtils()
    var matchId = ["1880507"]
    for(var i=0;i<matchId.length;i++){
        var url = "http://vip.win007.com/AsianOdds_n.aspx?id="+matchId[i]
        var OddData =  await getCacheData(url,"bfData/odd/crt/",  matchId[i],"bfOdd",false)
        match = {
            "OddData":OddData
        }
        var feature = ftUtils.extraMatchFeature(match)
        if(!ftUtils.isEmptyDic(feature)){

        }else{}
        console.log(JSON.stringify(OddData))
    }
    /*
    var total = 0
    var targetMatch = []

    var url = "http://live.win007.com/indexall_big.aspx"
    var bfDailyArr =  await getCacheData(url,"bfData/",matchDate, "bflist",false)
    if(bfDailyArr.length==0){
        bcUtils.logError("dom is null in date "+matchDate)
        continue
    }
        
    var halfHKJCMap = 0
    for(var j=0;j<bfDailyArr.length;j++){
        var matchData = {}
        matchData = bfDailyArr[j]
        matchData.matchData = matchDate

            if(typeof(bfDailyArr[j]["AwayFScore"])!=="undefined"){
                var url = "http://vip.win007.com/AsianOdds_n.aspx?id="+bfDailyArr[j].id
                var OddData =  await getCacheData(url,"bfData/odd/"+matchDate+"/",  bfDailyArr[j].id ,"bfOdd")
                matchData.OddData = OddData
                if(matchData.OddData.length > 0 && typeof(matchData.OddData[0]["香港马会"])!="undefined"){
                    halfHKJCMap ++ ;
                   targetMatch.push(matchData)
                }
   
            }


        }
    */

    
}

init(450)
