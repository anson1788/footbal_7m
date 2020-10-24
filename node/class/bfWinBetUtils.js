const bfWinUtils = require('./bfWinUtils.js')
class bfWinBetUtils extends bfWinUtils{
    
    async parseBFLiveMatch(dom){
        return await this.parseBFDailyList(dom)
    }
  
}
module.exports = bfWinBetUtils



