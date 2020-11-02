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
            "受让六球半/七球","受让七球半",
            "受让六球半/七球","受让七球",
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
            "两球半","两球半/三球"
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
            "两球半","两球半/三球"
        ]
        /*
        for(var i=0;i<Arr.length;i++){
            if(_name==Arr[i]){
                return i
            }
        }
        return -1
        */
       return 0
    }

    calculateResultAsianOdd(dataList, betOn="上"){
        for(var i=0;i<dataList.length;i++){
            var match = dataList[i]
            var startHKJCOdd = dataList[i]["OddData"][0]["start"]["point"]
            var endHKJCOdd = dataList[i]["OddData"][0]["end"]["point"]
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
            var firstOdd = parseFloat(oddDis.split["/"][0])
            var secondOdd = parseFloat(oddDis.split["/"][1])

            var matchArr = ["輸","輸半","走","贏半","贏"]

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
        }

        return dataList
    }
}
module.exports = dataCommomClass