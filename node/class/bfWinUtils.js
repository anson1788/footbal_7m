var moment = require('moment');
class bfWinUtils {

    constructor() {
    }

    //DD/MM HH:mm
    timeFormatToMoment(stringData){
        var hr = stringData.split(" ")[1].split(":")[0]
        var min = stringData.split(" ")[1].split(":")[0]
        var month = stringData.split(" ")[0].split("/")[1]
        var days = stringData.split(" ")[0].split("/")[0]
        
        let d3 = moment({ 
            year :moment().year(), 
            month :parseFloat(month)-1, 
            day :days, 
            hour :hr, 
            minute :min
            });
        return d3
    }
    async parseBFHistory(crtDom){

        var rtnVal = {}


        var homeMatch = []
        var matchList = crtDom.window.document.querySelectorAll("#table_hn")
        if(matchList.length > 0){
            var trs = matchList[0].querySelectorAll("tr")
            for(var i=0;i<trs.length;i++){
                var tds = trs[i].querySelectorAll("td")
                if(tds.length==15){
                   // console.log(tds[1].textContent + " " + tds[2].textContent)
                    tds[3].textContent.split("(")[0].split("-")[0]
                    tds[3].textContent.split("(")[0].split("-")[1]
                    homeMatch.push({
                        "league":tds[0].textContent,
                        "home":tds[2].textContent,
                        "away":tds[5].textContent,
                        "date":tds[1].textContent,
                        "hfs":tds[3].textContent.split("(")[0].split("-")[0],
                        "afs":tds[3].textContent.split("(")[0].split("-")[1],
                        "hhs":tds[3].textContent.split("(")[1].replace(")","").split("-")[0],
                        "ahs":tds[3].textContent.split("(")[1].replace(")","").split("-")[1]
                    })
                }else{
                  //  console.log(tds[0].textContent)
                }
            }
        }
        var awayMatch = []
        var matchList = crtDom.window.document.querySelectorAll("#table_an")
        if(matchList.length > 0){
            var trs = matchList[0].querySelectorAll("tr")
            for(var i=0;i<trs.length;i++){
                var tds = trs[i].querySelectorAll("td")
               // console.log(tds.length)
                if(tds.length==15){
                //    console.log(tds[1].textContent + " " + tds[2].textContent)
                    tds[3].textContent.split("(")[0].split("-")[0]
                    tds[3].textContent.split("(")[0].split("-")[1]
                    awayMatch.push({
                        "league":tds[0].textContent,
                        "home":tds[2].textContent,
                        "away":tds[5].textContent,
                        "date":tds[1].textContent,
                        "hfs":tds[3].textContent.split("(")[0].split("-")[0],
                        "afs":tds[3].textContent.split("(")[0].split("-")[1],
                        "hhs":tds[3].textContent.split("(")[1].replace(")","").split("-")[0],
                        "ahs":tds[3].textContent.split("(")[1].replace(")","").split("-")[1]
                    })
                }else{
                  //  console.log(tds[0].textContent)
                }
            }
        }
        if(homeMatch.length>0){
            rtnVal["home"] = homeMatch
        }
        if(awayMatch.length>0){
            rtnVal["away"] = awayMatch
        }
        var idx =0 
        for(var id in rtnVal){
            idx ++
        }
        if(idx>0){
            return [rtnVal]    
        }else{
            return []
        }
    }

    async parseBFDailyList(crtDom){
  
        var matchList = crtDom.window.document.querySelectorAll("#table_live tr")
        var matchArr = []            
       
        for(var i=0;i<matchList.length;i++){
            var tds = matchList[i].querySelectorAll("td")
          
            if(tds.length==10){
                var coln9 = tds[9]
                var league = tds[0].textContent.split(" ")[0]
                var home = tds[3].textContent
                var away = tds[5].textContent

                var fullScore = tds[4].textContent
                var halfScore = tds[6].textContent

                var homeFullScore = fullScore.split("-")[0]
                var awayFullScore = fullScore.split("-")[1]

                var homeHalfScore = halfScore.split("-")[0]
                var awayHalfScore = halfScore.split("-")[1]

                home = this.clearMatchName(home)
                away = this.clearMatchName(away)
                /*
                console.log("league :"+league)
                console.log("home :"+home)
                console.log("away :"+away)
                */
             
                
                if((coln9.querySelectorAll("img").length==2 && 
                    (coln9.querySelectorAll("img")[0].src=="/image/zd.gif"
                    || coln9.querySelectorAll("img")[1].src=="/image/zd.gif"))||
                    
                    (coln9.querySelectorAll("img").length==1 && 
                    coln9.querySelectorAll("img")[0].src=="/image/zd.gif")
                    
                    ){
                    
                        var id = coln9.querySelectorAll("a")[0]
                        .getAttribute("onclick")
                        .replace("analysis(","")
                        .replace(")","")
                        //console.log("home "+id)

                        matchArr.push({
                            "league":league,
                            "date":tds[1].textContent,
                            "home":home,
                            "away":away,
                            "HomeFScore":homeFullScore,
                            "AwayFScore":awayFullScore,
                            "HomeHScore":homeHalfScore,
                            "AwayHScore":awayHalfScore,
                            "id":id,
                            "url":"http://live.win007.com/detail/"+id+".htm"
                        })
                    
                }
            }
        }
        return matchArr
    }


