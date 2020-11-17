const CDP = require('chrome-remote-interface');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const chromeLauncher = require('chrome-launcher');
var fs = require('fs');
var moment  = require('moment');
const NameMapping  = JSON.parse(fs.readFileSync("7m2hkjcName.json"))
class hkjcBetEngine {

    constructor() {
    }

    updateMatchingName(list){
      
        for(var i=0;i<list.length;i++){
            if(typeof(NameMapping[list[i].home])!="undefined"){
                list[i].home = NameMapping[list[i].home]
            }
            if(typeof(NameMapping[list[i].away])!="undefined"){
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
                        console.log(dom.window.document.querySelector("#"+item.id+" .cteams").textContent)
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
                        console.log(extraList[i].hkjcDate.split(" "))
                        var InsertIdx = -99
                        for(var j=0;j<localList.length;j++){
                            var weekLocal = localList[j].hkjcDate.split(" ")[1]
                            var weekNumLocal = localList[j].hkjcDate.split(" ")[2]
                            if(weekLocal==week){
                                if(weekNum<weekNumLocal){
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
                        console.log(localList[i].hkjcDate)
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

            var oddBet = "600"
         
            for(var j=0;j<betArr.length;j++){
                if(typeof(betArr[j].clickIdx)!="undefined"){
                    console.log(betArr[j].clickIdx)
                    if(betArr[j].clickIdx==i){
                        if(parseFloat(betArr[j].oddVal)<0.8){
                            oddBet = "500"
                        }
                        if(parseFloat(betArr[j].oddVal)>1){
                            oddBet = "700"
                        }
                    }
                }
            }
            await this.runExpressionNoReturn(Runtime,'document.getElementById("inputAmount'+i+'").value = '+oddBet)
            await this.runExpressionNoReturn(Runtime,'CheckRefreshUnitbet('+i+');')
            console.log('document.getElementById("inputAmount'+i+'").value = '+oddBet)
        }
    
        console.log(balance.result.value.replace("結餘: $ ",""))


        await this.runExpressionNoReturn(Runtime,'OnClickPreview();')
        if(!actInfo.betDebug){
          
            await this.runExpressionNoReturn(Runtime,'OnClickConfirmBet();')
        }
       
        var v = await this.runExpression(Runtime,'document.getElementsByClassName("previewTableCell4")[0].innerHTML')
        console.log(v.result.value)        
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


}
module.exports = hkjcBetEngine