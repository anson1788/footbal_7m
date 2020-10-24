var moment = require('moment');
const CDP = require('chrome-remote-interface');
const jsdom = require("jsdom");
const chromeLauncher = require('chrome-launcher');
const { JSDOM } = jsdom;
const { initParams } = require('request');
const { log } = require('console');

let logError = true
class basicUtils {
   
    constructor() {
    }
    generateDate(minus=0, format="YYYYMMDD"){
       return moment().subtract(minus, "days").format(format);
    }



    async getHttpDomAsyn(url, type){
        return new Promise(resolve=>{
            this.getHttpDom(url,type).then(result=>{
                resolve(result)
            })
        }).then(result =>{
            return result
        })
      
    }
    
   async getHttpDom(url,type){
   
        try{
            const launchChrome = () =>
            chromeLauncher.launch({ chromeFlags: ['--disable-gpu', '--headless'] });
            const chrome = await launchChrome();
            const client = await CDP({ port: chrome.port });

                try {
        
                    const {Network, Page, Runtime} = client;
                    var dom = await this.loadUrlJSOM(Network, Page,Runtime,url,type);
                    client.close();
                    chrome.kill();
                    return dom
        
                } catch (err) {
                    console.error(err); return null
                } finally {
                    if (client) {
                        await client.close();
                    }
                }
            
        }catch(e){
            return null
        }
    }
  
    async loadUrlJSOM(mNetwork, mPage,mRuntime,mUrl,type){
        const timeout = ms => new Promise(resolve => setTimeout(resolve, ms))
        await mNetwork.enable();
        await mPage.enable();
        await mPage.navigate({url: mUrl});
        await mPage.loadEventFired();
        //console.log('Page loaded! Now waiting a few seconds for all the JS to load...');
        await timeout(1500) // give the JS some time to load
        if(type=="bfHistory"){
           await this.bfJS1(mRuntime);
           await this.bfJS2(mRuntime);
        }
        const a = await this.f(mRuntime);
       
        const dom = new JSDOM(a);
        return dom;
    }

    async bfJS1(b) {
        return b.evaluate({expression: 'document.getElementById("hn_t").click()'}).then((result) => {
            const a = result.result.value;
            return a;
        });
    }
    async bfJS2(b) {
        return b.evaluate({expression: 'document.getElementById("an_t").click()'}).then((result) => {
            const a = result.result.value;
            return a;
        });
    }

    async f(b) {
        return b.evaluate({expression: 'document.documentElement.outerHTML'}).then((result) => {
            const a = result.result.value;
            return a;
        });
    }

    logError(_str){
        if(logError){
            console.log(_str)
        }
    }
}
module.exports = basicUtils