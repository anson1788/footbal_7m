const { parse } = require("dashdash");

class dataCommomClass {

    constructor() {

    }

    clearMatchName(name){
        name = this.replaceAll(name," ","")
        if(name.startsWith("[")){
            name = name.split("]")[1]
        }else{
            name = name.split("[")[0]
        }
        name = name.replace("(中)","")
        return name;
    }
    replaceAll(string, search, replace) {
        return string.split(search).join(replace);
    }

    isDicEmpty(obj) {
        return Object.keys(obj).length === 0;
    }
    getOddIdx(_name){
        var Arr = [
            "受让八球半/九球","受让八球半",
            "受让八球/八球半","受让八球",
            "受让七球半/八球","受让七球半",
            "受让七球/七球半","受让七球",
            "受让六球半/七球","受让六球半",
            "受让六球/六球半","受让六球",
            "受让五球半/六球","受让五球半",
            "受让五球/五球半","受让五球",
            "受让四球半/五球","受让四球半",
            "受让四球/四球半","受让四球",
            "受让三球半/四球","受让三球半",
            "受让三球/三球半","受让三球",
            "受让两球半/三球","受让两球半",
            "受让两球/两球半","受让两球", 
            "受让球半/两球","受让球半",
            "受让一球/球半","受让一球",
            "受让半球/一球","受让半球",
            "受让平手/半球",
            "平手","平手/半球",
            "半球","半球/一球",
            "一球","一球/球半",
            "球半","球半/两球",
            "两球","两球/两球半",
            "两球半","两球半/三球",
            "三球","三球/三球半",
            "三球半","三球半/四球",
            "四球","四球/四球半",
            "四球半","四球半/五球",
            "五球","五球/五球半",
            "五球半","五球半/六球",           
            "六球","六球/六球半",
            "六球半","六球半/七球",
            "七球","七球/七球半",
            "七球半","七球半/八球",
            "八球","八球/八球半",
            "八球半","八球半/九球"
        ]
        for(var i=0;i<Arr.length;i++){
            if(_name==Arr[i]){
                return i
            }
        }
        return -1
    }
    oddPos(_dd){
        if(parseFloat(_dd)>1.0){
            return "高"
        }else if(parseFloat(_dd)<=1.0 && parseFloat(_dd) >0.8){
            return "中"
        }else {
            return "低"
        }
    }
    getAsianOdd(idx){
        var Arr = [
            "-8.5/-9","-8.5",
            "-8/-8.5","-8",
            "-7.5/-8","-7.5",
            "-7/-7.5","-7",
            "-6.5/7","-6.5",
            "-6/6.5","-6",
            "-5.5/-6","-5.5",
            "-5/-5.5","-5",
            "-4.5/-5","-4.5",
            "-4/-4.5","-4",
            "-3.5/-4","-3.5",
            "-3/-3.5","-3",
            "-2.5/-3","-2.5",
            "-2/-2.5","-2", 
            "-1.5/-2","-1.5",
            "-1/-1.5","-1",
            "-0.5/-1","-0.5",
            "0/-0.5","0",
            "0/0.5","0.5",
            "0.5/1","1",
            "1/1.5", "1.5",
            "1.5/2","2",
            "2/2.5","2.5",
            "2.5/3","3",
            "3/3.5","3.5",
            "3.5/4","4",
            "4/4.5","4.5",
            "4.5/5", "5",
            "5/5.5","5.5",
            "5.5/6","6",
            "6/6.5","6.6",
            "6.5/7","7",
            "7/7.5", "7.5",
            "7.5/8","8",
            "8/8.5","8.5",
            "8.5/9"
        ]
        return Arr[idx]
    }


    deepClone(data){
        return JSON.parse(JSON.stringify(data))
    }


    calculateSingleResultBSOdd(rtnVal,broker, betOn = "大"){
        var workingList = this.deepClone(rtnVal)
        var count = {
            "輸":0,
            "輸半":0,
            "走":0,
            "贏半":0,
            "贏":0,
            "total":0
        }
        for(var i=0;i<workingList.length;i++){
            workingList[i].betOn = betOn
            var endOdd = workingList[i]["BSOddData"][0][broker]["end"]["point"]
            //console.log("here "+ endOdd)
            //var oddIdx = this.getOddIdx(endOdd)
            var oddDis = endOdd

            var firstOdd = parseFloat(oddDis.split("/")[0])
            var secondOdd =  parseFloat(oddDis.split("/")[0])

            if(oddDis.split("/").length>1){
                secondOdd = parseFloat(oddDis.split("/")[1])
            }
            
            var hfScore = parseFloat(workingList[i]["HomeFScore"])
            var afScore = parseFloat(workingList[i]["AwayFScore"])

            hfScore = hfScore + afScore
            
            var w1 = 0
            var w2 = 0
            var winodd = parseFloat(workingList[i]["BSOddData"][0][broker]["end"]["home"])
            if(betOn == "大"){
                if(hfScore > firstOdd){
                    w1 = 1
                }else if(hfScore<firstOdd){
                    w1 = -1
                }
                if(hfScore > secondOdd){
                    w2 = 1
                }else if(hfScore<secondOdd){
                    w2 = -1
                }
            }else{
                winodd = parseFloat(workingList[i]["BSOddData"][0][broker]["end"]["away"])
                if(hfScore < firstOdd){
                    w1 = 1
                }else if(hfScore > firstOdd){
                    w1 = -1
                }
                if(hfScore < secondOdd){
                    w2 = 1
                }else if(hfScore>secondOdd){
                    w2 = -1
                }
            }

            if(w1+w2 == 2 ){
                workingList[i].res = "贏"
            }else if(w1+w2 == -2 ){
                workingList[i].res = "輸"
            }else if(w1 == 0  && w2 == 0 ){
                workingList[i].res = "走"
            }else if(w1+w2 == 1 ){
                workingList[i].res = "贏半"
            }else if(w1+w2 == -1 ){
                workingList[i].res = "輸半"
            }

            count[workingList[i].res] = count[workingList[i].res] +1
            count["total"] = count["total"] +1
        }

        count["p"] = (count["贏"]*winodd + count["贏半"] * winodd/2 - count["輸"] - count["輸半"]*0.5 )/count["total"] * 10
       // count["win"] = (count["贏"]*2 + count["贏半"]) / (count["total"]*2)
        count["p"] = count["p"].toFixed(2)
        return [workingList,count]
    }


