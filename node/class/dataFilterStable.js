const bfWinUtils = require('./dataFilter.js')
class dataFilterStable extends bfWinUtils{

  matchChecker(dataList){
    /*
    var targetData = this.oneGoalOdd(dataList)
    console.table(targetData)
    */
    var msg = ""
    /* 
    for(var i=0;i<targetData.length;i++){
            msg += "oneGoalOdd" + targetData[i].home +" vs "+targetData[i].away + " "+" "+targetData[i].hkjcOdd + " 主 " + targetData[i].betOdd
    }

    targetData = this.halfToZero(styList)
    console.table(targetData)
    
    for(var i=0;i<targetData.length;i++){
        msg += "halfToZero" + targetData[i].home +" vs "+targetData[i].away + " "+" "+targetData[i].hkjcOdd + " 客 " + targetData[i].betOdd
    }
    */



    /*
     初盤 ＝終盤 ＝平手盤
     主隊 降水 >0.07
     */

    var targetData = this.samePointOddSwitchHomeDown(dataList)
    console.table(targetData)
    
    for(var i=0;i<targetData.length;i++){
        msg += "[初平終平 主降水]" + targetData[i].home +" vs "+targetData[i].away + " "+" (盤:"+targetData[i].hkjcOdd + " 買:主) " + targetData[i].endHomePoint
    }

    return msg
  }
}
module.exports = dataFilterStable