    async parseOddBS(crtDom){ 
        if(crtDom==null){
            console.log("no dom")
            return null
        }
        if(!(typeof(crtDom.window)!="undefined")){
            console.log("no window")
            return null
        }
        if(crtDom.window.document==null){
            return null
        }
        var table = crtDom.window.document.querySelectorAll("#webmain table")[0]
        var tr = table.querySelectorAll("tr")
        var tmp = {}
 
        for(var i=2;i<tr.length-2;i++){
           var style = tr[i].getAttribute("style")
           if (!(style+"").includes("none")){
               var tds  = tr[i].querySelectorAll("td")
               var tdsTxt = tds[0].textContent
               if(tds.length==12){
                    tmp [tdsTxt] = {
                            "start":{
                                "home":tds[2].textContent,
                                "away":tds[4].textContent,
                                "point":tds[3].textContent
                            },
                            "end":{
                                "home":tds[8].textContent,
                                "away":tds[10].textContent,
                                "point":tds[9].textContent
                            }
                        }
                    
                   
               }
           }
        }
        
        //console.log("---"+bfid+"---")
        //console.log(tmp)

        var idx =0 
        for(var id in tmp){
            idx ++
        }
        
        if(idx>0){
            return [tmp]    
        }else{
            return []
        }

       
    }

