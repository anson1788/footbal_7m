
let basicUtils = require('./class/basicUtils.js');
let bfwinUtils = require('./class/bfWinUtils.js');
let filterUtils = require('./class/dataFilterStable.js');
var fs = require('fs');
const { parse } = require('path');
const { count } = require('console');

let bcUtils = new basicUtils()
let bfUtils = new bfwinUtils()
/*
http://bf.win007.com/football/big/Over_20201022.htm

*/

async function getCacheData(url, folder, cacheId , type ,isCache = true){

    var rtnArr = []
    if(isCache && fs.existsSync(folder+cacheId+".json")){
        let rawdata = fs.readFileSync(folder+cacheId+".json");
        console.log(folder+cacheId+".json")
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

async function initA(str="20201112",opt){
    
    
    let rawdata = fs.readFileSync("oddBook.json");
    let dataList = JSON.parse(rawdata)
  
    let ftUtils = new filterUtils()
    let matchList = await ftUtils.getMatchDateList(str)
  //  matchList = ftUtils.getSingleFieldArr(matchList,"id")
    console.table(matchList)
  
    var matchId = matchList

    var betArr = []
    var notMakeSenseArr = []
    for(var i=0;i<matchId.length;i++){
        /*
        var url = "http://vip.win007.com/AsianOdds_n.aspx?id="+matchId[i].id
        var OddData =  await getCacheData(url,"bfData/odd/crt/",  matchId[i].id,"bfOdd",true)
        */
       var idx =-99
        for(var j=0;j<dataList.length;j++){
            if(dataList[j].id==matchId[i].id){
                idx = j
                continue
            }
        }
        var OddData = dataList[idx]["OddData"]
        match = {
            "home":matchId[i].home,
            "away":matchId[i].away,
            "HomeFScore": matchId[i].HomeFScore,
            "AwayFScore": matchId[i].AwayFScore,
            "id":matchId[i].id,
            "OddData":OddData,
            "date":matchId[i].date
        }
       
        var feature = ftUtils.extractSameOddMatch(match,dataList)
        
        var hkjcData = feature["hkjcData"] 
        var upSide = hkjcData["上"][1]

        var upWin = parseFloat(upSide["贏半"]) + parseFloat(upSide["贏"])
        console.table(upWin)

        var betData = {
            "home":match["home"],
            "away":match["away"],
            "id":match["id"],
            "buyOdd":match.OddData[0]["香港马会"]["end"]["point"],
            "HomeFScore": match.HomeFScore,
            "AwayFScore": match.AwayFScore,
            "homeOdd":match.OddData[0]["香港马会"]["end"]["home"],
            "awayOdd":match.OddData[0]["香港马会"]["end"]["away"],
            /*
            "up": upSide["p"],
            "total":upSide["total"],
            "贏半":upSide["贏半"],
            "贏": upSide["贏"],
            "輸":upSide["輸"],
            "輸半":upSide["輸半"],
            */
            "OddData" : [
                {
                  "hkjc":{
                    "end":{
                       "point": match.OddData[0]["香港马会"]["end"]["point"]
                    }
                  }
                }
              ],
            "date":match["date"]
        }
        betData["place"] = "主"
        var result = ftUtils.calculateSingleResultAsianOdd([betData],"hkjc",betData["place"])
        betArr.push(betData)
        if(result[0][0].res.includes("贏")){
            betData.res1 = match.OddData[0]["香港马会"]["end"]["home"]
        }else{
            betData.res1 = match.OddData[0]["香港马会"]["end"]["away"]
        }
        if(betData["buyOdd"].includes("受让")){
            if(result[0][0].res.includes("贏")){
                betData.res = "下"
            }else{
                betData.res = "上"
            }
        }else{
            if(result[0][0].res.includes("贏")){
                betData.res = "上"
            }else{
                betData.res = "下"
            }
        }
        delete betData.place
        delete betData.OddData  
    }
    console.table(betArr)
    /* 
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

    console.table(betArr)
    console.table([count])
    console.log("today match " + matchId.length)

   return count
   */
}

var lg = [
    "20201101","20201102",
    "20201103","20201104",
    "20201105","20201106",
    "20201107","20201108",
    "20201109","20201110",
    "20201111","20201112",
    "20201113","20201115",
    "20201115","20201117",
    "20201117","20201118",
    "20201119","20201120",
    "20201121","20201122",
    "20201113","20201124",
  ]
    

function display(){
    var data = JSON.parse(fs.readFileSync("oddBook/testResult/o3.json"))
    var coln4 = []
    var pickIdx = 0
    for(var key in data){
        data[key][pickIdx]["date"] = ""+key
        if("20201113"==key){
            console.table(data[key])
        }
        coln4.push(data[key][pickIdx])
    }
    console.table(coln4)
}
async function a(){
    
 
     
    var tmp = {}
    for(var j=0;j<lg.length;j++){
        var l = [0.1]
        var pushArr = []
        for(var i=0;i<l.length;i++){
            var c = await initA(lg[j],l[i])
            pushArr.push(c)
        }
        tmp[""+lg[j]] = pushArr
    }
   
    fs.writeFileSync("oddBook/testResult/o3.json",JSON.stringify(tmp,null))
  

   display()
}
//a()
initA("20201122",10)
