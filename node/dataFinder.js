﻿let filterUtils = require('./class/dataFilter.js');
var fs = require('fs');

let ftUtils = new filterUtils()

function init(){
    let rawdata = fs.readFileSync("oddBook.json");
    let dataList = JSON.parse(rawdata)
    //var targetData = ftUtils.lookUpTwoMatch(dataList)
    //var targetData = ftUtils.lowHalfAndUp(dataList)
   // var targetData = ftUtils.nochangeOdd(dataList)
   var targetData = ftUtils.nochangeOddn(dataList)
   
   console.table(targetData)
}

init()
