const { parse } = require("dashdash");
const dataCommonClass = require('./dataCommonClass.js')
const Excel = require('exceljs')
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



    pointDropOddDrop00(OddData){
        var total = 0
        for(var broker in OddData){
            
        }
        return true
    }
    /*
    1 .OddData["香港马会"]["end"]["point"]=="平手"
       OddData["香港马会"]["start"]["point"]=="平手"
    2. !hkjcStart.includes("受") && !hkjcStart.includes("受")
    3. matchCondition > total-4 
    */
    pointDropOdDrop(dataList){
        var rtnArr = []
        for(var i=0;i<dataList.length;i++){
            if(typeof( dataList[i]["OddData"])=="undefined") continue
            var OddData = dataList[i].OddData[0];
            var total = 0

            var hkjcStart = OddData["香港马会"]["start"]["home"] 
            var hkjcEnd = OddData["香港马会"]["end"]["home"] 
            var isMain = false 
            var matchCondition = 0
            
                for(var broker in OddData){
                    total ++
                    var startOddPoint = OddData[broker]["start"]["point"]
                    var startOddHome = parseFloat(OddData[broker]["start"]["home"])
                    var startOddAway = parseFloat(OddData[broker]["start"]["away"])
                    var endOddPoint = OddData[broker]["end"]["point"]
                    var endOddHome = parseFloat(OddData[broker]["end"]["home"])
                    var endOddAway = parseFloat(OddData[broker]["end"]["away"])

                    if(startOddPoint.includes("受")){
                        var homeOddPerStart =  startOddAway /(startOddHome + startOddAway)
                        var homeOddPerEnd =  endOddAway /(endOddHome + endOddAway)
                        if(homeOddPerStart>homeOddPerEnd &&
                            this.getOddIdx(endOddPoint)-this.getOddIdx(startOddPoint)==1
                            ){
                            matchCondition++
                        }
                    }

                }
            

            if(matchCondition > total-4  && OddData["香港马会"]["start"]["point"] !=OddData["香港马会"]["end"]["point"]  
            ){                
                dataList[i].hkjcOddS = OddData["香港马会"]["start"]["point"]  
                dataList[i].hkjcOddE = OddData["香港马会"]["end"]["point"]  
                //delete dataList[i].OddData
                delete dataList[i].url
                delete dataList[i].HomeHScore
                delete dataList[i].AwayHScore  
                delete dataList[i].history                 
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


    extractSameBSOddMatch(match,dataList){
        if(!this.isValidateMatch(match)){
            return {}
        }
        var crtOdd = match["BSOddData"][0]
        var tmp = {}
        for(var broker in crtOdd){
            var tmpList = this.singleBSOddSimilarOddList(broker,match,dataList)
            var calculatorUp = this.calculateSingleResultBSOdd(tmpList,broker)
            var calculatorDown = this.calculateSingleResultBSOdd(tmpList,broker,"細")
            tmp[broker] = {
                                "上":calculatorUp,
                                "下":calculatorDown
            }
        }
        if(!this.isDicEmpty(tmp)){
            var upCount = 0
            var dwnCount = 0
            var total = 0
            var upbroker = ""
            var dwnbroker = ""

            for(var broker in tmp){
                if(tmp[broker]["上"][0].length >8){
                    var upP = tmp[broker]["上"][1]["p"]
                    var dwnP = tmp[broker]["下"][1]["p"]
                    total++
                    
                    if(upP>dwnP && upP>0.2){
                        if(tmp[broker]["上"][1]["贏"]/ (tmp[broker]["上"][1]["贏"]+tmp[broker]["上"][1]["輸"]) > 0.65){
                            upCount ++
                            upbroker += tmp[broker]["上"][0][0]["oddE"]+"/"+broker + " ,"
                        }
                        //console.table([tmp[broker]["上"][1]])
                    }
                    if(dwnP>upP && dwnP>0.2){
                        if(tmp[broker]["下"][1]["贏"]/ (tmp[broker]["下"][1]["贏"]+tmp[broker]["下"][1]["輸"]) > 0.65){
                            dwnCount ++
                            dwnbroker += tmp[broker]["下"][0][0]["oddE"]+"/"+broker + " ,"
                        }
                       // console.table(tmp[broker]["下"][0])
                       // console.table([tmp[broker]["下"][1]])
                    }
                }
            }
            
            var up = 0
            var upbroker = ""
            var down = 0
            var downbroker = ""
            var total = 0
            var totalUp = 0
            var totalDown = 0
            var totalMMM = 0
            for(var broker in tmp){
                if(parseFloat(tmp[broker]["上"][1]["p"])>parseFloat(tmp[broker]["下"][1]["p"])){
                    up ++
                    upbroker += broker + " \n"
                }else if(parseFloat(tmp[broker]["上"][1]["p"])<parseFloat(tmp[broker]["下"][1]["p"])){
                    down ++
                    downbroker+= broker + " \n"
                }
                    total ++
                    console.table( "---"+broker+"----")
                    if(broker=="香港马会"){
                        console.table(tmp[broker]["上"][0])
                        console.table([tmp[broker]["上"][1]])
                        //console.table(tmp[broker]["下"][0])
                        console.table([tmp[broker]["下"][1]])
                    }
                    if(parseFloat(tmp[broker]["上"][1]["total"])>100){
                        totalMMM ++
                        totalUp = totalUp + parseFloat(tmp[broker]["上"][1]["p"])
                    }
                    if(parseFloat(tmp[broker]["下"][1]["total"])>100){
                        totalDown = totalDown + parseFloat(tmp[broker]["下"][1]["p"])
                    }
            }
            console.table([{
                "total":total,
                "up":up,
                "down":down,
                "totalUp":(totalUp).toFixed(2),
                "totalDwn":(totalDown).toFixed(2),
            }])
            return {
                "total":total,
                "up":upCount,
                "down":dwnCount,
                "upbroker":upbroker,
                "downbroker":dwnbroker,
                "hkjcData":tmp["香港马会"]
            }
        }

        return tmp
    }
    singleBSOddSimilarOddList(broker, match, dataList){
        var workingList = this.deepClone(dataList)
        var rtnVal =[]
        var crtOdd = match["BSOddData"][0]
        for(var i=0;i<workingList.length;i++){
            if(workingList[i].id == match.id )continue
            if(!this.isValidateMatch(workingList[i])) continue
            var pastMatchOdd = workingList[i]["BSOddData"][0]
            if( typeof(pastMatchOdd[broker])!="undefined"){
                var crtOddPer = this.oddPerMap(crtOdd[broker])
                var pastMatchOddPer = this.oddPerMap(pastMatchOdd[broker])
            
                if(this.isTwoMatchSimilarBS(crtOddPer,pastMatchOddPer) ){
                    rtnVal.push(Object.assign({},workingList[i]))
                    rtnVal[rtnVal.length-1]["homeS"] = workingList[i]["BSOddData"][0][broker]["start"]["home"]
                    rtnVal[rtnVal.length-1]["homeE"] = workingList[i]["BSOddData"][0][broker]["end"]["home"]
                    rtnVal[rtnVal.length-1]["homeSP"] = pastMatchOddPer["Shome"]
                    rtnVal[rtnVal.length-1]["homeEP"] = pastMatchOddPer["Ehome"]
                    rtnVal[rtnVal.length-1]["oddE"] = workingList[i]["BSOddData"][0][broker]["end"]["point"]
                }
            }
        }
        return rtnVal
    }

    extractSameOddMatch(match,dataList){
        if(!this.isValidateMatch(match)){
            return {}
        }
        var crtOdd = match["OddData"][0]
        var tmp = {}
        for(var broker in crtOdd){
            if(broker=="香港马会"){
               
               var tmpList = this.caluclateKValue(broker,match,dataList)

               tmpList.sort(function(a, b) {
                    var keyA = a.kNVal,
                    keyB = b.kNVal;
                    // Compare the 2 dates
                    if (keyA < keyB) return -1;
                    if (keyA > keyB) return 1;
                    return 0;
                })
                tmpList = tmpList.slice(0, 10)  
                var knTotal = 0
                for(var i=0;i<tmpList.length;i++){
                    knTotal += tmpList[i].kNVal
                }
                var calculatorUp = this.calculateSingleResultAsianOddAdvance(match,tmpList,broker)
                var calculatorDown = this.calculateSingleResultAsianOddAdvance(match,tmpList,broker,"客")
                tmp[broker] = {
                    "上":calculatorUp,
                    "下":calculatorDown,
                    "kNtotal":knTotal
                }   
            }
        }   

        
        var upKey = "上"
        var downKey = "下"

        if(!this.isDicEmpty(tmp)){
            var upCount = 0
            var dwnCount = 0
            var total = 0
            var upbroker = ""
            var dwnbroker = ""

            for(var broker in tmp){
                if(tmp[broker]["上"][0].length >8){
                    var upP = tmp[broker]["上"][1]["p"]
                    var dwnP = tmp[broker]["下"][1]["p"]
                    total++
                    
                    if(upP>dwnP && upP>0.2){
                        if(tmp[broker]["上"][1]["贏"]/ (tmp[broker]["上"][1]["贏"]+tmp[broker]["上"][1]["輸"]) > 0.65){
                            upCount ++
                            upbroker += tmp[broker]["上"][0][0]["oddE"]+"/"+broker + " ,"
                        }
                        //console.table([tmp[broker]["上"][1]])
                    }
                    if(dwnP>upP && dwnP>0.2){
                        if(tmp[broker]["下"][1]["贏"]/ (tmp[broker]["下"][1]["贏"]+tmp[broker]["下"][1]["輸"]) > 0.65){
                            dwnCount ++
                            dwnbroker += tmp[broker]["下"][0][0]["oddE"]+"/"+broker + " ,"
                        }
                       // console.table(tmp[broker]["下"][0])
                       // console.table([tmp[broker]["下"][1]])
                    }
                }
            }
            
            var up = 0
            var upbroker = ""
            var down = 0
            var downbroker = ""
            var total = 0
            var totalUp = 0
            var totalDown = 0
            var totalMMM = 0
            for(var broker in tmp){
                if(parseFloat(tmp[broker]["上"][1]["p"])>parseFloat(tmp[broker]["下"][1]["p"])){
                    up ++
                    upbroker += broker + " \n"
                }else if(parseFloat(tmp[broker]["上"][1]["p"])<parseFloat(tmp[broker]["下"][1]["p"])){
                    down ++
                    downbroker+= broker + " \n"
                }
                    total ++
                    console.table( "---"+broker+"----")
                    console.table([tmp[broker]["上"][1]])
                    console.table([tmp[broker]["下"][1]])

                    if(parseFloat(tmp[broker]["上"][1]["total"])>100){
                        totalMMM ++
                        totalUp = totalUp + parseFloat(tmp[broker]["上"][1]["p"])
                    }
                    if(parseFloat(tmp[broker]["下"][1]["total"])>100){
                        totalDown = totalDown + parseFloat(tmp[broker]["下"][1]["p"])
                    }
            }
    
            return {
                "total":total,
                "up":upCount,
                "down":dwnCount,
                "upbroker":upbroker,
                "downbroker":dwnbroker,
                "hkjcData":tmp["香港马会"],
                "kNtotal":tmp["香港马会"]["kNtotal"]
            }
        }

        return tmp
     
    }

    kNCalculateValue(match,workingList,sV){
       var a1 = Math.pow(match.kN[sV].minH - workingList.kN[sV].minH,2)
       a1 += Math.pow(match.kN[sV].maxH - workingList.kN[sV].maxH,2)
       a1 += Math.pow(match.kN[sV].minA - workingList.kN[sV].minA,2)
       a1 += Math.pow(match.kN[sV].maxH - workingList.kN[sV].maxH,2)
        var goalMin =  Math.pow(0.01,2)
        if(match.kN[sV].goalMin - workingList.kN[sV].goalMin==0){
            goalMin = 0
        }
        a1 +=goalMin
        var goalMax = Math.pow(0.01,2)
       if(match.kN[sV].goalMax - workingList.kN[sV].goalMax==0){
            goalMax = 0
        }
        a1 +=goalMax

        return a1
    }
    
    caluclateKValue(broker, match, dataList){
        console.log("===")
        var workingList = this.deepClone(dataList)
        var rtnVal =[]
        var crtOdd = match["OddData"][0]
        for(var i=0;i<workingList.length;i++){
            if(workingList[i].id == match.id )continue
            if(!this.isValidateMatch(workingList[i])) continue

            var matchDate = this.timeFormatToMoment(match.date)
            var historyDate = this.timeFormatToMoment(workingList[i].date)
            //console.log(matchDate.diff(historyDate,"days"))
            if(matchDate.diff(historyDate,"days") < 1  || matchDate.diff(historyDate,"days") > 30)continue

            var total = this.kNCalculateValue(match,workingList[i],"s3")
             total += this.kNCalculateValue(match,workingList[i],"s6")
             total += this.kNCalculateValue(match,workingList[i],"s9")
             workingList[i].kNVal = total
             rtnVal.push(workingList[i])

        }
        return rtnVal
    }


    singleOddSimilarOddList(broker, match, dataList){
        var workingList = this.deepClone(dataList)
        var rtnVal =[]
        var crtOdd = match["OddData"][0]
        for(var i=0;i<workingList.length;i++){
            if(workingList[i].id == match.id )continue
            if(!this.isValidateMatch(workingList[i])) continue
            var pastMatchOdd = workingList[i]["OddData"][0]
            if( typeof(pastMatchOdd[broker])!="undefined"){
                var crtOddPer = this.oddPerMap(crtOdd[broker])
                var pastMatchOddPer = this.oddPerMap(pastMatchOdd[broker])
            
                if(this.isTwoMatchSimilar(crtOddPer,pastMatchOddPer) ){
                    var outArr = []
                    for(var z=0;z<workingList[i].oddHistory.length;z++){
                         if(workingList[i].oddHistory[z].status=="即"){
                             outArr.push(workingList[i].oddHistory[z])
                         }
                     }
                     console.log("o am here")
                     workingList[i].oddHistory = outArr
                    console.log(match.oddHistory.length)
                    console.log(workingList[i].oddHistory.length)
                    if(Math.abs(match.oddHistory.length - workingList[i].oddHistory.length)<2){
                        rtnVal.push(Object.assign({},workingList[i]))
                        rtnVal[rtnVal.length-1]["homeS"] = workingList[i]["OddData"][0][broker]["start"]["home"]
                        rtnVal[rtnVal.length-1]["homeE"] = workingList[i]["OddData"][0][broker]["end"]["home"]
                        rtnVal[rtnVal.length-1]["homeSP"] = pastMatchOddPer["Shome"]
                        rtnVal[rtnVal.length-1]["homeEP"] = pastMatchOddPer["Ehome"]
                        rtnVal[rtnVal.length-1]["oddLength"] = workingList[i].oddHistory.length
                        rtnVal[rtnVal.length-1]["oddE"] = workingList[i]["OddData"][0][broker]["end"]["point"]
                    }
                }
            }
        }
        return rtnVal
    }

    extraSimilarMatch(match,dataList){
        console.log("erro 222r "+JSON.stringify(match))
        if(!this.isValidateMatch(match)){
            console.log("error")
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
                    if(this.matchHKJCPointBroker(match,pastMatch,true,broker)){
                        brokerMatch ++
                    }
                }
            }
            
            if(this.matchHKJCPointBroker(match,pastMatch,false,"香港马会") && 
            brokerMatch >total - 5
            ){
                dataList[i].hkjcOdd = dataList[i].OddData[0]["香港马会"]["end"]["point"]                  
                /*
                delete dataList[i].OddData
                delete dataList[i].url
                delete dataList[i].HomeHScore
                delete dataList[i].AwayHScore    
                */
                rtn.push(dataList[i])
            }

        }

        return rtn
    }

    matchHKJCPointBroker(crt,past,isCompareOdd, broker){
        broker = "香港马会"
        if(typeof(past["OddData"][0][broker])=="undefined") return false
        if(typeof(past["OddData"][0][broker]["start"])=="undefined") return false
        if(typeof(crt["OddData"][0][broker])=="undefined") return false
        if(
        crt["OddData"][0][broker]["start"]["point"]==past["OddData"][0][broker]["start"]["point"] &&
        crt["OddData"][0][broker]["end"]["point"]==past["OddData"][0][broker]["end"]["point"]
        ){
            
            if(isCompareOdd){
              
                var homeStart = parseFloat(crt["OddData"][0][broker]["start"]["home"])
                var awayStart = parseFloat(crt["OddData"][0][broker]["start"]["away"])

                var homeEnd = parseFloat(crt["OddData"][0][broker]["end"]["home"])
                var awayEnd = parseFloat(crt["OddData"][0][broker]["end"]["away"])

                var homeStartPer = homeStart/(homeStart+awayStart)
                var awayStartPer = awayStart/(homeStart+awayStart)

                var homeEndPer = homeEnd/(homeEnd+awayEnd)
                var awayEndPer = awayEnd/(homeEnd+awayEnd)

                var pasthomeStart = parseFloat(past["OddData"][0][broker]["start"]["home"])
                var pastawayStart = parseFloat(past["OddData"][0][broker]["start"]["away"])

                var pasthomeEnd = parseFloat(past["OddData"][0][broker]["end"]["home"])
                var pastawayEnd = parseFloat(past["OddData"][0][broker]["end"]["away"])

                var pasthomeStartPer = pasthomeStart/(pasthomeStart+pastawayStart)
                var pastawayStartPer = pastawayStart/(pasthomeStart+pastawayStart)

                var pasthomeEndPer = pasthomeEnd/(pasthomeEnd+pastawayEnd)
                var pastawayEndPer = pastawayEnd/(pasthomeEnd+pastawayEnd)
        
                if(Math.abs(homeStartPer-pasthomeStartPer)<0.05 && Math.abs(pasthomeEndPer-homeEndPer)<0.05) {
                    /*
                    console.log("data2 :"+homeStartPer)
                    console.log("data1 :"+homeEndPer)
                    console.log("data2 :"+pasthomeStartPer)
                    console.log("data1 :"+pasthomeEndPer)
                    console.log("-------")
                    */
                    if(
                        (homeStartPer-homeEndPer<0 &&pasthomeStartPer-pasthomeEndPer <0) ||
                        (homeStartPer-homeEndPer > 0 &&pasthomeStartPer-pasthomeEndPer >0)
                    ){
                     return true
                    }else
                    return false
                }else{
                    return false
                }
                /*
                if(
                Math.abs(parseFloat(crt["OddData"][0][broker]["start"]["home"])- parseFloat(past["OddData"][0][broker]["start"]["home"]) )<0.1&&
                Math.abs(parseFloat(crt["OddData"][0][broker]["end"]["home"])-parseFloat(past["OddData"][0][broker]["end"]["home"]))<0.1
                ){
                    
                    if(
                        (parseFloat(crt["OddData"][0][broker]["start"]["home"]) - parseFloat(crt["OddData"][0][broker]["end"]["home"]) > 0 &&
                        parseFloat(past["OddData"][0][broker]["start"]["home"])-parseFloat(past["OddData"][0][broker]["end"]["home"])> 0) 
                        ||
                        (parseFloat(crt["OddData"][0][broker]["start"]["home"]) - parseFloat(crt["OddData"][0][broker]["end"]["home"]) <=0 &&
                        parseFloat(past["OddData"][0][broker]["start"]["home"])-parseFloat(past["OddData"][0][broker]["end"]["home"]) <=0) 
                        
                        ){
                            return true
                        }else{
                            return false
                        }
                    //return true
                }else{
                    return false
                }*/

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