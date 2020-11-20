const CDP = require('chrome-remote-interface');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const chromeLauncher = require('chrome-launcher');
var fs = require('fs');
var moment  = require('moment');
const NameMapping  = JSON.parse(fs.readFileSync("7m2hkjcName.json"))
var request = require('sync-request');
let filterUtils = require('./dataFilterStable.js');
let ftUtils = new filterUtils()

class hkjcBetEngine {

    constructor() {
    }

    updateMatchingName(list){
        
        for(var i=0;i<list.length;i++){
            list[i].home =  list[i].home.replace("(中)","")
            list[i].away =  list[i].away.replace("(中)","")
            
            if(typeof(NameMapping[list[i].home])!="undefined"){
                list[i].home = NameMapping[list[i].home]
            }
            if(typeof(NameMapping[list[i].away.replace("(中)","")])!="undefined"){
                list[i].away = NameMapping[list[i].away]
            }
        }
        return list
    }
    async outputDiffMatchName(m7list){

        console.log(JSON.stringify(NameMapping))

        m7list = this.updateMatchingName(m7list)

        let client;
        if(m7list.length==0) return
        try {
            
            const launchChrome = () =>
            chromeLauncher.launch({ chromeFlags: ['--disable-gpu', '--headless'] });
            const chrome = await launchChrome();
            client = await CDP({ port: chrome.port });
       
            //client = await CDP();

            const {Network, Page,Runtime} = client;
            var dom = await this.loadUrlJSOM(Network, Page,Runtime,'https://bet.hkjc.com/football/odds/odds_hdc.aspx?lang=ch');
            var matchList = dom.window.document.querySelectorAll(".couponRow")
            var isFindMatch = 0
            var hkjcCrtListArr = []
            var tgCouIdx = 0
            var firstMatchTxt = ""
            for (var item of matchList) {
                var isMatchIdx = -999
                if(item.id.includes("rmid")){
                    for(var i=0;i<m7list.length;i++){
                        var cteams = dom.window.document.querySelector("#"+item.id+" .cteams").textContent;
                        if(cteams.includes(m7list[i].home) && 
                            cteams.includes(m7list[i].away)){
                                isMatchIdx = i
                                m7list[i].matchDate = dom.window.document.querySelector("#"+item.id+" .cesst").textContent
                                m7list[i].hkjcDate = dom.window.document.querySelector("#"+item.id+" .cday").textContent
                        }
                    }
                }
                if(item.id.includes("tgCou")){
                    if(tgCouIdx == 0){
                        firstMatchTxt = dom.window.document.querySelector("#"+item.id).textContent;
                    }
                    tgCouIdx = tgCouIdx+1
                }
                if(isMatchIdx == -999){
                    if(item.id.includes("rmid")){
                        console.log(dom.window.document.querySelector("#"+item.id+" .cteams").textContent + " "+  dom.window.document.querySelector("#"+item.id+" .cday").textContent)
                    }
                }else if(tgCouIdx<2){
                    hkjcCrtListArr.push(m7list[isMatchIdx])
                }
            }
            
            //console.table(hkjcCrtListArr)
            //console.log(firstMatchTxt)
            console.table("------------")
            var crtList = {
                "matchDate": firstMatchTxt,
                "matchList":hkjcCrtListArr
            }
            
            var oldList = JSON.parse(fs.readFileSync("./liveData/hkjcList.json"))
            console.log( oldList["matchDate"]+"|"+crtList["matchDate"])
            if(crtList["matchDate"]==oldList["matchDate"]){
                    var localList = oldList["matchList"]
                    var realTimeList = crtList["matchList"]
                 
                    var extraList = []
                    for(var i=0;i<realTimeList.length;i++){
                        var containInList = false
                        for(var j=0;j<localList.length;j++){
                            if(realTimeList[i].id == localList[j].id ){
                                containInList = true
                            }
                        }
                        if(!containInList){
                            extraList.push(realTimeList[i])
                        }
                    }

                    for(var i=0;i<extraList.length;i++){
                        var week = extraList[i].hkjcDate.split(" ")[1]
                        var weekNum = extraList[i].hkjcDate.split(" ")[2]
                       // console.log(extraList[i].hkjcDate.split(" "))
                        var InsertIdx = -99
                        for(var j=0;j<localList.length;j++){
                            var weekLocal = localList[j].hkjcDate.split(" ")[1]
                            var weekNumLocal = localList[j].hkjcDate.split(" ")[2]
                            if(weekLocal==week){
                                if(parseFloat(weekNum)<parseFloat(weekNumLocal)){
                                    console.log(weekNumLocal + ' '+weekNum)
                                    InsertIdx = j
                                    break
                                }
                            }
                        } 

                        if(InsertIdx!=-99){
                            localList.splice(InsertIdx, 0, extraList[i]);
                        }else{
                            localList.push(extraList[i])
                        }
                    }

                    for(var i=0;i<localList.length;i++){
                        var weekLocal = localList[i].hkjcDate.split(" ")[1]
                        var weekNumLocal = localList[i].hkjcDate.split(" ")[2]
                       // console.log(localList[i].hkjcDate)
                    } 
                    oldList["matchList"] = localList
                    fs.writeFileSync("./liveData/hkjcList.json", JSON.stringify(oldList,null,2))
            }else{
                var today =  moment().format('DD-MM-YYYY');
                if (!fs.existsSync("./liveData/"+today+"/")){
                    fs.mkdirSync("./liveData/"+today+"/");
                }
                fs.writeFileSync("./liveData/"+today+"/"+"hkjcList.json", JSON.stringify(oldList,null,2))
                fs.writeFileSync("./liveData/hkjcList.json", JSON.stringify(crtList,null,2))
            }
            console.log(JSON.parse(fs.readFileSync("./liveData/hkjcList.json"))["matchDate"] )
            console.table(JSON.parse(fs.readFileSync("./liveData/hkjcList.json"))["matchList"] )

            client.close();
            chrome.kill();
        } catch (err) {
            console.error(err);
        } finally {
            if (client) {
                await client.close();
            }
        }
        return ""
    }

    
    async buyOdd(betArr,actInfo){
        let client;
        if(betArr.length==0) return
        betArr = this.updateMatchingName(betArr)

        
        try {
            
            const launchChrome = () =>
            chromeLauncher.launch({ chromeFlags: ['--disable-gpu', '--headless'] });
            const chrome = await launchChrome();
            client = await CDP({ port: chrome.port });
       
            //client = await CDP();

            const {Network, Page,Runtime} = client;
            var dom = await this.loadUrlJSOM(Network, Page,Runtime,'https://bet.hkjc.com/football/odds/odds_hdc.aspx?lang=ch');
            var matchList = dom.window.document.querySelectorAll(".couponRow")
            var isFindMatch = 0
            
            for (var item of matchList) {
                for(var i=0;i<betArr.length;i++){
                    if(item.id.includes("rmid")){
                        var cteams = dom.window.document.querySelector("#"+item.id+" .cteams").textContent;
                        if(cteams.includes(betArr[i].home) && 
                           cteams.includes(betArr[i].away)){
                           var odds = dom.window.document.querySelectorAll("#"+item.id+" .codds")
                           var betKey = "HDC_A"
                           if(betArr[i].place=="主"){
                                betKey = "HDC_H"
                           }
                           for(var g=0;g<odds.length;g++){
                             var input = odds[g].querySelectorAll("input")[0];
                             if(input.id.includes(betKey)){
                                betArr[i].clickIdx = isFindMatch
                                await this.runtimeClickDiv(Runtime,input.id,Network,dom)
                                isFindMatch ++;
                            }
                           } 
                        }
                    }
                }
            }

            if(isFindMatch>0){
                await this.performLogonAndBuy(Runtime,dom,actInfo,isFindMatch,betArr)
            }
            client.close();
            chrome.kill();
        } catch (err) {
            console.error(err);
        } finally {
            if (client) {
                await client.close();
            }
        }
        return ""
    }
    async performLogonAndBuy(Runtime,dom,actInfo,mathcNum,betArr){
        await this.runExpressionNoReturn(Runtime,'document.getElementsByClassName("addBet")[0].click()')
        await this.runExpression(Runtime,'document.getElementById("account").value = "'+actInfo.username+'"')
        await this.runExpression(Runtime,'document.getElementById("password").value="'+actInfo.pw+'"')
        await this.runExpressionNoReturn(Runtime,'document.getElementById("loginButton").click()')
        var Q1 = await this.runExpression(Runtime,'document.getElementById("ekbaSeqQuestion").innerHTML')

        var Ans = actInfo.a1
        if(Q1.result.value.includes("你最喜愛")){
            Ans = actInfo.a1
        }else if(Q1.result.value.includes("你求學時最喜愛的科目?")){
            Ans = actInfo.a2
        }else if(Q1.result.value.includes("你第一份工作")){
            Ans = actInfo.a3
        }
        await this.runExpression(Runtime,'document.getElementById("ekbaDivInput").value="'+Ans+'"')
        await this.runExpressionNoReturn(Runtime,'OnClickLoginEKBA()')
        await this.runExpressionNoReturnTimeOut(Runtime,'ShowDisclaimer(false, true)',0.5)
        await this.runExpressionNoReturn(Runtime,'HideError(1)')
        var balance = await this.runExpression(Runtime,'document.getElementById("valueAccBal").innerHTML')
        for(var i=0;i<mathcNum;i++){

            var oddBet = actInfo.HDCNormal
         
            for(var j=0;j<betArr.length;j++){
                if(typeof(betArr[j].clickIdx)!="undefined"){
                    console.log(betArr[j].clickIdx)
                    if(betArr[j].clickIdx==i){
                        if(parseFloat(betArr[j].oddVal)<0.8){
                            oddBet = actInfo.HDCLower
                        }
                        if(parseFloat(betArr[j].oddVal)>1){
                            oddBet =  actInfo.HDCUpper
                        }
                    }
                }
            }
            await this.runExpressionNoReturn(Runtime,'document.getElementById("inputAmount'+i+'").value = '+oddBet)
            await this.runExpressionNoReturn(Runtime,'CheckRefreshUnitbet('+i+');')
            console.log('document.getElementById("inputAmount'+i+'").value = '+oddBet)
        }
    

        var money = balance.result.value.replace("結餘: $ ","")
        console.log("balance :" + money)


        await this.runExpressionNoReturn(Runtime,'OnClickPreview();')
        if(!actInfo.betDebug ){
          
            await this.runExpressionNoReturn(Runtime,'OnClickConfirmBet();')
        }
       
        var v = await this.runExpression(Runtime,'document.getElementsByClassName("previewTableCell4")[0].innerHTML')
        //console.log(v.result.value)        
        return balance.result.value.replace("結餘: $ ","");
    }

