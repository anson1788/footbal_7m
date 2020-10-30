
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
                if(Math.abs(endPoint-startPoint)==2){
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
                if(dataList[i].trend == "降" && 
                  dataList[i].dominant.includes("主") &&
                  dataList[i].hkjcOdd == "半球/一球"){
                    if(upOrDown!=0){   
                        console.log("http://vip.win007.com/AsianOdds_n.aspx?id="+dataList[i].id)
                        rtn.push(dataList[i])
                    }
                }
            }

        }

        return rtn
    }

    /*
    
    */
    findSimilarMatch(condition,dataList){
        var rtnArr = []
        for(var i=0;i<dataList.length;i++){
            if(typeof( dataList[i]["OddData"])=="undefined") continue
            
            var totalBroker = 0
            var startPointOddCourt = 0 
            var endPointOddCourt = 0
            for(var broker in oddData){   
                totalBroker ++
                if(oddData[broker]["start"]["point"]==condition["startOdd"]){
                    startPointOddCourt ++
                }
                if(oddData[broker]["end"]["point"]==condition["endOdd"]){
                    endPointOddCourt ++
                }
            }
        }
        return rtnArr
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
            if(oddChange==5 && upOrDown == totalBroker ){
               // console.log("http://vip.win007.com/AsianOdds_n.aspx?id="+dataList[i].id)
                rtnArr.push(dataList[i])
            }

        }
        return rtnArr
    }

    lowHalfAndUp(dataList){
        var rtnArr = []
        
        for(var i=0;i<dataList.length;i++){
            if(typeof( dataList[i]["OddData"])=="undefined") continue
            var oddData = dataList[i].OddData[0];
            var totalBroker = 0  
            var match = 0 
            for(var broker in oddData){   
                totalBroker++
                if(
                    !(this.oddPos(oddData[broker]["end"]["point"]).includes("受")) && 
                    !(this.oddPos(oddData[broker]["start"]["point"]).includes("受")) && 
                (this.oddPos(oddData[broker]["start"]["home"])=="中" ) && 
                (this.oddPos(oddData[broker]["end"]["home"])=="中" )&& 
                this.getOddIdx(oddData[broker]["end"]["point"])-this.getOddIdx(oddData[broker]["start"]["point"])>2 
                ){
                    match++;
                }
            }

                            
            delete dataList[i].OddData
            delete dataList[i].history
            delete dataList[i].url
           // delete dataList[i].league
            delete dataList[i].home
            delete dataList[i].away
            delete dataList[i].matchData
            delete dataList[i].HomeHScore
            delete dataList[i].AwayHScore
            dataList[i].fit = match
            if(match>7){
                rtnArr.push(dataList[i])
            }
        }
        return rtnArr 
    }
    
    oneGoalOdd(dataList){
        var rtnArr = []
        
        for(var i=0;i<dataList.length;i++){
            if(typeof( dataList[i]["OddData"])=="undefined") continue
            var oddData = dataList[i].OddData[0];
            var totalBroker = 0  
            


            var hkjcMatch = false
            var mcMatch = false
            var match = 0
            
        
            for(var broker in oddData){   
                totalBroker++
                if(broker=="澳门" && oddData["澳门"]["start"]["point"]=="受让平手/半球"
                && oddData["澳门"]["end"]["point"]=="受让平手/半球"){
                    mcMatch = true
                }
                if(broker=="香港马会" && oddData["香港马会"]["start"]["point"]=="受让平手/半球"
                    && oddData["香港马会"]["end"]["point"]=="受让平手/半球"){
                    hkjcMatch = true
                }
                if( broker!="香港马会"&&broker!="澳门"&& 
                oddData[broker]["start"]["point"]=="平手" && oddData[broker]["end"]["point"]=="受让平手/半球"){
                    match ++
                }
            }

            dataList[i].hkjcOdd = oddData["香港马会"]["end"]["point"]     
            dataList[i].betOdd = oddData["香港马会"]["end"]["home"]              
            delete dataList[i].OddData
            delete dataList[i].history
            delete dataList[i].url
           // delete dataList[i].league
            delete dataList[i].home
            delete dataList[i].away
            delete dataList[i].matchData
            delete dataList[i].HomeHScore
            delete dataList[i].AwayHScore
            dataList[i].fit = match
           
            if(hkjcMatch && mcMatch && match>10){
                console.log("http://vip.win007.com/AsianOdds_n.aspx?id="+dataList[i].id)
                rtnArr.push(dataList[i])
            }
        }
        return rtnArr 
    }
    


    halfToZero(dataList){
        var rtnArr = []
        
        for(var i=0;i<dataList.length;i++){
            if(typeof( dataList[i]["OddData"])=="undefined") continue
            var oddData = dataList[i].OddData[0];
            var totalBroker = 0  
            


            var hkjcMatch = false
            var mcMatch = false
            var match = 0
            
        
            for(var broker in oddData){   
                totalBroker++
                if(broker=="澳门" && oddData["澳门"]["start"]["point"]=="平手"
                && oddData["澳门"]["end"]["point"]=="平手"){
                    mcMatch = true
                }
                if(broker=="香港马会" && oddData["香港马会"]["start"]["point"]=="平手"
                    && oddData["香港马会"]["end"]["point"]=="平手"){
                    hkjcMatch = true
                }
                if( broker!="香港马会"&&broker!="澳门"&& 
                oddData[broker]["start"]["point"]=="受让平手/半球" && 
                oddData[broker]["end"]["point"]=="平手" ){
                    match ++
                }
            }

            dataList[i].hkjcOdd = oddData["香港马会"]["end"]["point"]     
            //dataList[i].betOdd = oddData["香港马会"]["end"]["home"]              
            delete dataList[i].OddData
            delete dataList[i].history
            delete dataList[i].url
           // delete dataList[i].league
            delete dataList[i].home
            delete dataList[i].away
           // delete dataList[i].matchData
            delete dataList[i].HomeHScore
            delete dataList[i].AwayHScore
            dataList[i].fit = match
           
            if(hkjcMatch && mcMatch && match>8){
                console.log("http://vip.win007.com/AsianOdds_n.aspx?id="+dataList[i].id)
                rtnArr.push(dataList[i])
            }
        }
        return rtnArr 
    }
    

    halfTohalf(dataList){
        var rtnArr = []
        
        for(var i=0;i<dataList.length;i++){
            if(typeof( dataList[i]["OddData"])=="undefined") continue
            var oddData = dataList[i].OddData[0];
            var totalBroker = 0  
            


            var hkjcMatch = false
            var mcMatch = false
            var match = 0
            var match2 = 0
            var all = 0
        
            for(var broker in oddData){   
                totalBroker++
                if(broker=="澳门" && oddData["澳门"]["start"]["point"]=="平手"
                && oddData["澳门"]["end"]["point"]=="平手/半球"){
                    mcMatch = true
                }
                if(broker=="香港马会" && oddData["香港马会"]["start"]["point"]=="平手"
                    && oddData["香港马会"]["end"]["point"]=="平手/半球"){
                    hkjcMatch = true
                }
                if( broker!="香港马会"&&broker!="澳门"&& 
                oddData[broker]["start"]["point"]=="受让平手/半球" && 
                oddData[broker]["end"]["point"]=="平手" ){
                    match ++
                }
                if( broker!="香港马会"&&broker!="澳门"&& 
                oddData[broker]["start"]["point"]=="受让平手/半球" && 
                oddData[broker]["end"]["point"]=="平手/半球" ){
                    match2 ++
                }
                if(oddData[broker]["end"]["point"]=="平手/半球"){
                    all++
                }
            }

            dataList[i].hkjcOdd = oddData["香港马会"]["end"]["point"]     
            //dataList[i].betOdd = oddData["香港马会"]["end"]["home"]              
            delete dataList[i].OddData
            delete dataList[i].history
            delete dataList[i].url
           // delete dataList[i].league
            delete dataList[i].home
            delete dataList[i].away
           // delete dataList[i].matchData
            delete dataList[i].HomeHScore
            delete dataList[i].AwayHScore
            dataList[i].fit = match
           
            if(hkjcMatch && mcMatch && match2>6 && all>totalBroker-2){
                console.log("http://vip.win007.com/AsianOdds_n.aspx?id="+dataList[i].id)
                rtnArr.push(dataList[i])
            }
        }
        return rtnArr 
    }

    highOdd(dataList){
        var rtnArr = []
        
        for(var i=0;i<dataList.length;i++){
            if(typeof( dataList[i]["OddData"])=="undefined") continue
            var oddData = dataList[i].OddData[0];
            var totalBroker = 0  
            


            var isMatch = 0
            var allMatch = 0
            for(var broker in oddData){   
                totalBroker++
                
                if(parseFloat(oddData[broker]["start"]["away"])-parseFloat(oddData[broker]["end"]["away"])>0.05){
                    isMatch ++
                }
                if(
                    oddData[broker]["start"]["point"]=="受让半球/一球"&&
                    oddData[broker]["end"]["point"]=="受让半球/一球"){
                    allMatch ++
                }
            }

            dataList[i].hkjcOdd = oddData["香港马会"]["end"]["point"]     
            //dataList[i].betOdd = oddData["香港马会"]["end"]["home"]              
            delete dataList[i].OddData
            delete dataList[i].history
            delete dataList[i].url
           // delete dataList[i].league
            delete dataList[i].home
            delete dataList[i].away
           // delete dataList[i].matchData
            delete dataList[i].HomeHScore
            delete dataList[i].AwayHScore
            //dataList[i].fit = match
           
            if(totalBroker-3<allMatch
            ){
                console.log("http://vip.win007.com/AsianOdds_n.aspx?id="+dataList[i].id)
                rtnArr.push(dataList[i])
            }
        }
        return rtnArr 
    }
    similarOdd(dataList){
        var rtnArr = []
        
        for(var i=0;i<dataList.length;i++){
            if(typeof( dataList[i]["OddData"])=="undefined") continue
            var oddData = dataList[i].OddData[0];
            var totalBroker = 0  
            


            var isMatch = 0
            var match = 0
            var match2 = 0
            var allMatch = 0

            var hkjcMatch = false
            var mcMatch = false
            for(var broker in oddData){   
                totalBroker++
                if(broker=="澳门" && oddData["澳门"]["start"]["point"]=="受让平手/半球"
                && oddData["澳门"]["end"]["point"]=="受让平手/半球"){
                    mcMatch = true
                }
                if(broker=="香港马会" && oddData["香港马会"]["start"]["point"]=="受让平手/半球"
                    && oddData["香港马会"]["end"]["point"]=="受让平手/半球"){
                    hkjcMatch = true
                }
                if( broker!="香港马会"&&broker!="澳门"&& 
                oddData[broker]["start"]["point"]=="受让平手/半球" && 
                oddData[broker]["end"]["point"]=="平手" ){
                    match ++
                }
                if( broker!="香港马会"&&broker!="澳门"&& 
                oddData[broker]["start"]["point"]=="受让平手/半球" && 
                oddData[broker]["end"]["point"]=="受让平手/半球" ){
                    match2 ++
                }
            }

            dataList[i].hkjcOdd = oddData["香港马会"]["end"]["point"]     
            //dataList[i].betOdd = oddData["香港马会"]["end"]["home"]              
            delete dataList[i].OddData
            delete dataList[i].history
            delete dataList[i].url
           // delete dataList[i].league
            delete dataList[i].home
            delete dataList[i].away
           // delete dataList[i].matchData
            delete dataList[i].HomeHScore
            delete dataList[i].AwayHScore
            //dataList[i].fit = match
           
            if(mcMatch && hkjcMatch  && match2<4 && match>6
            ){
                console.log("http://vip.win007.com/AsianOdds_n.aspx?id="+dataList[i].id)
                rtnArr.push(dataList[i])
            }
        }
        return rtnArr 
    }
    nochangeOdd(dataList){
        var rtnArr = []
        
        for(var i=0;i<dataList.length;i++){
            if(typeof( dataList[i]["OddData"])=="undefined") continue
            var oddData = dataList[i].OddData[0];
            var totalBroker = 0  
            var match = 0 
            var isUP = 0 
            var isDown = 0
            for(var broker in oddData){   
                totalBroker++
                if(oddData[broker]["start"]["point"]==oddData[broker]["end"]["point"] 
                 && !oddData[broker]["start"]["point"].includes("受让")  &&
                 oddData[broker]["start"]["point"] == "平手"
                ){
                    match++;
                    if( parseFloat(oddData[broker]["end"]["home"])- parseFloat(oddData[broker]["start"]["home"])>0.05){
                        isUP++;
                    }else{
                        isDown++
                    }
                }
               
            }

            dataList[i].hkjcOdd = oddData["香港马会"]["end"]["point"]                  
            delete dataList[i].OddData
            delete dataList[i].history
            delete dataList[i].url
           // delete dataList[i].league
            delete dataList[i].home
            delete dataList[i].away
            delete dataList[i].matchData
            delete dataList[i].HomeHScore
            delete dataList[i].AwayHScore
            dataList[i].fit = match
            dataList[i].home = "0"
            if(isUP>10){
                dataList[i].home = "1"
            }
            if(match>10 && (isUP>10)){
                console.log("http://vip.win007.com/AsianOdds_n.aspx?id="+dataList[i].id)
                rtnArr.push(dataList[i])
            }
        }
        return rtnArr 
    }



    samePointOddSwitchHomeDown(dataList){
        var rtnArr = []
        for(var i=0;i<dataList.length;i++){
            if(typeof( dataList[i]["OddData"])=="undefined") continue
            var total = 0
            var matchPoint = 0
            var OddData = dataList[i].OddData[0];
            for(var broker in OddData){   
                total ++
                var startOddPoint = OddData[broker]["start"]["point"]
                var startOddHome = OddData[broker]["start"]["home"]
                var startOddAway = OddData[broker]["start"]["away"]
                var endOddPoint = OddData[broker]["end"]["point"]
                var endOddHome = OddData[broker]["end"]["home"]
                var endOddAway = OddData[broker]["end"]["away"]

                /*
                if(startOddPoint==endOddPoint){
                    matchPoint ++
                }*/

                if(parseFloat(startOddHome)>parseFloat(endOddHome) && 
                   startOddPoint==endOddPoint){
                    matchPoint ++
                }
            }

            var hkjcStart = OddData["香港马会"]["start"]["home"] 
            var hkjcEnd = OddData["香港马会"]["end"]["home"] 
            dataList[i].hkjcOdd = OddData["香港马会"]["end"]["point"] 
            dataList[i].pointDiff = (parseFloat(hkjcStart) - parseFloat(hkjcEnd))
            dataList[i].startHomePoint = this.oddPos(hkjcStart) +"/"+hkjcStart
            dataList[i].endHomePoint = this.oddPos(hkjcEnd) +"/"+hkjcEnd

            if(matchPoint > total-4 && dataList[i].hkjcOdd =="平手" 
            && dataList[i].pointDiff>0.07
            ){
                dataList[i].hkjcOdd = OddData["香港马会"]["end"]["point"]                  
                delete dataList[i].OddData
                delete dataList[i].url
                delete dataList[i].HomeHScore
                delete dataList[i].AwayHScore                
                rtnArr.push(dataList[i])
            }
        }
        return rtnArr 
    }
}
module.exports = dataFilter