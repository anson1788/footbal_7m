
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

    getOddIdx(){
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
        
        for(var i=0;i<dataList.length;i++){
            var totalBroker = 0 
            var oddChange = 0
            var oddData = dataList[i].OddData[0];
            var upOrDown = 0
            for(var broker in oddData){   
                totalBroker ++
                var startPoint = this.getOddIdx(oddData[broker]["start"]["point"])
                var endPoint = this.getOddIdx(oddData[broker]["end"]["point"])
                if(Math.abs(endPoint-startPoint)==2){
                    oddChange ++ 
                    if(endPoint-startPoint==2){
                        upOrDown = 1
                    }else if(endPoint-startPoint==-2){
                        upOrDown = -1
                    }
                }
            }

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