    async runExpression(b,_exp) {
        return new Promise(resolve => {
            b.evaluate({expression: _exp}).then((result) => {
                resolve(result)
            });
        }).then(result=>{
            return result
        });
    }
    
    async runExpressionNoReturnTimeOut(b,_exp,second) {
        return new Promise(resolve => {
            b.evaluate({expression: _exp}).then(() => {
                setTimeout(function(){
                    resolve("")
                },second*1000);
            });
        }).then(result=>{
            return result
        });
    }
    async runExpressionNoReturn(b,_exp) {
        return new Promise(resolve => {
            b.evaluate({expression: _exp}).then(() => {
                setTimeout(function(){
                    resolve("")
                },500);
            });
        }).then(result=>{
            return result
        });
    }
    
    async runtimeClickDiv(b,idName,n,d) {

        return new Promise(resolve => {
            b.evaluate({expression: 'var a = document.getElementById("'+idName+'"); console.log(a.click());'}).then((result) => {
                setTimeout(function(){
                   // var odd = d.window.document.querySelector(".oddsHIL .allSelections");
    
    
                    b.evaluate({expression: 'window.location.href'}).then((result) => {
                        resolve(result.result.value)
                    })
                },500);
            });
        }).then(result =>{
            return result;
        })
    }
    
    async loadUrlJSOM(mNetwork, mPage,mRuntime,mUrl){
        const timeout = ms => new Promise(resolve => setTimeout(resolve, ms))
        await mNetwork.enable();
        await mPage.enable();
        await mPage.navigate({url: mUrl});
        await mPage.loadEventFired();
        //console.log('Page loaded! Now waiting a few seconds for all the JS to load...');
        await timeout(1500) // give the JS some time to load
        const a = await this.f(mRuntime);
        const dom = new JSDOM(a);
        return dom;
    }
    async f(b) {
        return b.evaluate({expression: 'document.documentElement.outerHTML'}).then((result) => {
            const a = result.result.value;
            return a;
        });
    }

