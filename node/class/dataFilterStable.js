const bfWinUtils = require('./dataFilter.js')
var fs = require('fs');

class dataFilterStable extends bfWinUtils{

  matchChecker(dataList){
    /*
    var targetData = this.oneGoalOdd(dataList)
    console.table(targetData)
    */
    var msg = ""
    /* 
    for(var i=0;i<targetData.length;i++){
            msg += "oneGoalOdd" + targetData[i].home +" vs "+targetData[i].away + " "+" "+targetData[i].hkjcOdd + " 主 " + targetData[i].betOdd
    }

    targetData = this.halfToZero(styList)
    console.table(targetData)
    
    for(var i=0;i<targetData.length;i++){
        msg += "halfToZero" + targetData[i].home +" vs "+targetData[i].away + " "+" "+targetData[i].hkjcOdd + " 客 " + targetData[i].betOdd
    }
    */



    /*
     初盤 ＝終盤 ＝平手盤
     主隊 降水 >0.07
     */

    var targetData = this.samePointOddSwitchHomeDown(dataList)
    console.table(targetData)
    
    for(var i=0;i<targetData.length;i++){
        msg += "[初平終平 主降水]" + targetData[i].home +" vs "+targetData[i].away + " "+" (盤:"+targetData[i].hkjcOdd + " 買:主) " + targetData[i].endHomePoint + "\n"
    }


    var matchData = this.similarMatchChecker(dataList)
    msg += matchData[1]

    return [msg,matchData[2]]
  }

  similarMatchChecker(matchList){
    var rawdata = fs.readFileSync("oddBook.json");
    let pastList = JSON.parse(rawdata)
    var betArr = []
    var tgLog = ""
    for(var i=0;i<matchList.length;i++){
       var match = matchList[i]
       var OddData = match.OddData
       var feature = this.extraSimilarMatch(match,pastList)
       if(feature.length>0){
          tgLog += match["home"] + " 對 "+ match["away"] +" "+match["id"]+"\n"
          for(var k=0;k<Math.min(feature.length,5);k++){
            tgLog +=   "http://vip.win007.com/AsianOdds_n.aspx?id="+ feature[k].id + "\n"
          }
          
          var calculator = this.calculateResultAsianOdd(feature)
          var resultList = calculator[0]
          var resultStat = calculator[1]
          var up = resultStat["p"]
          calculator = this.calculateResultAsianOdd(feature,"下")
          resultList = calculator[0]
          resultStat = calculator[1]
          var down = resultStat["p"]
       
          var t = up
          var buy = "上"
          if(down>up){
              t = down
              buy = "下"
          }
          var calBuy = buy
          if(buy=="上" && !OddData[0]["香港马会"]["end"]["point"].includes("受")){
            buy = "主/"+buy 
          }else if(buy=="上"){
              buy = "客/"+buy 
          }else if (!OddData[0]["香港马会"]["end"]["point"].includes("受")){
              buy = "客/"+buy 
          }else{
              buy = "主/"+buy
          }

          if(t>1){
            //console.log("place bet")
            //console.log(crt[i]["home"] + " vs " + crt[i]["away"] + " "+buy + " "+ crt[i].id) 
            betArr.push(
                {
                    "home":match["home"],
                    "away":match["away"],
                    "id":match["id"],
                    "place":buy,
                    "calBuy":calBuy,
                    "buyOdd":OddData[0]["香港马会"]["end"]["point"],
                    "OddData":OddData
                }
            )
          }
       }else{
        tgLog += match["home"] + " 對 "+ match["away"] +" "+match["id"]+" 無數據"+"\n"
       }
    }
    console.table(betArr)

    var tgMsg = ""
    for(var j=0;j<betArr.length;j++){
      tgMsg +=  betArr[j]["home"] + " 對 " + betArr[j]["away"] + "["+betArr[j]["buyOdd"] + "]"+ " "+betArr[j]["place"] + "\n"
    }

    return [betArr,tgMsg,tgLog]

  }
}
module.exports = dataFilterStable