    calculateSingleResultAsianOdd(rtnVal,broker, betOn = "主"){
        var workingList = this.deepClone(rtnVal)
        var count = {
            "輸":0,
            "輸半":0,
            "走":0,
            "贏半":0,
            "贏":0,
            "total":0
        }
        for(var i=0;i<workingList.length;i++){
            workingList[i].betOn = betOn
            var endOdd = workingList[i]["OddData"][0][broker]["end"]["point"]
            //console.log("here "+ endOdd)
            var oddIdx = this.getOddIdx(endOdd)
            var oddDis = this.getAsianOdd(oddIdx)

            var firstOdd = parseFloat(oddDis.split("/")[0])
            var secondOdd =  parseFloat(oddDis.split("/")[0])

            if(oddDis.split("/").length>1){
                secondOdd = parseFloat(oddDis.split("/")[1])
            }
            
            var hfScore = parseFloat(workingList[i]["HomeFScore"])
            var afScore = parseFloat(workingList[i]["AwayFScore"])

            var adH1afScore = afScore + firstOdd
            var adH2afScore = afScore + secondOdd
            
            var w1 = 0
            var w2 = 0
            var winodd = parseFloat(workingList[i]["OddData"][0][broker]["end"]["home"])
            if(betOn == "主"){
                if(hfScore > adH1afScore){
                    w1 = 1
                }else if(hfScore<adH1afScore){
                    w1 = -1
                }
                if(hfScore > adH2afScore){
                    w2 = 1
                }else if(hfScore<adH2afScore){
                    w2 = -1
                }
            }else{
                winodd = parseFloat(workingList[i]["OddData"][0][broker]["end"]["away"])
                if(hfScore < adH1afScore){
                    w1 = 1
                }else if(hfScore > adH1afScore){
                    w1 = -1
                }
                if(hfScore < adH2afScore){
                    w2 = 1
                }else if(hfScore>adH2afScore){
                    w2 = -1
                }
            }

            if(w1+w2 == 2 ){
                workingList[i].res = "贏"
            }else if(w1+w2 == -2 ){
                workingList[i].res = "輸"
            }else if(w1 == 0  && w2 == 0 ){
                workingList[i].res = "走"
            }else if(w1+w2 == 1 ){
                workingList[i].res = "贏半"
            }else if(w1+w2 == -1 ){
                workingList[i].res = "輸半"
            }

            count[workingList[i].res] = count[workingList[i].res] +1
            count["total"] = count["total"] +1
        }

        count["p"] = (count["贏"]*winodd + count["贏半"] * winodd/2 - count["輸"] - count["輸半"]*0.5 )/count["total"] * 10
       // count["win"] = (count["贏"]*2 + count["贏半"]) / (count["total"]*2)
        count["p"] = count["p"].toFixed(2)
        return [workingList,count]
    }


