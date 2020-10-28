
class dataFilter {

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
            "受让两球半/三球","受让两球半","受让两球/两球半","受让两球", "受让球半/两球","受让球半","受让一球/球半","受让一球","受让一球/球半","受让一球","受让半球/一球","受让半球","受让平手/半球",
            "平手","平手/半球","半球","半球/一球","一球","一球/球半","球半","球半/两球","两球","两球/两球半","两球半","两球半/三球"
        ]
        for(var i=0;i<Arr.length;i++){
            if(_name==Arr[i]){
                return i
            }
        }
        return -1
    }

    lookUpTwoMatch(dataList){
        var rtn = []
        for(var i=0;i<dataList.length;i++){
            var totalBroker = 0 
            var oddChange = 0
            if(typeof( dataList[i]["OddData"])=="undefined") continue
            var oddData = dataList[i].OddData[0];
            var upOrDown = 0
            var isHome = true

            for(var broker in oddData){   
                totalBroker ++
                var startPoint = this.getOddIdx(oddData[broker]["start"]["point"])
                var endPoint = this.getOddIdx(oddData[broker]["end"]["point"])
                if(oddData[broker]["start"]["point"].includes("受让") || 
                oddData[broker]["end"]["point"].includes("受让")){
                    isHome = false
                }
                if(Math.abs(endPoint-startPoint)>=2){
                    oddChange ++ 
                    if(endPoint-startPoint==2){
                        upOrDown +=2
                    }else if(endPoint-startPoint==-2){
                        upOrDown -=2
                    }
                }
            
                
            }
            if(totalBroker-3<oddChange){
                if(upOrDown/oddChange > 0 && isHome){
                    dataList[i].trend = "升"
                    dataList[i].dominant = "主"
                }else if(upOrDown/oddChange < 0 && isHome){
                    dataList[i].trend = "降"
                    dataList[i].dominant = "主"
                }else if(upOrDown/oddChange < 0 && !isHome){
                    dataList[i].trend = "升"
                    dataList[i].dominant = "客"
                }else if(upOrDown/oddChange > 0 && !isHome){
                    dataList[i].trend = "降"
                    dataList[i].dominant = "客"
                }else{
                   // console.log(upOrDown/oddChange)
                }

                var homeOdd = this.oddPos(oddData["香港马会"]["end"]["home"]) + "/" +oddData["香港马会"]["end"]["home"]
                var awayOdd = this.oddPos(oddData["香港马会"]["end"]["away"]) + "/" +oddData["香港马会"]["end"]["away"]
                if(isHome){
                    dataList[i].upOdd = homeOdd
                    dataList[i].downOdd = awayOdd
                }else{
                    dataList[i].upOdd = awayOdd
                    dataList[i].downOdd = homeOdd
                }
                dataList[i].hkjcOdd = oddData["香港马会"]["end"]["point"]
                
                delete dataList[i].OddData
                delete dataList[i].history
                delete dataList[i].url
                delete dataList[i].league
                delete dataList[i].home
                delete dataList[i].away
                delete dataList[i].matchData
                delete dataList[i].HomeHScore
                delete dataList[i].AwayHScore
                if(dataList[i].trend == "降" &&  dataList[i].dominant.includes("客") ){
                    if(upOrDown!=0){   
                        console.log("http://vip.win007.com/AsianOdds_n.aspx?id="+dataList[i].id)
                        rtn.push(dataList[i])
                    }
                }
            }

        }

        return rtn
    }

    oddPos(_dd){
        if(parseFloat(_dd)>1.0){
            return "高"
        }else if(parseFloat(_dd)<=1.0 && parseFloat(_dd) >=0.8){
            return "中"
        }else {
            return "低"
        }
    }
    customFilter(dataList){
        var rtnArr = []
        for(var i=0;i<dataList.length;i++){
            var totalBroker = 0 
            var oddChange = 0
            var oddData = dataList[i].OddData[0];
            var upOrDown = 0
            for(var broker in oddData){   
                totalBroker ++
                var startPoint = oddData[broker]["start"]["point"]
                var endPoint = oddData[broker]["end"]["point"]
                //console.log(startPoint)
                if(startPoint=='半球/一球' || startPoint=='受让半球/一球'){
                    oddChange++
                }
                if(endPoint=='半球/一球' || endPoint=='受让半球/一球'){
                    upOrDown++
                }
                /*
                var endPoint = getOddIdx(DiffOdd[broker]["end"]["point"])
                if(Math.abs(endPoint-startPoint)==2){
                    oddChange ++ 
                    if(endPoint-startPoint==2){
                        upOrDown = 1
                    }else if(endPoint-startPoint==-2){
                        upOrDown = -1
                    }
                }*/

            }
            if(oddChange==5 && upOrDown == totalBroker){
               // console.log("http://vip.win007.com/AsianOdds_n.aspx?id="+dataList[i].id)
                rtnArr.push(dataList[i])
            }

        }
        return rtnArr
    }


    
}
module.exports = dataFilter