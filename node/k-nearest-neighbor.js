
let basicUtils = require('./class/basicUtils.js');
let bfwinUtils = require('./class/bfWinUtils.js');
let filterUtils = require('./class/dataFilterStable.js');
var fs = require('fs');

let bcUtils = new basicUtils()
let bfUtils = new bfwinUtils()
var moment = require('moment');
const { GPU } = require('gpu.js')


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

function CtimeFormatToMoment(str){
    var year1 = str.slice(0,4)
    var month = str.slice(4,6)
    var days = str.slice(6,8)
    let d3 = moment({ 
        year :parseFloat(year1), 
        month :parseFloat(month)-1, 
        day :parseFloat(days)
        });
    return d3
}

function AtimeFormatToMoment(str){
    var year1 = str.split("/")[0]
    var month = str.split("/")[1]
    var days = str.split("/")[2]
    let d3 = moment({ 
        year :parseFloat(year1), 
        month :parseFloat(month)-1, 
        day :parseFloat(days),
        hour : str.split(" ")[1].split(":")[0],
        minutes : str.split(" ")[1].split(":")[1]
        });
    return d3
}


async function calculateExpectedDate(targetDate,dataList, KVal,backwardDateRange, sliceSize,brench,parameterWeight){
    
    
    let ftUtils = new filterUtils()
   // let dataList = ftUtils.getUpdateData()
    let matchList = await ftUtils.getMatchDateList(targetDate,dataList)
    var matchId = matchList
    var betArr = []
    var notMakeSenseArr = []
    for(var i=0;i<matchId.length;i++){
        var url = "http://vip.win007.com/AsianOdds_n.aspx?id="+matchId[i].id
      //  var OddData =  await getCacheData(url,"bfData/odd/crt/",  matchId[i].id,"bfOdd",true)
        var OddData =  await getCacheData(url,"bfData/odd/"+ targetDate+"/",   matchId[i].id ,"bfOdd",true)

     
        var match = {
            "home":matchId[i].home,
            "away":matchId[i].away,
            "HomeFScore": matchId[i].HomeFScore,
            "AwayFScore": matchId[i].AwayFScore,
            "id":matchId[i].id,
            "OddData":OddData,
            "kN": matchId[i].kN,
            "date":matchId[i].date,
            "matchDateM":CtimeFormatToMoment(targetDate)
        }


        var startTimeOdd = AtimeFormatToMoment("2020/"+match["kN"]["startOdd"].time.replace("-","/"))
        var endTimeOdd =  AtimeFormatToMoment(match.date)
        var rangeTime = moment.duration(endTimeOdd.diff(startTimeOdd)).asHours()
        match.rangeTime = rangeTime

        var feature = ftUtils.extractSameOddMatch(match,dataList,backwardDateRange, sliceSize,parameterWeight)
    
        var hkjcData = feature["hkjcData"] 
        var upSide = hkjcData["上"][1]

        var upWin = parseFloat(upSide["贏"]) + parseFloat(upSide["贏半"])
        var downWin = parseFloat(upSide["輸"]) + parseFloat(upSide["輸半"])
        
     
                /*
                if((  Math.abs(upWin/(upWin+downWin)) > brench || Math.abs(downWin/(upWin+downWin)) > brench) &&
                    feature["kNtotal"]<KVal){
                */
               if((  Math.abs(upWin/(upWin+downWin)) > brench || Math.abs(downWin/(upWin+downWin)) > brench)){
                        
                    var betData = {
                                "home":match["home"],
                                "away":match["away"],
                                "id":match["id"],
                                "buyOdd":match.OddData[0]["香港马会"]["end"]["point"],
                                "HomeFScore": match.HomeFScore,
                                "AwayFScore": match.AwayFScore,
                                "total":upSide["total"],
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

                    if(upWin>downWin ){
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
        "date":targetDate,
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


    betArr.sort(function(a, b) {
        var keyA = a.kNtotal,
        keyB = b.kNtotal;
        // Compare the 2 dates
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
    })
    return [count]
    
}

async function tuneParameter(dataList,defaultRange,startDate,KVal,backwardDateRange, sliceSize,brench,parameterWeight){
    var dateResult = []
    console.table([{
        "kVal":KVal,
        "sliceSize":sliceSize,
        "brench":brench
    }])
    for(var i=0;i<defaultRange;i++){
        var matchDate = bcUtils.generateDateWithStart(startDate,i)
        var dateResultSingle = await calculateExpectedDate(matchDate,dataList,KVal,backwardDateRange, sliceSize,brench,parameterWeight)
        dateResult.push(dateResultSingle[0])
        
    }
     var totalWin = 0
     var totalWinHalf = 0
     var totalLost = 0
     var totalLostHalf = 0
     for(var i=0;i<dateResult.length;i++){
        totalWin += dateResult[i]["贏"]
        totalLost += dateResult[i]["輸"]
        totalWinHalf+= dateResult[i]["贏半"]
        totalLostHalf+= dateResult[i]["輸半"]
    }
 
    return {
            "totalWin":totalWin,
            "totalWinHalf":totalWinHalf,
            "totalLostHalf":totalLostHalf,
            "totalLost":totalLost,
            "diff":(totalWin+totalWinHalf*0.5-(totalLost+totalLostHalf*0.5)),
            "startDate":startDate,
            "backwardDateRange":backwardDateRange, 
            "KVal":KVal,
            "sliceSize":sliceSize,
            "brench":brench,
            "startOddHome":parameterWeight["startOddHome"],
            "startOddAway":parameterWeight["startOddAway"],
            "endOddHome":parameterWeight["endOddHome"],
            "endOddAway":parameterWeight["endOddAway"],
            "startPointDiff":parameterWeight["startPointDiff"],
            "endPointDiff":parameterWeight["endPointDiff"],
            "rangeTime":parameterWeight["rangeTime"]
    }


}

async function getParameter(calculateDate){
            
    let ftUtils = new filterUtils()
    let dataList = ftUtils.getUpdateData()


    var resultPush = []

    var kValArr = []
    var sliceArr = []
    for(var i=0;i<1;i++){
    
        /*
        var kVal = 5 + i*0.5
        for(var j=0;j<1;j++){
            var sliceSize =10
            for(var k=0;k<1;k++){
                var brenchMark = 0.65

        */
       var kVal = 5 
       var brenchMark = 0.65
       var sliceSize = 10

                var array = [
                    //[1  , 1,    1 , 1,     1 , 1     , 1],
                    [2  , 1,   0.5,0.5,    1 , 1      ,1],
                    [2  , 1,     1,  1,  0.5 , 0.5    ,1],
                    [1  , 1,   0.5,0.5,    1 , 1      ,2],
                    [1  , 1,     1,  1,  0.5 , 0.5    ,2],
                    [0.5, 2,    1 , 1,     1 , 1      ,0.5],
                    [1, 2,    0.5 , 0.5,     1 , 1      ,1],
                    [1, 2,    1 , 1,     0.5 ,0.5      ,1]
                ]
                
                for(var a=0;a<array.length;a++){
                    var tmpSquare = {
                        "startOddHome":array[a][2]/7,
                        "startOddAway":array[a][3]/7,
                        "endOddHome":array[a][4]/7,
                        "endOddAway":array[a][5]/7,
                        "startPointDiff":array[a][0]/7,
                        "endPointDiff":array[a][1]/7,
                        "rangeTime":array[a][6]/7
                    }
                    var tmp = {
                        "kVal":kVal,
                        "sliceSize":sliceSize,
                        "brenchMark":brenchMark,
                        "weightMatrix":tmpSquare
                    }
                    kValArr.push(tmp)
                }
        /*
            }
            
        }*/
    }
      
        await Promise.all(kValArr.map(async (tmp) => {
            console.log("st "+ tmp["kVal"] + " "+ tmp["kVal"]+ " "+tmp["brenchMark"] + " " +JSON.stringify(tmp["weightMatrix"]))
            var param = await tuneParameter(dataList,8, calculateDate , tmp["kVal"],10,tmp["sliceSize"],tmp["brenchMark"], tmp["weightMatrix"])
            resultPush.push(param)
        }));
        console.log("end "+resultPush.length)
       // return []
    
    var bestCase = resultPush.sort(function(a, b) {
        var keyA = a.diff,
        keyB = b.diff;
        // Compare the 2 dates
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
    })
    
    console.log("----")
    console.log("best Case")
    console.table(bestCase)
    console.log("----")
    
    return bestCase[0]
    

}

async function getTotalResultDate(startDate){
    var totalResult = []
    for(var i=0;i<10;i++){
        var matchDate = bcUtils.generateDateWithStart(startDate,i)
        data = await getParameter(matchDate)
        totalResult.push(data)
    }
    console.table(totalResult)
    fs.writeFileSync("result.json", JSON.stringify(totalResult,null,2))
}
//getTotalResultDate("20201220")

async function getResult(){
    let ftUtils = new filterUtils()
    let dataList = ftUtils.getUpdateData()
    var kVal = 5.5
    var sliceSize =8
    var brench = 0.45


    var array = [
        
        [1  , 1,    1 , 1,     1 , 1     , 1]
       /*
        [2  , 1,   0.5,0.5,    1 , 1      ,1],
        */
        //[1  , 1,     1,  1,  0.5 , 0.5    ,2]
      /*
        [1  , 1,   0.5,0.5,    1 , 1      ,2]

        [1  , 1,     1,  1,  0.5 , 0.5    ,2],
        [0.5, 2,    1 , 1,     1 , 1      ,0.5],
        [1, 2,    0.5 , 0.5,     1 , 1      ,1],
        [1, 2,    1 , 1,     0.5 ,0.5      ,1]
        */
    ]
    

    var tmpSquare = {
        "startOddHome":array[0][2]/7,
        "startOddAway":array[0][3]/7,
        "endOddHome":array[0][4]/7,
        "endOddAway":array[0][5]/7,
        "startPointDiff":array[0][0]/7,
        "endPointDiff":array[0][1]/7,
        "rangeTime":array[0][6]/7
    }
    var param = await tuneParameter(dataList,2,"20201220", kVal,10,sliceSize,brench,
    tmpSquare
    )
    console.table([param])

}
getResult()