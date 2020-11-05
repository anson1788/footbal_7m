let filterUtils = require('./class/dataFilterStable.js');
var fs = require('fs');

let ftUtils = new filterUtils()

function init(){
    let rawdata = fs.readFileSync("oddBook.json");
    let dataList = JSON.parse(rawdata)
    //var targetData = ftUtils.lookUpTwoMatch(dataList)
    //var targetData = ftUtils.lowHalfAndUp(dataList)
   // var targetData = ftUtils.nochangeOdd(dataList)
   //var targetData = ftUtils.nochangeOddn(dataList)
   //var targetData = ftUtils.samePointOddSwitchHomeDown(dataList)
   //var targetData = ftUtils.halfTohalf(dataList)
  // var targetData = ftUtils.highOdd(dataList)
   //var targetData = ftUtils.similarOdd(dataList)
   
   var targetData = ftUtils.pointDropOdDrop(dataList)
   var calculator = ftUtils.calculateResultAsianOdd(targetData)
   var resultList = calculator[0]
   var resultStat = calculator[1]
   console.table(targetData)
   console.table([resultStat])
}


init()
