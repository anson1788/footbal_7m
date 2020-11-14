var fs = require('fs');
const path = require('path');
var moment = require('moment');
var request = require('sync-request');
const { join } = require('bluebird');
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
        return [betData,oddBookList]
   }

   async getONCCDataList(dateList){
     var dayRange = Math.abs(this.getDateDifferent(dateList[0]))
     var onccData = []
     for(var i =0;i<dayRange+2;i++){
       var calculatedDate = moment({ 
            year :moment().year(), 
            month :moment().month(), 
            day :moment().date()
            }).subtract(i, 'days');
        calculatedDate = calculatedDate.format("YYYYMMDD")
        var res = request('GET', 'https://football.on.cc/cnt/result/result/'+calculatedDate+'/js/result_UTF8.js');
        var dataInStr = "{\"arr\":"+res.getBody('utf8').replace(/\s+/g, ' ').trim()+"}"
        let matchResult= JSON.parse(dataInStr)
        var todayMatch = matchResult.arr[0].Matches

        for (var j=0;j<todayMatch.length;j++){
            var isContainInList = 0
             for(var k=0;k<onccData.length;k++){
                if(onccData[k].HomeTeamCName ==todayMatch[j].HomeTeamCName &&
                    onccData[k].AwayTeamCName ==todayMatch[j].AwayTeamCName ){
                        isContainInList = 1
                    }
             }
             /*
             "HomeFullScore" : "6",
			"AwayFullScore" : "0",
             */
            
             if(isContainInList==0){
                if(parseFloat(todayMatch[j].HomeFullScore)+parseFloat(todayMatch[j].AwayFullScore)>=0){

                    if(parseFloat(todayMatch[j].HomeFullScore)+parseFloat(todayMatch[j].AwayFullScore)==0){
                        todayMatch[j].isLive = "un"
                    }else{
                        if(todayMatch[j].NextTeamScore.length>0){
                            todayMatch[j].isLive ="y"
                        }else{
                            todayMatch[j].isLive ="n"
                        }
                    }
                    delete todayMatch[j].AwayTeamEName
                    delete todayMatch[j].HomeTeamEName
                    delete todayMatch[j].Red
                    delete todayMatch[j].MatchStatus

                    delete todayMatch[j].StartTime
                    delete todayMatch[j].DayOfWeek
                    delete todayMatch[j].MatchNum
                    delete todayMatch[j].TournamentId
                    


                    delete todayMatch[j].StartDateTime
                    delete todayMatch[j].HomeOTFirstHalfScore
                    delete todayMatch[j].AwayOTFirstHalfScore
                    delete todayMatch[j].HomeOTSecondHalfScore
                    delete todayMatch[j].AwayOTSecondHalfScore
                    delete todayMatch[j].HomePKScore
                    delete todayMatch[j].AwayPKScore


                    delete todayMatch[j].HomeRedCardNum
                    delete todayMatch[j].AwayRedCardNum
                    delete todayMatch[j].HomeScoreUpdateStatus
                    delete todayMatch[j].AwayScoreUpdateStatus


                    delete todayMatch[j].Dividend
                    delete todayMatch[j].Refund
                    delete todayMatch[j].TeamQualifiedL
                    delete todayMatch[j].CornerResult

                    delete todayMatch[j].Goal
                    delete todayMatch[j].FirstTeamScore
                    delete todayMatch[j].NextTeamScore
                    delete todayMatch[j].FirstGoalScore

                    onccData.push(todayMatch[j])
                }
             }
        }
      }
      return onccData
   }

   getDateDifferent(first){
        var diff =  this.dateStrToMoment(first).diff(moment(),"day")
        return diff;
   }

   dateStrToMoment(date){
        let d3 = moment({ 
            year :date.split("-")[2],
            month :parseFloat(date.split("-")[1])-1, 
            day :date.split("-")[0]
            });
        return d3
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