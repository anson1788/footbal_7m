var fs = require('fs');
const path = require('path');
class dataBasicUtil {

    constructor() {

    }

   async getOddBookList(){
        var oddBookList = await this.getDirectories("oddBook")
        var betData = []
        for(var i =0;i<oddBookList.length;i++){
            let rawdata = fs.readFileSync("oddBook/"+oddBookList[i]+"/placeBet.json");
            var placeBetArr = JSON.parse(rawdata);   
            for(var j=0;j<placeBetArr.length;j++){
                placeBetArr[j].date = oddBookList[i]
                if(typeof(placeBetArr[j].res)!="undefined"){
                    betData.push(placeBetArr[j])
                }
            }
        }
        return betData
   }

   async getDirectories(path) {
       return new Promise((resolve, reject) => {
            fs.readdir("oddBook", function (err, files) {
                //handling error
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                } 
                var list = []
                files.forEach(function (file) {
                    // Do whatever you want to do with the file
                    //console.log(file); 
                    if(file.includes("-")){
                        list.push(file+"")
                    }
                });
                resolve(list)
            });
       });
    }
}
module.exports = dataBasicUtil