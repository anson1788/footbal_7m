
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
        /*
        if(dataList[idx]["OddData"][0]["香港马会"]["end"]["point"].includes("/")){
            console.log("empty "+dataList[idx]["OddData"][0]["香港马会"]["end"]["point"])
            continue 
        }
        console.log ("not empty "+dataList[idx]["OddData"][0]["香港马会"]["end"]["point"])
        */
        var feature = ftUtils.extractSameOddMatchAdance(match,dataList)
        
        var hkjcData = feature["hkjcData"] 
        var upSide = hkjcData["上"][1]

        var upWin = parseFloat(upSide["贏半"]) + parseFloat(upSide["贏"])
        var downWin = parseFloat(upSide["輸半"]) + parseFloat(upSide["輸"])
        var dwnSide = hkjcData["下"][1]

           
                    var betData = {
                                "home":match["home"],
                                "away":match["away"],
                                "id":match["id"],
                                "buyOdd":match.OddData[0]["香港马会"]["end"]["point"],
                                "HomeFScore": match.HomeFScore,
                                "AwayFScore": match.AwayFScore,
                                "S贏":parseFloat(upSide["贏半"])+parseFloat(upSide["贏"]),
                                "S贏1":parseFloat(upSide["贏"]),
                                "S贏2":parseFloat(upSide["贏半"]),
                                "S輸":parseFloat(upSide["輸"])+parseFloat(upSide["輸半"]),
                                "S輸1":parseFloat(upSide["輸"]),
                                "S輸2":parseFloat(upSide["輸半"]),
                                "A贏":parseFloat(dwnSide["贏半"])+parseFloat(dwnSide["贏"]),
                                "A贏1":parseFloat(dwnSide["贏"]),
                                "A贏2":parseFloat(dwnSide["贏半"]),
                                "A輸":parseFloat(dwnSide["輸"])+parseFloat(dwnSide["輸半"]),
                                "A輸1":parseFloat(dwnSide["輸"]),
                                "A輸2":parseFloat(dwnSide["輸半"]),
                                /*
                                "start":(parseFloat(match.OddData[0]["香港马会"]["start"]["home"])+parseFloat(match.OddData[0]["香港马会"]["start"]["away"])).toFixed(2),
                                "end":(parseFloat(match.OddData[0]["香港马会"]["end"]["home"])+parseFloat(match.OddData[0]["香港马会"]["end"]["away"])).toFixed(2),
                                */
                               "date":match.date,
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

                            var startD = Math.abs(betData["S贏"]-betData["S輸"])/(betData["S贏"]+betData["S輸"])
                            var endD = Math.abs(betData["A贏"]-betData["A輸"])/(betData["A贏"]+betData["A輸"])
                            betData["startD"] = startD.toFixed(2)
                            betData["endD"] = endD.toFixed(2)


                            if(betData["S贏"]+betData["S輸"]>30 && betData["A贏"]+betData["A輸"]>30
                              && startD>0.1&& endD>0.1 
                            ){


                                if((betData["S贏1"]>= Math.max(betData["S輸1"],betData["S輸2"]) && betData["S贏2"]==0 && 
                                   betData["A贏1"]>= Math.max(betData["A輸1"],betData["A輸2"]) && betData["A贏2"]==0 ) ||
                                   (betData["S輸1"]>= Math.max(betData["S贏1"],betData["S贏2"]) && betData["S輸2"]==0 && 
                                   betData["A輸1"]>= Math.max(betData["A贏1"],betData["A贏2"]) && betData["A輸2"]==0 )

                                ){
                                    if( betData["S贏1"]>= Math.max(betData["S輸1"],betData["S輸2"])){
                                        betData = placeBet(betData,match,true,ftUtils)
                                        betArr.push(betData)
                                    }else{
                                        betData = placeBet(betData,match,false,ftUtils)
                                        betArr.push(betData)
                                    }
                               
                                }else if(betData["S贏"]>betData["S輸"] && betData["A贏"]>betData["A輸"]){
                                    betData = placeBet(betData,match,true,ftUtils)
                                    betArr.push(betData)
                                }else if(betData["S輸"]>betData["S贏"] && betData["A輸"]>betData["A贏"]){
                                    betData = placeBet(betData,match,false,ftUtils)
                                    betArr.push(betData)
                                }
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
    count["total"] = betArr.length 
    for(var i=0;i<betArr.length;i++){
        count[betArr[i].res] = count[betArr[i].res]+1
    }

    console.table(betArr)
    console.table([count])
    console.log("today match " + matchId.length)

   return count
}

function placeBet(betData,match,up,ftUtils){
    if(up){
        betData["place"] = "主"
        betData["oddVal"] = match.OddData[0]["香港马会"]["end"]["home"]
    }else{
        betData["place"] = "客"
        betData["oddVal"] = match.OddData[0]["香港马会"]["end"]["away"]
    }
    var result = ftUtils.calculateSingleResultAsianOdd([betData],"hkjc",betData["place"])
    betData.res  = result[0][0].res
    return betData
}

var lg = [
    "20201001","20201002",
    "20201003","20201004",
    "20201005","20201006",
    "20201007","20201008",
    "20201009","20201010",
    "20201011","20201012",
    "20201013","20201015",
    "20201015","20201017",
    "20201017","20201018",
    "20201019","20201020",
    "20201021","20201022",
    "20201023","20201024",

    "20201025","20201026",
    "20201028","20201027",
    "20201029","20201030",
    "20201031",


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
    "20201123","20201124",
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
        delete data[key][pickIdx].total
        if(data[key][pickIdx]["輸"]>data[key][pickIdx]["贏"]){
            data[key][pickIdx]["L"] = "Y"
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
   
    console.table(tmp)
    fs.writeFileSync("oddBook/testResult/o3.json",JSON.stringify(tmp,null))
    

    display()
}
a()


//initA("20201027",10)
