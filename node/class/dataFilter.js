const { parse } = require("dashdash");
const dataCommonClass = require('./dataCommonClass.js')
class dataFilter extends dataCommonClass{


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


    extraSimilarMatch(match,dataList){
        if(typeof( match["OddData"])=="undefined") {
            console.log("no oddData "+match.id)
            return []
        }
        if(match["OddData"].length <=0 ) {
            // console.log("non hkjc match "+match.id)
             return []
         }
        if(typeof( match["OddData"][0]["香港马会"])=="undefined") {
           // console.log("non hkjc match "+match.id)
            return []
        }
        var rtn = []
        for(var i=0;i<dataList.length;i++){
            if(dataList[i].id == match.id )continue
            if(typeof( dataList[i]["OddData"])=="undefined") continue
            var pastMatch = dataList[i]
            var total = 0
            var brokerMatch = 0 
            for(var broker in pastMatch["OddData"][0]){   
                total ++
                if(broker=="香港马会"){
                   // continue
                }else{
                  //  console.log(pastMatch.id + " "+ broker )
                    if(this.matchHKJCPointBroker(match,pastMatch,false,broker)){
                        brokerMatch ++
                    }
                }
            }
            
            if(this.matchHKJCPointBroker(match,pastMatch,false,"香港马会") && 
            brokerMatch >total - 6
            ){
                dataList[i].hkjcOdd = dataList[i].OddData[0]["香港马会"]["end"]["point"]                  
                delete dataList[i].OddData
                delete dataList[i].url
                delete dataList[i].HomeHScore
                delete dataList[i].AwayHScore    
                rtn.push(dataList[i])
            }

        }

        return rtn
    }

    matchHKJCPointBroker(crt,past,isCompareOdd, broker){
        if(typeof(past["OddData"][0][broker])=="undefined") return false
        if(typeof(past["OddData"][0][broker]["start"])=="undefined") return false
        if(typeof(crt["OddData"][0][broker])=="undefined") return false
        if(
        crt["OddData"][0][broker]["start"]["point"]==past["OddData"][0][broker]["start"]["point"] &&
        crt["OddData"][0][broker]["end"]["point"]==past["OddData"][0][broker]["end"]["point"]
        ){
            
            if(isCompareOdd){
                /*
                console.log("--- "+crt.id+ " "+ past.id)
                console.log(crt["OddData"][0][broker]["start"]["home"] + " " +this.oddPos(crt["OddData"][0][broker]["start"]["home"]))
                console.log(past["OddData"][0][broker]["start"]["home"] + " " +this.oddPos(past["OddData"][0][broker]["start"]["home"]))
                console.log(crt["OddData"][0][broker]["end"]["home"] + " " +this.oddPos(crt["OddData"][0][broker]["end"]["home"]))
                console.log(past["OddData"][0][broker]["end"]["home"] + " " +this.oddPos(past["OddData"][0][broker]["end"]["home"]))
                */
                /*
                if(
                    (parseFloat(crt["OddData"][0][broker]["start"]["home"]) - parseFloat(crt["OddData"][0][broker]["end"]["home"]) > 0.07 &&
                    parseFloat(past["OddData"][0][broker]["start"]["home"])-parseFloat(past["OddData"][0][broker]["end"]["home"])> 0.07) 
                    ||
                    (parseFloat(crt["OddData"][0][broker]["start"]["home"]) - parseFloat(crt["OddData"][0][broker]["end"]["home"]) < -0.07 &&
                    parseFloat(past["OddData"][0][broker]["start"]["home"])-parseFloat(past["OddData"][0][broker]["end"]["home"]) < -0.07) 
                    
                    ){
                        return true
                    }else{
                        return false
                    }
                */
                
                if(
                Math.abs(parseFloat(crt["OddData"][0][broker]["start"]["home"])- parseFloat(past["OddData"][0][broker]["start"]["home"]) )<0.1&&
                Math.abs(parseFloat(crt["OddData"][0][broker]["end"]["home"])-parseFloat(past["OddData"][0][broker]["end"]["home"]))<0.1
                ){
                    return true
                }else{
                    return false
                }
            }else{
                return true
            }
        }else{
            return false
        }
    }
    matchHKJCPoint(crt,past,isCompareOdd){
        if(crt["OddData"][0]["香港马会"]["start"]["point"]==past["OddData"][0]["香港马会"]["start"]["point"] &&
        crt["OddData"][0]["香港马会"]["end"]["point"]==past["OddData"][0]["香港马会"]["end"]["point"]
        ){

            if(isCompareOdd){
                if(this.oddPos(crt["OddData"][0]["香港马会"]["start"]["home"])==this.oddPos(past["OddData"][0]["香港马会"]["start"]["home"]) &&
                this.oddPos(crt["OddData"][0]["香港马会"]["end"]["home"])==this.oddPos(past["OddData"][0]["香港马会"]["end"]["home"]) &&
                this.oddPos(crt["OddData"][0]["香港马会"]["start"]["away"])==this.oddPos(past["OddData"][0]["香港马会"]["start"]["away"]) &&
                this.oddPos(crt["OddData"][0]["香港马会"]["end"]["away"])==this.oddPos(past["OddData"][0]["香港马会"]["end"]["away"]) 
                ){
                    return true
                }else{
                    return false
                }
            }else{
                return true
            }
        }else{
            return false
        }
    }

    extraMatchFeature(match){
        if(typeof( match["OddData"])=="undefined") {
            return {}
        }
        if(typeof( match["OddData"][0]["香港马会"])=="undefined") {
            return {}
        }
        var OddData = match["OddData"][0]
        var rtn = {
            "hkjcSOddP":OddData["香港马会"]["start"]["point"],
            "hkjcEOddP":OddData["香港马会"]["end"]["point"]
        }

        var oddPoint = {"main":[],"sec":[],"diff":[]}
        for(var broker in OddData){   
            if(broker == "香港马会") continue
            /*
            if(OddData[broker]["start"]["point"]){

            }*/
            if(OddData[broker]["start"]["point"]){

            }
        }
        var total = 0
        var matchPoint = 0
        var OddData = match.OddData[0];
        return rtn
    }


    addMatchResult(datalist){

    }
    isEmptyDic(dic){
        var num = 0
        for(var id in dic){   
            num ++ 
        }
        if(num==0){
            return true
        }else{
            return false
        }
    }

    lemonformula(dataList){
        var rtn = []
        for(var i=0;i<dataList.length;i++){
            if(typeof( dataList[i]["OddData"])=="undefined") continue
            var OddData = dataList[i].OddData[0];
            if(typeof( dataList[i]["OddData"][0]["易胜博"])=="undefined") continue
            if(typeof( dataList[i]["OddData"][0]["韦德"])=="undefined") continue
            var easyOdd = OddData["易胜博"]["start"]["point"] 
            var waiOdd = OddData["韦德"]["start"]["point"] 
            if(!waiOdd.includes("受") && !easyOdd.includes("受")){
                if(this.getOddIdx(waiOdd)-this.getOddIdx(easyOdd)==1){
                    console.log("http://vip.win007.com/AsianOdds_n.aspx?id="+dataList[i].id)
                    dataList[i].hkjcOdd = dataList[i].OddData[0]["香港马会"]["end"]["point"]                  
                    delete dataList[i].OddData
                    delete dataList[i].url
                    delete dataList[i].HomeHScore
                    delete dataList[i].AwayHScore
                 
                    rtn.push(dataList[i])
                }
            }
        }
        return rtn
    }


}
module.exports = dataFilter