const bfWinUtils = require('./bfWinUtils.js')
class bfWinBetUtils extends bfWinUtils{
    
    async parseBFLiveMatch(crtDom){
        var matchList = crtDom.window.document.querySelectorAll("#table_live tr")
        var matchArr = []            
       
        for(var i=0;i<matchList.length;i++){
            var tds = matchList[i].querySelectorAll("td")
            if(tds.length==15){
                console.log(matchList[i].textContent)
                var league = tds[1].textContent 
                var status = tds[2].textContent 
                console.log(tds[3].textContent)
            }
        }
        return matchArr
    }
  
}
module.exports = bfWinBetUtils



