

let basicUtils = require('./class/basicUtils.js');
let bfwinUtils = require('./class/bfWinUtils.js');

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

    var total = 0
    var targetMatch = []
    for(var i=2;i<defaultRange;i++){

        var matchDate = bcUtils.generateDate(i)
        var url = "http://bf.win007.com/football/big/Over_%d.htm".replace("%d",matchDate)
        var bfDailyArr =  await getCacheData(url,"bfData/",matchDate, "bflist",(i==1)?false:true)
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
                    
                    /*
                    var url = bfDailyArr[j].url
                    var inMatchData =  await getCacheData(url,"bfData/matchData/"+matchDate+"/",  bfDailyArr[j].id ,"bfDetails")
                    matchData.inMatchData = inMatchData
                    */
                    
                    /*
                    var url = "http://zq.win007.com/analysis/"+bfDailyArr[j].id+".htm"
                    var history =  await getCacheData(url,"bfData/history/"+matchDate+"/",  bfDailyArr[j].id ,"bfHistory")
                    matchData.history = history
                    targetMatch.push(matchData)
                    */
                   targetMatch.push(matchData)
                }
   
            }


        }
   
        console.log(matchDate + " " + halfHKJCMap)
        total +=halfHKJCMap
        console.log("total: " + total)   
    }
    
    /*
    for(var i=0;i<targetMatch.length; i++){
        
    }*/
    //let rawdata = fs.readFileSync("dataBook.json");
    fs.writeFileSync("oddBook.json", JSON.stringify(targetMatch,null,2))
    console.log("total: " + total)
}

init(450)
