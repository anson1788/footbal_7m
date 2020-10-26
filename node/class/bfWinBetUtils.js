const bfWinUtils = require('./bfWinUtils.js')
class bfWinBetUtils extends bfWinUtils{
    
    async parseBFLiveMatch(crtDom){
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
                var score = this.replaceAll(tds[5].textContent)
                console.log(score)
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

                var tmp = {
                    "lea" : league,
                    "time" : time,
                    "home" : home,
                    "away": away,
                    "hfs":hfs,
                    "afs":afs
                }
                
                console.log(tmp)
                //console.log(tds[3].textContent)
            }
        }
        return matchArr
    }
    
    replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }
}
module.exports = bfWinBetUtils



