const dataFilterSingleLogic = require('./dataFilterSingleLogic.js')
var fs = require('fs');
var moment = require('moment');

class dataFilterStable extends dataFilterSingleLogic{

  matchChecker(dataList){
   
    var msg = ""
    var tgLog = ""
    /*
     初盤 ＝終盤 ＝平手盤
     主隊 降水 >0.07
     */
    /*
    var targetData = this.samePointOddSwitchHomeDown(this.deepClone(dataList))
    console.table(targetData)
    

    for(var i=0;i<targetData.length;i++){
        msg += "[初平終平 主降水]" + targetData[i].home +" vs "+targetData[i].away + " "+" (盤:"+targetData[i].hkjcOdd + " 買:主) " + targetData[i].endHomePoint + "\n"
    }

    var Operation = [ {
            "method":"pointDropOddDrop00",
            "displayName":"[降盤跌水(平手盤)]"
          }]
    
    for(var i=0;i<Operation.length ;i++){
      var tmp = this.checkingLogic( Operation[i]["method"], this.deepClone(dataList))
      if(tmp.length==0){
        tgLog += Operation[i]["displayName"] + " no data match\n"
      }
      for(var j=0;j<tmp.length;j++){
        msg += Operation[i]["displayName"] +" "+ 
               tmp[i].home +" vs "+tmp[i].away + " "+ 
               " (盤:"+targetData[i].hkjcOddE + " 買:"+targetData[i].place+"/"+targetData[i].placeOdd +") " + "\n"
      }
    }*/


    var matchData = this.similarMatchAdvance(this.deepClone(dataList))
    msg += matchData[1]

    return [msg,matchData[2],tgLog]
  }
  similarMatchAdvance(matchList){
    var rawdata = fs.readFileSync("oddBook.json");
    let pastList = JSON.parse(rawdata)
    var betArr = []
    var tgLog = ""
    for(var i=0;i<matchList.length;i++){
        var match = matchList[i]
        console.log(match.home)
        var feature = this.extractSameOddMatch(match, this.deepClone(pastList))
        console.log(JSON.stringify(feature))

        var hkjcData = feature["hkjcData"] 
        var upSide = hkjcData["上"][1]
        var dwnSide = hkjcData["下"][1]
        tgLog += match["home"] + " 對 "+ match["away"] +" "+match["id"]+
         "["+upSide["p"] +"/"+ dwnSide["p"]+"/" + upSide["total"]+"]"
        if(parseFloat(upSide["p"])>0 || parseFloat(dwnSide["p"])>0){
          tgLog +=  "\n"
          var betData = {
            "home":match["home"],
            "away":match["away"],
            "id":match["id"],
            "buyOdd":match.OddData[0]["香港马会"]["end"]["point"],
            "up": upSide["p"],
            "down": dwnSide["p"]
          }
          if( parseFloat(upSide["p"])> parseFloat(dwnSide["p"]))
            {
              betData["oddVal"] = match.OddData[0]["香港马会"]["end"]["home"]
              betData["place"] = "主"
            }else{
              betData["oddVal"] = match.OddData[0]["香港马会"]["end"]["away"]
              betData["place"] = "客"
            }
            betArr.push(betData)
        }else{
          tgLog +=  "唔合理\n"
        }

        /*
        tgLog += match["home"] + " 對 "+ match["away"] +" "+match["id"]+
                 "["+feature["total"]+"/"+feature["up"] +"/"+ feature["down"]+"]"
               
        if(parseFloat(feature["total"])>7 && 
          (
            parseFloat(feature["up"])>0 ||
            parseFloat(feature["down"])>0
          )
        ){
            tgLog +=  "\n"
            var betData = {
                "home":match["home"],
                "away":match["away"],
                "id":match["id"],
                "buyOdd":match.OddData[0]["香港马会"]["end"]["point"],
                "up": feature["up"],
                "down": feature["down"],
                "total": feature["total"]
            }
            if( parseFloat(feature["up"])> parseFloat(feature["down"]))
            {
              betData["oddVal"] = match.OddData[0]["香港马会"]["end"]["home"]
              betData["place"] = "主"
            }else{
              betData["oddVal"] = match.OddData[0]["香港马会"]["end"]["away"]
              betData["place"] = "客"
            }
            betArr.push(betData)
        }else{
           tgLog +=  "唔合理\n"
        }*/
    }


    var tmpBet = this.saveOddResult(betArr)
    if(tmpBet[0].length>0 && tmpBet[1] == true){
      betArr = tmpBet
    }

    var tgMsg = ""
    for(var j=0;j<betArr.length;j++){
      tgMsg += betArr[j]["home"] + " 對 " + betArr[j]["away"] + 
              "["+betArr[j]["buyOdd"] + "]"+ " "+betArr[j]["place"] + "/"+betArr[j]["oddVal"] + "\n"
      tgMsg +=  "http://vip.win007.com/AsianOdds_n.aspx?id="+betArr[j].id+ "\n"
    }

    return [betArr,tgMsg,tgLog]

  }