    calculateResultAsianOdd(rtnVal, betOn="上"){
        var workingList = this.deepClone(rtnVal)
        var count = {
                        "輸":0,
                        "輸半":0,
                        "走":0,
                        "贏半":0,
                        "贏":0,
                        "total":0
                    }

        for(var i=0;i<workingList.length;i++){
            //console.log(JSON.stringify(dataList[i]))

            var startHKJCOdd = workingList[i]["OddData"][0]["香港马会"]["start"]["point"]
            var endHKJCOdd = workingList[i]["OddData"][0]["香港马会"]["end"]["point"]
            
            if(typeof(workingList[i].betOn)!=="undefined"){
                betOn = workingList[i].betOn
            }
            workingList[i].betOn = betOn
            
            var domainant = ""
            if(endHKJCOdd=="平手"&& startHKJCOdd=="平手" ){
                domainant = "主"
            }else if(endHKJCOdd=="平手"){
                if(!startHKJCOdd.includes("受让")){
                    domainant = "主"
                }else{
                    domainant = "客"
                }
            }else if(!endHKJCOdd.includes("受让")){
                domainant = "主"
            }else{
                domainant = "客"
            }
            workingList[i].betOn = domainant + "/"+betOn

            var oddIdx = this.getOddIdx(endHKJCOdd)
            var oddDis = this.getAsianOdd(oddIdx)
            var firstOdd = parseFloat(oddDis.split("/")[0])
            var secondOdd =  parseFloat(oddDis.split("/")[0])
            if(oddDis.split("/").length>1){
                secondOdd = parseFloat(oddDis.split("/")[1])
            }
            

          

            var hfScore = parseFloat(workingList[i]["HomeFScore"])
            var afScore = parseFloat(workingList[i]["AwayFScore"])

            var firstHalf = -1
            var secondHalf = -1
            if(betOn=="上"){
                if(hfScore - firstOdd > afScore){
                    firstHalf = 1
                }else if (hfScore - firstOdd == afScore){
                    firstHalf = 0
                }

                if(hfScore - secondOdd > afScore){
                    secondHalf = 1
                }else if (hfScore - secondOdd == afScore){
                    secondHalf = 0
                }
            }else{
                if(hfScore - firstOdd < afScore){
                    firstHalf = 1
                }else if (hfScore - firstOdd == afScore){
                    firstHalf = 0
                }

                if(hfScore - secondOdd < afScore){
                    secondHalf = 1
                }else if (hfScore - secondOdd == afScore){
                    secondHalf = 0
                }
            }
            if(firstHalf+secondHalf == 2 ){
                workingList[i].res = "贏"
            }else if(firstHalf+secondHalf == -2 ){
                workingList[i].res = "輸"
            }else if(firstHalf == 0  && secondHalf == 0 ){
                workingList[i].res = "走"
            }else if(firstHalf + secondHalf == 1 ){
                workingList[i].res = "贏半"
            }else if(firstHalf + secondHalf == -1 ){
                workingList[i].res = "輸半"
            }
            count[workingList[i].res] = count[workingList[i].res] +1
            count["total"] = count["total"] +1
        }

        count["p"] = (count["贏"]*0.9 + count["贏半"] * 0.4 - count["輸"] - count["輸半"]*0.5 )/count["total"] * 10
        count["win"] = (count["贏"]*2 + count["贏半"]) / (count["total"]*2)
        count["win"] = count["win"].toFixed(2)
        return [workingList,count]
    }

    calculateTotalWinLost(dataList){
        var count = {
            "輸":0,
            "輸半":0,
            "走":0,
            "贏半":0,
            "贏":0,
            "total":0
        }
        for(var i=0;i<dataList.length;i++){
            count["total"] = count["total"] + 1
            count[dataList[i].res] = count[dataList[i].res] + 1
        }
        count["p"] = (count["贏"]*0.9 + count["贏半"] * 0.4 - count["輸"] - count["輸半"]*0.5 )

        return count
    }


    isValidateMatch(match){
        var rtnVal = true
        if(typeof( match["OddData"])=="undefined") {
           return false
        }
        if(match["OddData"].length <=0 ) {
            return false
        }
        if(typeof( match["OddData"][0]["香港马会"])=="undefined") {
            return false
        }
        return true
    }



  oddPerMap(matchOdd){
    var tmp = {}

    tmp["Shome"] = parseFloat(matchOdd["start"]["home"])/(parseFloat(matchOdd["start"]["home"]) + parseFloat(matchOdd["start"]["away"]))
    tmp["Saway"] = parseFloat(matchOdd["start"]["away"])/(parseFloat(matchOdd["start"]["home"]) + parseFloat(matchOdd["start"]["away"]))
    tmp["Spoint"] = matchOdd["start"]["point"]

    tmp["Ehome"] = parseFloat(matchOdd["end"]["home"])/(parseFloat(matchOdd["end"]["home"]) + parseFloat(matchOdd["start"]["away"]))
    tmp["Eaway"] = parseFloat(matchOdd["end"]["away"])/(parseFloat(matchOdd["end"]["home"]) + parseFloat(matchOdd["start"]["away"]))
    tmp["Epoint"] = matchOdd["end"]["point"]

    return tmp
  }
  
  isTwoMatchSimilar(m1,m2){

    //console.log("m1 s:" +m1["Spoint"])
    //console.log("m1 e:" +m1["Epoint"])
    if(m1["Spoint"]==m2["Spoint"] && 
       m1["Epoint"]==m2["Epoint"] && 
       Math.abs(m1["Shome"] - m2["Shome"]) <0.05 &&
       Math.abs(m1["Ehome"] - m2["Ehome"]) <0.05 && 
       (
        (m1["Shome"] < m1["Ehome"] &&
        m2["Shome"] < m2["Ehome"] ) ||
        (m1["Shome"] > m1["Ehome"] &&
        m2["Shome"] > m2["Ehome"] ) 
       )
    ){
      return true
    }
    return false
  }
}
module.exports = dataCommomClass