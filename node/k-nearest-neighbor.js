
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

async function init(){
    
    
    let ftUtils = new filterUtils()
    let dataList = ftUtils.getUpdateData()
    let matchList = await ftUtils.getMatchDateList("20201219")
    console.table(matchList)
    
  

    var matchId = matchList

    var betArr = []
    var notMakeSenseArr = []
    for(var i=0;i<matchId.length;i++){
        var url = "http://vip.win007.com/AsianOdds_n.aspx?id="+matchId[i].id
        var OddData =  await getCacheData(url,"bfData/odd/crt/",  matchId[i].id,"bfOdd",true)
        
        match = {
            "home":matchId[i].home,
            "away":matchId[i].away,
            "HomeFScore": matchId[i].HomeFScore,
            "AwayFScore": matchId[i].AwayFScore,
            "id":matchId[i].id,
            "OddData":OddData,
            "kN": matchId[i].kN,
            "date":matchId[i].date
        }
       // console.log(match.date)
        
        var feature = ftUtils.extractSameOddMatch(match,dataList)
        
     
        var hkjcData = feature["hkjcData"] 
        var upSide = hkjcData["上"][1]

        var upWin = parseFloat(upSide["贏"])
        var downWin = parseFloat(upSide["輸"])
        var dwnSide = hkjcData["下"][1]

                if(((parseFloat(upSide["p"])>0 || parseFloat(dwnSide["p"])>0))  && Math.abs(upWin-downWin)>3 && feature["kNtotal"]<0.3){
            
                    var betData = {
                                "home":match["home"],
                                "away":match["away"],
                                "id":match["id"],
                                "buyOdd":match.OddData[0]["香港马会"]["end"]["point"],
                                "HomeFScore": match.HomeFScore,
                                "AwayFScore": match.AwayFScore,
                                "up": upSide["p"],
                                "down": dwnSide["p"],
                                "total":upSide["total"],
                                "diff" : Math.abs(upSide["p"]-dwnSide["p"]),
                                "kNtotal":feature["kNtotal"],
                                "wayDiff":upWin-downWin,
                                "贏半":upSide["贏半"],
                                "贏": upSide["贏"],
                                "輸":upSide["輸"],
                                "輸半":upSide["輸半"],
                                "OddData" : [
                                    {
                                      "hkjc":{
                                        "end":{
                                           "point": match.OddData[0]["香港马会"]["end"]["point"]
                                        }
                                      }
                                    }
                                  ]
                            }

                    if(upWin > downWin){
                            betData["oddVal"] = match.OddData[0]["香港马会"]["end"]["home"]
                            betData["place"] = "主"
                          

                    }else{
                            betData["oddVal"] = match.OddData[0]["香港马会"]["end"]["away"]
                            betData["place"] = "客"
                   

                    }

                    betData.OddData[0]["hkjc"]["end"]["home"] = match.OddData[0]["香港马会"]["end"]["home"]
                    betData.OddData[0]["hkjc"]["end"]["away"] = match.OddData[0]["香港马会"]["end"]["away"]
                            
                    var result = ftUtils.calculateSingleResultAsianOdd([betData],"hkjc",betData["place"])
                    betData.res  = result[0][0].res
                    betArr.push(betData)

                    }else{
                            notMakeSenseArr.push(
                                {
                                "home":match["home"],
                                "away":match["away"],
                                "id":match["id"]
                                })
                
                    }
                    
        
    }

    
    var count = {
        "輸":0,
        "輸半":0,
        "走":0,
        "贏半":0,
        "贏":0,
        "total":0
    }
    for(var i=0;i<betArr.length;i++){
        count[betArr[i].res] = count[betArr[i].res]+1
    }
    //fs.writeFileSync("oddBook/testResult/o1.json",JSON.stringify(betArr,null))
    console.table(betArr)
    console.table([count])


  
    
}

init()