    async calculateAccumulatedOdd(betArr, noMatchArr){
        //if(betArr.length==0 && noMatchArr.length ==0) return [betArr,noMatchArr]
        var hkjcDailySch = JSON.parse(fs.readFileSync("./liveData/hkjcList.json"))
        var betList = hkjcDailySch["matchList"]

        var placeBetArr = []
        for(var j=0;j<betArr.length;j++){
            for(var i =0;i<betList.length;i++){
                if(betArr[j].id == betList[i].id && typeof(betList[i].place)!="undefined"){
                    betList[i]["buyOdd"] = betArr[j]["buyOdd"]
                    betList[i]["place"] = betArr[j]["place"]
                    betList[i]["oddVal"] = betArr[j]["oddVal"]
                    betList[i]["oddTime"] = moment().format('MM/DD/YYYY, hh:mm'); 
                    betList[i]["sumVal"] = -1
                    placeBetArr.push(betList[i])
                }
            }
        }


        for(var j=0;j<noMatchArr.length;j++){
            for(var i =0;i<betList.length;i++){
                if(noMatchArr[j].id == betList[i].id  && typeof(betList[i].place)!="undefined"){
                    betList[i]["place"] ="不買"
                    betList[i]["sumVal"] = 0
                    betList[i]["oddTime"] = moment().format('MM/DD/YYYY, hh:mm'); 
                }
            }
        }

        var onfootballRealTime = [];
        onfootballRealTime = await this.getONFootballList(onfootballRealTime)
        console.log(JSON.stringify(onfootballRealTime))
        var tmpMatchArr = JSON.parse(JSON.stringify(betList))
        for(var i =0;i<betList.length;i++){
            var dateStr = betList[i].matchDate 
            var date = dateStr.split(" ")[0]
            var time = dateStr.split(" ")[1]

            let d3 = moment({ 
                year :moment().year(), 
                month : (parseFloat(date.split("/")[1]) -1), 
                day :parseFloat(date.split("/")[0]), 
                hour :parseFloat(time.split(":")[0]), 
                minute:parseFloat(time.split(":")[1])
                });
            betList[i].momentDate = d3
            var diff = d3.diff(moment(),"minutes")
         
            for(var j=0;j<onfootballRealTime.length;j++){
               if(betList[i].hkjcDate.includes(onfootballRealTime[j].DayOfWeek)){
                    if(onfootballRealTime[j].MatchNum == betList[i].hkjcDate.split(" ")[2]){
                        betList[i].matchLiveMin = "-"
                        if(onfootballRealTime[j].MatchStatus=="90完"){
                            betList[i].matchLiveMin = "90"
                            betList[i]["isEnd"] = 'y'
                            betList[i]["HomeFScore"] = onfootballRealTime[j].HomeFullScore
                            betList[i]["AwayFScore"] = onfootballRealTime[j].AwayFullScore
                            if(typeof(betList[i]["buyOdd"])!="undefined"){
                                betList[i] = this.tiggerMatchChecking(betList[i])
                               
                            }
                            tmpMatchArr[i]["isEnd"] = 'y'
                            tmpMatchArr[i]["HomeFScore"] = onfootballRealTime[j].HomeFullScore
                            tmpMatchArr[i]["AwayFScore"] = onfootballRealTime[j].AwayFullScore
                            if(typeof(tmpMatchArr[i]["buyOdd"])!="undefined"){
                                tmpMatchArr[i] = this.tiggerMatchChecking(tmpMatchArr[i])
                                
                            }
                        }else if(onfootballRealTime[j].MatchStatus.includes("分鐘") && 
                                typeof(tmpMatchArr[i]["buyOdd"])!="undefined"){
                            var min = onfootballRealTime[j].MatchStatus.replace("分鐘","")
                            betList[i].matchLiveMin = ""+min
                            tmpMatchArr[i].matchLiveMin = ""+min
                            if(min>0){
                                tmpMatchArr[i]["HomeFScore"] = onfootballRealTime[j].HomeFullScore
                                tmpMatchArr[i]["AwayFScore"] = onfootballRealTime[j].AwayFullScore
                                betList[i]["HomeFScore"] = onfootballRealTime[j].HomeFullScore
                                betList[i]["AwayFScore"] = onfootballRealTime[j].AwayFullScore
                                    if(tmpMatchArr[i]["place"]=="主"){
                                        tmpMatchArr[i]["AwayFScore"] = ""+(parseFloat(tmpMatchArr[i]["AwayFScore"]) + 1)
                                    }else{
                                        tmpMatchArr[i]["HomeFScore"] = ""+(parseFloat(tmpMatchArr[i]["HomeFScore"]) + 1)
                                    }
                                tmpMatchArr[i] = this.tiggerMatchChecking(tmpMatchArr[i])
                            }
                        }
                    }
               }
            }

        }

        console.table(tmpMatchArr)
        
        hkjcDailySch["matchList"] = betList
        fs.writeFileSync("./liveData/hkjcList.json", JSON.stringify(hkjcDailySch,null,2))
        
        return [placeBetArr,hkjcDailySch,tmpMatchArr]
    }

