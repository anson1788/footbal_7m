

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
        dom = await bcUtils.getHttpDomAsyn(url)  
        if(type=="bflist"){
            rtnArr = await bfUtils.parseBFDailyList(dom)  
        }else if(type=="bfDetails"){
            rtnArr = await bfUtils.parseBFLiveMatchDetails(dom)  
        }else if(type=="bfOdd"){
            rtnArr = await bfUtils.parseOdd(dom)  
        }
        if(rtnArr.length>0){
            if (!fs.existsSync(folder)){
                fs.mkdirSync(folder);
            }           
            console.log(folder+cacheId+".json")
            fs.writeFileSync(folder+cacheId+".json", JSON.stringify(rtnArr,null,2))
        }
    }
    return rtnArr
}

async function init(defaultRange=4){
    for(var i=2;i<defaultRange;i++){

        var matchDate = bcUtils.generateDate(i)
        var url = "http://bf.win007.com/football/big/Over_%d.htm".replace("%d",matchDate)
        var bfDailyArr =  await getCacheData(url,"bfData/",matchDate, "bflist",(i==1)?false:true)
        if(bfDailyArr.length==0){
            bcUtils.logError("dom is null in date "+matchDate)
            continue
        }
        for(var j=0;j<bfDailyArr.length;j++){
            var matchData = {}
            matchData = bfDailyArr[j]
            matchData.matchData = matchDate

            var url = bfDailyArr[j].url
            var inMatchData =  await getCacheData(url,"bfData/matchData/"+matchDate+"/",  bfDailyArr[j].id ,"bfDetails")
            matchData.inMatchData = inMatchData
            

            var url = "http://vip.win007.com/AsianOdds_n.aspx?id="+bfDailyArr[j].id
            var matchOddData =  await getCacheData(url,"bfData/odd/"+matchDate+"/",  bfDailyArr[j].id ,"bfOdd")
            
        }

    }
    
}

init()