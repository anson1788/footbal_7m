const { lstat } = require('fs');
let oBUtils = require('./class/oddBookReviewUtils.js');
let bfWinBetUtils = require('./class/bfWinBetUtils.js');
let basicUtils = require('./class/basicUtils.js');
var oddBookUtils = new oBUtils()
let bfBetUtils = new bfWinBetUtils()
let bcUtils = new basicUtils()
let filterUtils = require('./class/dataFilterStable.js');
var fs = require('fs');
async function init(){
    var result = await oddBookUtils.getOddBookList()
    var oddPlacement = result[0]
    var dateList = result[1]

    /*
    var onccList = await oddBookUtils.getONCCDataList(dateList)
    var liveMatch = 0
    for(var i=0;i<onccList.length;i++){
        if(onccList[i].isLive == 'y'){
            liveMatch++
        }
    }
    
    for(var i=0;i<oddPlacement.length;i++){
        for(var j=0;j<onccList.length;j++){
            if(onccList[j].HomeTeamCName.includes(oddPlacement[i].home) && 
               onccList[j].AwayTeamCName.includes(oddPlacement[i].away)){
                oddPlacement[i].isLive = onccList[j].isLive
            }
        }
    }*/


    
    var pushArr = []
    var target = []
    for(var i=0;i<oddPlacement.length;i++){
        if(oddPlacement[i].res=="輸" || oddPlacement[i].res=="輸半"){
           // pushArr.push(oddPlacement[i])
          /*
           var tmp = {
                "home": oddPlacement[i].home,
                "away": oddPlacement[i].away,
                "id": oddPlacement[i].id
            }
            pushArr.push(tmp)
            target.push(oddPlacement[i])
            */
        }else{
            
            var tmp = {
                "home": oddPlacement[i].home,
                "away": oddPlacement[i].away,
                "id": oddPlacement[i].id
            }
            pushArr.push(tmp)
            target.push(oddPlacement[i])
        }
    }

    
    
   
    
    
     
 
    var crtOddList = await bfBetUtils.addOddData(pushArr,bcUtils,true)
    let ftUtils = new filterUtils()
    var styList = bfBetUtils.getHKJCList(crtOddList)
    var calculatedResult = ftUtils.matchChecker(styList)
    var betArr = calculatedResult[3];
    fs.writeFileSync("winingAlt.json", JSON.stringify(betArr,null,2))
    console.table(betArr)
 

    

    var string = fs.readFileSync("winingAlt.json")
    var advanceList = JSON.parse(string)

    var suggestToBuy = 0
    var diffPosition = 0
    var diffPost = []
    var nototBuyList = []
    for(var i=0;i<target.length;i++){
        var isOddSame = false
        var isFindMap = false
        for(var j=0;j<advanceList.length;j++){
            if(target[i].id == advanceList[j].id){
                isFindMap = true
                if(target[i].place == advanceList[j].place){
                    isOddSame = true
                    jidx = j
                }
            }
        }
        if(isFindMap == false){
            //console.log("---")
           // console.log(JSON.stringify(target[i]))
           suggestToBuy ++
           nototBuyList.push(target[i])
        }
        if(isOddSame == false && isFindMap == true){
           // console.log(JSON.stringify(target[i]))
           diffPosition ++
           var idx = -9
           for(var j=0;j<advanceList.length;j++){
            if(target[i].id==advanceList[j].id){
                idx = j;
            }
           }
           advanceList[idx].date = target[i].date
           diffPost.push(advanceList[idx])
        }
    }
    console.table([{
        "notToBuy" : suggestToBuy,
        "diff":diffPosition

    }])
    console.table(diffPost)
    console.table(nototBuyList)


    console.table(oddPlacement)
}

init()
