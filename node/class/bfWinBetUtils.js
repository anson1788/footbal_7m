const bfWinUtils = require('./bfWinUtils.js')
var moment = require('moment');
var fs = require('fs');
class bfWinBetUtils extends bfWinUtils{
    
    parseBFLiveMatch(crtDom){
        var matchList = crtDom.window.document.querySelectorAll("#table_live tr")
        var matchArr = []            
       
        for(var i=0;i<matchList.length;i++){
            var tds = matchList[i].querySelectorAll("td")
            if(tds.length==15){
               // console.log(matchList[i].textContent)
                var league = tds[1].textContent 
                var time = tds[2].textContent 
                var status = tds[3].textContent 

                var aTags = tds[4].querySelectorAll("a")
                var home =  ""
                for(var j=0;j<aTags.length;j++){
                    if(aTags[j].id.includes("team")){
                        home = aTags[j].textContent
                    }    
                }
                var score = this.replaceAll(tds[5].textContent," ","")
                var hfs = "-"
                var afs = "-"
                var hhs = "-"
                var ahs = "-"
                if(score.split("-").length>1){
                    hfs = score.split("-")[0]
                    afs = score.split("-")[1]
                }
                var away = ""
                aTags = tds[6].querySelectorAll("a")
                for(var j=0;j<aTags.length;j++){
                    if(aTags[j].id.includes("team")){
                        away = aTags[j].textContent
                    }
                }
                
                var b7Mid = tds[13].querySelectorAll("a")[0]
                        .getAttribute("onclick")
                        .replace("analysis(","")
                        .replace(")","")

                var tmp = {
                    "league" : league,
                    "time" : time,
                    "status": status,
                    "home" : home,
                    "away": away,
                    "HomeFScore":hfs,
                    "AwayFScore":afs,
                    "id":b7Mid
                }
                matchArr.push(tmp)
                //console.log(tmp)
                //console.log(tds[3].textContent)
            }
        }
        return matchArr
    }

    requiredToFillTime(obj){
       
       if(obj.status.length != 0){
           return false
       }else{
           
        var hr = obj.time.split(":")[0]
        var min = obj.time.split(":")[1]
        let d3 = moment({ 
            year :moment().year(), 
            month :moment().month(), 
            day :moment().date(), 
            hour :hr, 
            minute :min
            });
           
            var calculatedDate = d3
            var hrDiff = parseFloat(hr) - parseFloat(moment().hour())
            var minuteDiff = parseFloat(min) - parseFloat(moment().minute())
            if(hrDiff<0){
                calculatedDate = moment({ 
                    year :moment().year(), 
                    month :moment().month(), 
                    day :moment().date(), 
                    hour :hr, 
                    minute :min
                    }).add(1, 'days');
            }
            var diff = calculatedDate.diff(moment(),"minutes")
            //console.log(diff+ " "+obj.time + " "+obj.id)
            
            if(diff>5 && diff<35){
                return 3
            }else if(diff<=5){
                return 2
            }
            return 0
            
           /*
            if(diff<23){
                return 3
            }*/
            
        }
    }

    filterOutImmediateList(dataList){
        var min20List = []
        var min7List = []
        for(var i=0;i<dataList.length;i++){
            if(this.requiredToFillTime(dataList[i])==3){
                min20List.push(dataList[i])
            }else if (this.requiredToFillTime(dataList[i])==2){
                min7List.push(dataList[i])
            }
        }
        return [min20List,min7List]
    }

    getCurrentTimeDiff(match){
        var timeInMoment=this.timeFormatToMoment(match["matchDate"])
        var diff = timeInMoment.diff(moment(),"minutes")
        match["timeBeforeStart"] = diff   
        return match
    }

    filterGetClosestMatch(hkjcMatchList,mins){
        var readyToCalculatedList = []
        for(var i=0;i<hkjcMatchList.length;i++){
            hkjcMatchList[i] = this.getCurrentTimeDiff(hkjcMatchList[i])
            if(hkjcMatchList[i]<=mins){
                readyToCalculatedList.push(hkjcMatchList[i])
            }
        }
        return [readyToCalculatedList,hkjcMatchList]
    }

    getCrtHKJCList(m7List,hkjcList){
        var rtn = []
        for(var i=0;i<hkjcList.length;i++){
            
            var tmp = -1
            for(var j=0;j<m7List.length;j++){
                if(hkjcList[i]==m7List[j].id){
                    tmp = j
                }
            }
            if(tmp!=-1){
                rtn.push(m7List[tmp])
            }
        }
        return rtn
    }

    listSeparator(workingList, lookUpList){
        var notInListData = []
        var InListData = []
        for(var i=0;i<workingList.length;i++){
            var tmp = -1
            for(var j=0;j<lookUpList.length;j++){
                if(workingList[i].id==lookUpList[j]){
                    tmp = j
                }
            }
            if(tmp==-1){
                notInListData.push(workingList[i])
            }else{
                InListData.push(workingList[i])
            }
        }
        return [InListData,notInListData]
    }
    


    async addOddData(dataList,bcUtils,isCache = false){
        for(var i=0;i<dataList.length;i++){
            var url = "http://vip.win007.com/AsianOdds_n.aspx?id="+dataList[i].id
            console.log("match url :"+url)
            var dom = null 
            var oddData = null
            if(!isCache){
                dom = await bcUtils.getHttpDomAsyn(url,"") 
                oddData = await this.parseOdd(dom)
            }else{
                if(fs.existsSync("bfData/odd/crt/"+dataList[i].id+".json")){
                    let rawdata = fs.readFileSync("bfData/odd/crt/"+dataList[i].id+".json");
                    oddData = JSON.parse(rawdata);   
                }else{
                    dom = await bcUtils.getHttpDomAsyn(url,"") 
                    oddData = await this.parseOdd(dom)
                    if(oddData!=null){
                        fs.writeFileSync("bfData/odd/crt/"+dataList[i].id+".json", JSON.stringify(oddData,null,2))
                    }
                }
            }
            dataList[i].isOddReady = true
            if(oddData == null){
                dataList[i].isOddReady = false
                oddData = []
            }
            if(oddData.length >0 && typeof(oddData[0]["香港马会"])!=="undefined"){
                dataList[i].OddData = oddData
                console.log(oddData)
            }
            console.log("complete  :"+ JSON.stringify(dataList[i]))
          
        }

        
        return dataList
    }
    replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }

    getHKJCList(crtOddList){
        var styList = []
        for(var i=0;i<crtOddList.length;i++){
            if(
                typeof(crtOddList[i].OddData) !="undefined"  &&
                crtOddList[i].OddData.length>0 &&
                typeof(crtOddList[i].OddData[0]["香港马会"])!=="undefined"){
                styList.push(crtOddList[i])
            }
        }
        return styList
    }

    isHKJCData(match){
        if(
            typeof(match.OddData) !="undefined"  &&
            match.OddData.length>0 &&
            typeof(match.OddData[0]["香港马会"])!=="undefined"){
            return true
        }
        
        return false
    }


    isHKJCDataLocal(match,hkjcMatchList){
        /*
        if(
            typeof(match.OddData) !="undefined"  &&
            match.OddData.length>0 &&
            typeof(match.OddData[0]["香港马会"])!=="undefined"){
            return true
        }*/

        for(var i=0;i<hkjcMatchList.length;i++){
            if(hkjcMatchList[i].id == match.id){
                return true
            }
        }
        
        return false
    }
}
module.exports = bfWinBetUtils



