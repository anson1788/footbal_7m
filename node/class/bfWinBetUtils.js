const bfWinUtils = require('./bfWinUtils.js')
var moment = require('moment');
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
                    "HomeHScore":hfs,
                    "AwayHScore":afs,
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
            if(diff<20){
                return true
            }
            return false
        }
    }

    filterOutImmediateList(dataList){
        var rtnList = []
        
        for(var i=0;i<dataList.length;i++){
            if(this.requiredToFillTime(dataList[i])){
                rtnList.push(dataList[i])
            }
        }
        return rtnList
    }

    async addOddData(dataList,bcUtils){
        for(var i=0;i<dataList.length;i++){
            var url = "http://vip.win007.com/AsianOdds_n.aspx?id="+dataList[i].id
            var dom = await bcUtils.getHttpDomAsyn(url,"") 
            var oddData = await this.parseOdd(dom)
            if(oddData.length >0 && typeof(oddData[0]["香港马会"])!=="undefined"){
                dataList[i].OddData = oddData[0]
                console.log(oddData)
            }
            console.log("complete  :"+ JSON.stringify(dataList[i]))
        }
        return dataList
    }
    replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }
}
module.exports = bfWinBetUtils