  saveOddResult(betArr){
      try{
        var today =  moment().format('DD-MM-YYYY');
        var oddArr = []
        if (!fs.existsSync("oddBook/"+today+"/")){
          fs.mkdirSync("oddBook/"+today+"/");
        }
        if (fs.existsSync("oddBook/"+today+"/"+"placeBet.json")){
          oddArr = fs.readFileSync("oddBook/"+today+"/"+"placeBet.json");
        }
        
        var placeBetArr = []
        for(var i=0;i<betArr.length;i++){
          var isPlaced = false 
          for(var j=0;j<oddArr.length;j++){
             if(oddArr[j].id == betArr[i].id){
                isPlaced = true
             }
          }
          if(!isPlaced){
            betArr[i].time = moment().format('HH:mm');
            placeBetArr.push(betArr[i])
            oddArr.push(betArr[i])
          }
        }
        fs.writeFileSync("oddBook/"+today+"/"+"placeBet.json", JSON.stringify(oddArr,null,2))
        return [[],true]
      }catch(e){
        console.log("save match error")
        return [[],false]
      }
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
       if(feature.length>2){
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
          tgLog += "t : "+ t +"\n"
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

          if(t>0.3){
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
      tgMsg += "["+betArr[j].id+"]" +betArr[j]["home"] + " 對 " + betArr[j]["away"] + "["+betArr[j]["buyOdd"] + "]"+ " "+betArr[j]["place"] + "\n"
    }

    return [betArr,tgMsg,tgLog]

  }


   checkingLogic(type ,dataList){
        var rtnArr = []
        for(var i=0;i<dataList.length;i++){
            if(typeof( dataList[i]["OddData"])=="undefined") continue
            var OddData = dataList[i].OddData[0];
            var isAdd =false 
            if(type=="pointDropOddDrop00"){
              isAdd = this.pointDropOdDrop(OddData)
              if(isAdd==true){
                dataList[i].place="客"
                dataList[i].betOn="下"
              }
            }

            if(isAdd){ 
              if(dataList[i].place=="主"){
                dataList[i].placeOdd = OddData["香港马会"]["end"]["home"] 
              }else{
                dataList[i].placeOdd = OddData["香港马会"]["end"]["away"] 
              }
              delete dataList[i].url
              delete dataList[i].HomeHScore
              delete dataList[i].AwayHScore  
              delete dataList[i].history        
              rtnArr.push(dataList[i])
            }

        }

        return rtnArr 
   }


   matchingResultInList(crtResult, matchList){
      var changedMap = []
      for(var i=0;i<matchList.length;i++){
        if(typeof(matchList[i]["result"])!="undefined") continue
        var kIdx = -1
        for(var j=0;j<crtResult.length;j++){
          if(matchList[i].id == crtResult[k].id){
            kIdx = j
          }
        }
        if(kIdx == -1) continue
        if(!status.includes("完")) continue
         matchList[i].HomeFScore = crtResult[k]["HomeFScore"]
         matchList[i].AwayHScore = crtResult[k]["AwayFScore"]
         
         var oddKey = "home"
         if(!matchList[i]["place"]!="主"){
           oddKey = "away"
         }

         matchList[i].OddData = [
           {
             "hkjc":{
               "end":{
                 oddKey:{
                  "point": matchList[i]["buyOdd"]
                }
               }
             }
           }
         ]

         result = this.calculateSingleResultAsianOdd([matchList[i]],"hkjc",matchList[i]["place"])
         matchList[i].res = result[0][0].res
         changedMap.push(matchList[i])
      }
      return [matchList, changedMap]
   }

   calculateOddResult(crtResult){

    var tgResult = ""
    try{
      var today =  moment().format('DD-MM-YYYY');
      var oddArr = []
      if (!fs.existsSync("oddBook/"+today+"/")){
        fs.mkdirSync("oddBook/"+today+"/");
      }
      if (fs.existsSync("oddBook/"+today+"/"+"placeBet.json")){
        oddArr = fs.readFileSync("oddBook/"+today+"/"+"placeBet.json");
      }

      var yestersday = moment({ 
        year :moment().year(), 
        month :moment().month(), 
        day :moment().date()
        }).subtract(1, "days").format('DD-MM-YYYY');
       console.log(today+" "+yestersday)
       

      var lastDay = []
      if (!fs.existsSync("oddBook/"+yestersday+"/")){
        fs.mkdirSync("oddBook/"+yestersday+"/");
      }
      if (fs.existsSync("oddBook/"+yestersday+"/"+"placeBet.json")){
        lastDay = fs.readFileSync("oddBook/"+yestersday+"/"+"placeBet.json");
      }
      
      var resultLastDay = this.matchingResultInList(crtResult,lastDay)
      fs.writeFileSync("oddBook/"+yestersday+"/"+"placeBet.json", JSON.stringify(resultLastDay[0],null,2))


      var resultoday = this.matchingResultInList(crtResult,oddArr)
      fs.writeFileSync("oddBook/"+today+"/"+"placeBet.json", JSON.stringify(resultoday[0],null,2))


      if(resultLastDay[1].length>0 ||resultoday[1].length>0 ){
        var crt4HrList = []
        for(var i=0;i<lastDay.length;i++){
          lastDay[i].momentTime =  moment({ 
            year :yestersday.split("-")[2], 
            month :yestersday.split("-")[1], 
            day :yestersday.split("-")[0],
            hour :lastDay[i].time.split(":")[0], 
            minute : lastDay[i].time.split(":")[1]
            })
            var diff = calculatedDate.diff(lastDay[i].momentTime,"minutes")
            if(diff<120){
              crt4HrList.push(lastDay[i])
            }
        }

        for(var i=0;i<oddArr.length;i++){
            oddArr[i].momentTime =  moment({ 
              year :today.split("-")[2], 
              month :today.split("-")[1], 
              day :today.split("-")[0],
              hour :oddArr[i].time.split(":")[0], 
              minute : oddArr[i].time.split(":")[1]
              })
            var diff = calculatedDate.diff(oddArr[i].momentTime,"minutes")
            if(diff<120){
                crt4HrList.push(oddArr[i])
            }
        }

        for(var i=0;i<crt4HrList.length;i++){
          tgResult  += crt4HrList[i].home + " vs "+crt4HrList[i].away  + 
                      "("+crt4HrList[i].HomeFScore+":"+crt4HrList[i].AwayFScore+")"+
                      "["+crt4HrList[i].buyOdd+"/"+ crt4HrList[i].oddVal+"/"+crt4HrList[i].place+"]"+
                      crt4HrList[i].res + "\n" +
                      "http://vip.win007.com/AsianOdds_n.aspx?id="+crt4HrList[i].id+"\n"
        }
      }
       return tgResult
    }catch(e){
       console.log("calculateOddError")
       return "calculate Odd Error"
    }
   }
}
module.exports = dataFilterStable