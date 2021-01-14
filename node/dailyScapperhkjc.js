﻿

let basicUtils = require('./class/basicUtils.js');
let bfwinUtils = require('./class/bfWinUtils.js');

var fs = require('fs');

let bcUtils = new basicUtils()
let bfUtils = new bfwinUtils()
/*
http://bf.win007.com/football/big/Over_20201022.htm

*/

var moment = require('moment');

async function getCacheData(url, folder, cacheId , type ,isCache = true){

    var rtnArr = []
    if(isCache && fs.existsSync(folder+cacheId+".json")){
        let rawdata = fs.readFileSync(folder+cacheId+".json");
        rtnArr = JSON.parse(rawdata);   
    }else{        
        const timeout = ms => new Promise(resolve => setTimeout(resolve, ms))
        try{
                console.log(url)
                dom = await bcUtils.getHttpDomAsyn(url,type) 
                await timeout(1000)
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

    var total = 0
    var targetMatch = []

    for(var i=20;i<defaultRange;i++){

        var matchDate = bcUtils.generateDate(i)
        var url = "http://bf.win007.com/football/big/Over_%d.htm".replace("%d",matchDate)
        var bfDailyArr =  await getCacheData(url,"bfData/",matchDate, "bflist",(i==1)?false:true)
       //var bfDailyArr =  await getCacheData(url,"bfData/",matchDate, "bflist",false)
        if(bfDailyArr.length==0){
            bcUtils.logError("dom is null in date "+matchDate)
            continue
        }
        
        function AtimeFormatToMoment(str){
            var hr = str.split(" ")[1].split(":")[0]
            var min = str.split(" ")[1].split(":")[1]
            var month = str.split(" ")[0].split("/")[1]
            var days = str.split(" ")[0].split("/")[2]
            var year1 = str.split(" ")[0].split("/")[0]
            let d3 = moment({ 
                year :parseFloat(year1), 
                month :parseFloat(month)-1, 
                day :parseFloat(days), 
                hour :parseFloat(hr), 
                minute :parseFloat(min)
                });
            return d3
        }

        var halfHKJCMap = 0
        for(var j=0;j<bfDailyArr.length;j++){
            var matchData = {}
            matchData = bfDailyArr[j]
            matchData.matchData = matchDate
            var year = matchDate.substring(0, 4);
            var month = matchDate.substring(4, 6);

            let fromMatchList = moment({ 
                year :parseFloat(year), 
                month :parseFloat(month)-1, 
                day :parseFloat(matchData.date.split("日")[0])
            });


            let fromGenerateDate = moment({ 
                year :parseFloat(year), 
                month :parseFloat(month)-1, 
                day :parseFloat(matchDate.substring(6, 8))
            });

            if(fromMatchList.diff(fromGenerateDate,"days")>=0){
                matchData.date = year+"/"+month+"/"+matchData.date.split("日")[0]+" " +matchData.date.split("日")[1]
            }else{
                matchData.date = year+"/"+(parseFloat(month)+1)+"/"+matchData.date.split("日")[0]+" " +matchData.date.split("日")[1]
            }
            if(typeof(bfDailyArr[j]["AwayFScore"])!=="undefined"){
                var url = "http://vip.win007.com/AsianOdds_n.aspx?id="+bfDailyArr[j].id
                var OddData =  await getCacheData(url,"bfData/odd/"+matchDate+"/",  bfDailyArr[j].id ,"bfOdd")
                matchData.OddData = OddData
 
                if(matchData.OddData.length > 0 && typeof(matchData.OddData[0]["香港马会"])!="undefined"){
                        halfHKJCMap ++ ;
                        var oddHis = "http://vip.win007.com/changeDetail/handicap.aspx?id="+bfDailyArr[j].id+"&companyID=48&l=0"
                        var oddHistory =  await getCacheData(oddHis,"bfData/oddHistory/"+matchDate+"/",  bfDailyArr[j].id ,"oddHistory")
                        matchData.oddHistory = oddHistory
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