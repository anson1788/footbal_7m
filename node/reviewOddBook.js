const { lstat } = require('fs');
let oBUtils = require('./class/oddBookReviewUtils.js');
var oddBookUtils = new oBUtils()

async function init(){
    var oddBookList = await oddBookUtils.getOddBookList()
    console.table(oddBookList)
}

init()