    async parseOdd(crtDom){ 
        if(crtDom==null){
            console.log("no dom")
            return null
        }
        if(!(typeof(crtDom.window)!="undefined")){
            console.log("no window")
            return null
        }
        if(crtDom.window.document==null){
            return null
        }
        var table = crtDom.window.document.querySelectorAll("#webmain table")[0]
        var tr = table.querySelectorAll("tr")
        var tmp = {}
 
        for(var i=2;i<tr.length-2;i++){
           var style = tr[i].getAttribute("style")
           if (!(style+"").includes("none")){
               var tds  = tr[i].querySelectorAll("td")
               var tdsTxt = tds[0].textContent
               if(tds.length==12){
                    tmp [tdsTxt] = {
                            "start":{
                                "home":tds[2].textContent,
                                "away":tds[4].textContent,
                                "point":tds[3].textContent
                            },
                            "end":{
                                "home":tds[8].textContent,
                                "away":tds[10].textContent,
                                "point":tds[9].textContent
                            }
                        }
                    
                   
               }
           }
        }
        
        //console.log("---"+bfid+"---")
        //console.log(tmp)

        var idx =0 
        for(var id in tmp){
            idx ++
        }
        
        if(idx>0){
            return [tmp]    
        }else{
            return []
        }

       
    }
    async parseBFLiveMatchDetails(crtDom){
        var matchArr = {}   
        var table = crtDom.window.document.querySelectorAll("#teamTechDiv_detail table")[0]
        var tr = table.querySelectorAll("tr")
        for(var i=0;i<tr.length;i++){
            if(tr[i].querySelectorAll("td").length ==  5){
                matchArr[tr[i].querySelectorAll("td")[2].textContent] = {
                    "home":tr[i].querySelectorAll("td")[1].textContent,
                    "away":tr[i].querySelectorAll("td")[3].textContent
                }
            }
           
        }

        var lasttable = crtDom.window.document
        .querySelectorAll(".content")[crtDom.window.document.querySelectorAll(".content").length-1]
        .querySelectorAll("table")[0]
  
        if(lasttable.querySelectorAll("th")[0].textContent=="數據統計"){
            var tds = lasttable.querySelectorAll("tr")[2].querySelectorAll("td")
            if(tds.length == 8){
                var tmp = {
                    "3+h":""+tds[0].textContent,
                    "2+h":""+tds[1].textContent,
                    "1+h":""+tds[2].textContent,
                    "0+h":""+tds[3].textContent,
                    "0+a":""+tds[4].textContent,
                    "1+a":""+tds[5].textContent,
                    "2+a":""+tds[6].textContent,
                    "3+a":""+tds[7].textContent
                }
                matchArr["goal"]=tmp
            }else{
                console.log("數據統計 not correct in 8 "+bfid+ " "+tds.length)
            }
        }else{
            console.log("數據統計 not correct")
        }
    
        var tableList = crtDom.window.document
        .querySelectorAll(".content")


        for(var i=0;i<tableList.length;i++){
            if(typeof(tableList[i].querySelectorAll("table")[0])!=="undefined"){
                if(tableList[i].querySelectorAll("table")[0].querySelectorAll("th")[0].textContent.includes("進失球概率近")){
                    if(tableList[i].querySelectorAll("table")[0].querySelectorAll("tr").length==8){
                        var trs = tableList[i].querySelectorAll("table")[0].querySelectorAll("tr");
                        var tmp = {
                            "h15":""+trs[2].querySelectorAll("td")[0].textContent,
                            "h30":""+trs[3].querySelectorAll("td")[0].textContent,
                            "h45":""+trs[4].querySelectorAll("td")[0].textContent,
                            "h60":""+trs[5].querySelectorAll("td")[0].textContent,
                            "h75":""+trs[6].querySelectorAll("td")[0].textContent,
                            "h90":""+trs[7].querySelectorAll("td")[0].textContent,
                            "a15":""+trs[2].querySelectorAll("td")[3].textContent,
                            "a30":""+trs[3].querySelectorAll("td")[3].textContent,
                            "a45":""+trs[4].querySelectorAll("td")[3].textContent,
                            "a60":""+trs[5].querySelectorAll("td")[3].textContent,
                            "a75":""+trs[6].querySelectorAll("td")[3].textContent,
                            "a90":""+trs[7].querySelectorAll("td")[3].textContent
                        }
                        matchArr["court"]=tmp
                    }else{
                        console( " 進失球概率近 not corret "+bfid+ " "+tds.length)
                    }
                }
                if(tableList[i].querySelectorAll("table")[0].querySelectorAll("th")[0].textContent.includes("即时指数分析")){
                    var trs = tableList[i].querySelectorAll("table")[0].querySelectorAll("tr");
                    var tmp = {
                        "big":""+trs[4].querySelectorAll("td")[7].textContent,
                        "point":""+trs[4].querySelectorAll("td")[8].textContent,
                        "smal":""+trs[4].querySelectorAll("td")[9].textContent,
                    }
                    matchArr["odd"]=tmp
                }
                if(tableList[i].querySelectorAll("table")[0].querySelectorAll("th")[0].textContent.includes("詳細事件")){
                    var trs = tableList[i].querySelectorAll("table")[0].querySelectorAll("tr");
                    var eventArr = []

                    for(var j=0;j<trs.length;j++){
        
                        if(trs[j].querySelectorAll("td").length==5 && 
                            ((trs[j].querySelectorAll("td")[1].querySelectorAll("img").length==1) ||
                            (trs[j].querySelectorAll("td")[3].querySelectorAll("img").length==1) )
                            ){
                            
                            var homeText = ""
                            if(trs[j].querySelectorAll("td")[1].querySelectorAll("img").length==1){
                                homeText = trs[j].querySelectorAll("td")[1].querySelectorAll("img")[0]["title"]
                            }
                            var min = trs[j].querySelectorAll("td")[2].textContent.replace("'","")
                            var awayText = ""
                            if(trs[j].querySelectorAll("td")[3].querySelectorAll("img").length==1){
                                awayText = trs[j].querySelectorAll("td")[3].querySelectorAll("img")[0]["title"]
                            }
                            var tmp = {
                                "homeText":homeText,
                                "mins":min,
                                "awayText":awayText
                            }

                            eventArr.push(tmp)
                        }
                    }
                    matchArr["eventArr"]=eventArr
                }
                
            }
            /*
            if(tableList[i].querySelectorAll("th")[0].textContent.includes("進失球概率")){
                console.log("found result")
            }*/
        }
        return [matchArr]
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
}
module.exports = bfWinUtils