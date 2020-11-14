﻿const { lstat } = require('fs');
let oBUtils = require('./class/oddBookReviewUtils.js');
var oddBookUtils = new oBUtils()

async function init(){
    var result = await oddBookUtils.getOddBookList()
    var oddPlacement = result[0]
    var dateList = result[1]
   // console.log(JSON.stringify(oddPlacement))
    var onccList = await oddBookUtils.getONCCDataList(dateList)
    //console.table(onccList)
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
    }

    for(var i=0;i<oddPlacement.length;i++){
        oddPlacement[i].result == "贏"
    }
    console.table(oddPlacement)

}

init()
