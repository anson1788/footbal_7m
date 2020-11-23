
let basicUtils = require('./class/basicUtils.js');
let bfwinUtils = require('./class/bfWinUtils.js');
let filterUtils = require('./class/dataFilterStable.js');
var fs = require('fs');

let bcUtils = new basicUtils()
let bfUtils = new bfwinUtils()
/*
http://bf.win007.com/football/big/Over_20201022.htm

*/

async function getCacheData(url, folder, cacheId , type ,isCache = true){

    var rtnArr = []
    if(isCache && fs.existsSync(folder+cacheId+".json")){
        let rawdata = fs.readFileSync(folder+cacheId+".json");
        rtnArr = JSON.parse(rawdata);   
    }else{        
        
        try{
                dom = await bcUtils.getHttpDomAsyn(url,type) 
                if(type=="bflist"){
                    rtnArr = await bfUtils.parseBFDailyList(dom)  
                }else if(type=="bfDetails"){
                    rtnArr = await bfUtils.parseBFLiveMatchDetails(dom)  
                }else if(type=="bfBSOdd"){
                    rtnArr = await bfUtils.parseOddBS(dom)  
                    if(rtnArr == null){
                        rtnArr = []
                    }
                }else if(type=="bfOdd"){
                    rtnArr = await bfUtils.parseOdd(dom)  
                    if(rtnArr == null){
                        rtnArr = []
                    }
                }else if(type=="bfHistory"){
                    rtnArr = await bfUtils.parseBFHistory(dom)  
                }
                if(rtnArr.length>0){
                    if (!fs.existsSync(folder)){
                        fs.mkdirSync(folder);
                    }           
                    console.log(folder+cacheId+".json")
                    fs.writeFileSync(folder+cacheId+".json", JSON.stringify(rtnArr,null,2))
                }
        }catch(e){
                console.log("mean error")
        }
    }
    return rtnArr
}

async function init(){
    
    
    let rawdata = fs.readFileSync("oddBook/21-11-2020/placeBet.json");
    let dataList1 = JSON.parse(rawdata)
    
    var rtn = []
    var startAdd =false
    for(var i=0;i<dataList1.length;i++){
        if(dataList1[i].id=="1872563"){
            startAdd = true
        }
        if(startAdd){
            rtn.push(dataList1[i])
        }
    }



    let rawdata2 = fs.readFileSync("oddBook/22-11-2020/placeBet.json");
    let dataList2 = JSON.parse(rawdata2)
    var stopAdd = false
    for(var i=0;i<dataList2.length;i++){
   
        if(!stopAdd){
            rtn.push(dataList2[i])
        }
        if(dataList2[i].id=="1858789"){
            stopAdd = true
        }
    }
    console.table(rtn)
 
    var count = {
        "輸":0,
        "輸半":0,
        "走":0,
        "贏半":0,
        "贏":0,
        "total":0
    }
    for(var i=0;i<rtn.length;i++){
        count[rtn[i].res] = count[rtn[i].res]+1
    }

    console.table([count])
  
}

init()
