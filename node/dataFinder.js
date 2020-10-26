let filterUtils = require('./class/dataFilter.js');
var fs = require('fs');

let ftUtils = new filterUtils()

function init(){
    let rawdata = fs.readFileSync("oddBook.json");
    let dataList = JSON.parse(rawdata)
    var targetData = ftUtils.customFilter(dataList)
    console.table(targetData)
}

init()
