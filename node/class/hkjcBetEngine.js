const CDP = require('chrome-remote-interface');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const chromeLauncher = require('chrome-launcher');

class hkjcBetEngine {

    constructor() {
    }


    async buyOdd(betArr,actInfo){
        let client;
        if(betArr.length==0) return
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

            var oddBet = actInfo.HDCBetVal
         
            for(var j=0;j<betArr.length;j++){
                if(typeof(betArr[j].clickIdx)!="undefined"){
                    console.log(betArr[j].clickIdx)
                    if(betArr[j].clickIdx==i){
                        if(parseFloat(betArr[j].oddVal)<0.8){
                            oddBet = "400"
                        }
                        if(parseFloat(betArr[j].oddVal)>1){
                            oddBet = "600"
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