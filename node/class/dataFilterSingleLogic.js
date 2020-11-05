const dataFilter = require('./dataFilter.js')
var fs = require('fs');

class dataFilterSingleLogic extends dataFilter{
  pointDropOdDrop(OddData){
      var rtnVal = false

      var total = 0
      var matchCondition = 0 
      for(var broker in OddData){
          total ++
          var startOddPoint = OddData[broker]["start"]["point"]
          var startOddHome = parseFloat(OddData[broker]["start"]["home"])
          var startOddAway = parseFloat(OddData[broker]["start"]["away"])
          var endOddPoint = OddData[broker]["end"]["point"]
          var endOddHome = parseFloat(OddData[broker]["end"]["home"])
          var endOddAway = parseFloat(OddData[broker]["end"]["away"])

          var homeOddPerStart =  startOddHome /(startOddHome + startOddAway)
          var homeOddPerEnd =  endOddHome /(endOddHome + endOddAway)
          
          var awayOddPerStart =  startOddAway /(startOddHome + startOddAway)
          var awayOddPerEnd =  endOddAway /(endOddHome + endOddAway)
          
          
          if(!startOddPoint.includes("受") && !endOddPoint.includes("受") &&
          homeOddPerStart>homeOddPerEnd && this.getOddIdx(startOddPoint) -  this.getOddIdx(endOddPoint) == 1
          ){
            matchCondition++
          }
      }

      if(matchCondition > total-4 && 
        OddData["香港马会"]["start"]["point"] ==OddData["香港马会"]["end"]["point"] &&
        OddData["香港马会"]["start"]["point"] =="平手"
        ){
        rtnVal = true
      }
      return rtnVal 
  }
}
module.exports = dataFilterSingleLogic