    shouldPlaceBet(betList,config){
        var sumVar = 0
        for(var i=0;i<betList.length;i++){
            if(typeof(betList[i]["sumVal"])!="undefined" && betList[i]["matchLiveMin"]>75){
                sumVar +=betList[i]["sumVal"]
            }
        }
        if(sumVar < config.dailyBetLimit ){
            return [true,sumVar]
        }
        return [false,sumVar]
    }

    tiggerMatchChecking(match){
        match.OddData = [
            {
              "hkjc":{
                "end":{
                   "point": match["buyOdd"]
                }
              }
            }
          ]
          match.OddData[0]["hkjc"]["end"]["home"] = match["oddVal"]
          match.OddData[0]["hkjc"]["end"]["away"] = match["oddVal"]
          var result = ftUtils.calculateSingleResultAsianOdd([match],"hkjc",match["place"])
          match.res = result[0][0].res

          if(match.res =="贏"){
            match["sumVal"] = 1
          }else if(match.res =="贏半"){
            match["sumVal"] = 0.5
          }
          else if(match.res =="走"){
            match["sumVal"] = 0
          }
          else if(match.res =="輸半"){
            match["sumVal"] = -0.5
          }     
          else if(match.res =="輸"){
            match["sumVal"] = -1
          }
          return match
    }

    async getONFootballList(onfootballRealTime){
        
        if(onfootballRealTime.length == 0){
            var url = 'https://football.on.cc/cnt/result/result/current/js/score_UTF8.js?'+Date.now()
            console.log(url)
            var res = request('GET', url);
            var dataInStr = "{\"arr\":"+res.getBody('utf8').replace(/\s+/g, ' ').trim()+"}"
            let matchResult= JSON.parse(dataInStr)
            
            onfootballRealTime = matchResult.arr[0].Matches
        }
        return onfootballRealTime
    }

}
module.exports = hkjcBetEngine