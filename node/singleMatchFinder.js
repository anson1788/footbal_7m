

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
                }else if(type=="bfBSOdd"){
                    rtnArr = await bfUtils.parseOddBS(dom)  
                    if(rtnArr == null){
                        rtnArr = []
                    }
                }else if(type=="bfOdd"){
                    rtnArr = await bfUtils.parseOdd(dom)  
                    if(rtnArr == null){
                        rtnArr = []
                    }
                }else if(type=="bfHistory"){
                    rtnArr = await bfUtils.parseBFHistory(dom)  
                }else if (type=="oddHistory"){
                    rtnArr = await bfUtils.parseOddHistory(dom)
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
    var matchId = ["1894633"]
    for(var i=0;i<matchId.length;i++){
        var url = "http://vip.win007.com/AsianOdds_n.aspx?id="+matchId[i]
        var OddData =  await getCacheData(url,"bfData/odd/crt/",  matchId[i],"bfOdd",true)
        

        var oddHis = "http://vip.win007.com/changeDetail/handicap.aspx?id="+matchId[i]+"&companyID=48&l=0"
        var oddHistory =  await getCacheData(oddHis,"bfData/odd/oddhistory/crt/",  matchId[i] ,"oddHistory",true)
      
        /*
        url = "http://vip.win007.com/OverDown_n.aspx?id="+matchId[i]
        var BSOddData =  await getCacheData(url,"bfData/bsodd/crt/",  matchId[i] ,"bfBSOdd",false)
       */
        match = {
            "id":matchId[i],
            "OddData":OddData
         //   "BSOddData" : BSOddData
        }
        match.oddHistory = oddHistory
        console.log(JSON.stringify(match.oddHistory))
        console.log('url '+oddHis)
        console.log("--")
        var oddPerList = ftUtils.extractSameOddMatch(match,dataList)
        if(!ftUtils.isDicEmpty(oddPerList)){
            console.log("----")
            console.table([oddPerList])
        }
        /*
        var oddBSPerList = ftUtils.extractSameBSOddMatch(match,dataList)
        if(!ftUtils.isDicEmpty(oddBSPerList)){
            console.table([oddBSPerList])
        }*/
    }
    
  
    
}

init(450)
