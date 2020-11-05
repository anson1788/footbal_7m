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

    calculateResultAsianOdd(dataList, betOn="上"){

        var count = {
                        "輸":0,
                        "輸半":0,
                        "走":0,
                        "贏半":0,
                        "贏":0,
                        "total":0
                    }

        for(var i=0;i<dataList.length;i++){
            //console.log(JSON.stringify(dataList[i]))

            var startHKJCOdd = dataList[i]["OddData"][0]["香港马会"]["start"]["point"]
            var endHKJCOdd = dataList[i]["OddData"][0]["香港马会"]["end"]["point"]
            if(typeof(dataList[i].betOn)!=="undefined"){
                betOn = dataList[i].betOn
            }
            dataList[i].betOn = betOn
            
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
            dataList[i].betOn = domainant + "/"+betOn

            var oddIdx = this.getOddIdx(endHKJCOdd)
            var oddDis = this.getAsianOdd(oddIdx)
            var firstOdd = parseFloat(oddDis.split("/")[0])
            var secondOdd =  parseFloat(oddDis.split("/")[0])
            if(oddDis.split("/").length>1){
                secondOdd = parseFloat(oddDis.split("/")[1])
            }
            

          

            var hfScore = parseFloat(dataList[i]["HomeFScore"])
            var afScore = parseFloat(dataList[i]["AwayFScore"])

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
                dataList[i].res = "贏"
            }else if(firstHalf+secondHalf == -2 ){
                dataList[i].res = "輸"
            }else if(firstHalf == 0  && secondHalf == 0 ){
                dataList[i].res = "走"
            }else if(firstHalf + secondHalf == 1 ){
                dataList[i].res = "贏半"
            }else if(firstHalf + secondHalf == -1 ){
                dataList[i].res = "輸半"
            }
            count[dataList[i].res] = count[dataList[i].res] +1
            count["total"] = count["total"] +1
        }

        count["p"] = (count["贏"]*0.9 + count["贏半"] * 0.4 - count["輸"] - count["輸半"]*0.5 )/count["total"] * 10
        return [dataList,count]
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

}
module.exports = dataCommomClass