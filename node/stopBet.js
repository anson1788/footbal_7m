var fs = require('fs');
var config = JSON.parse(fs.readFileSync("./accountInfo.json"))
config.betDebug = true
fs.writeFileSync("./accountInfo.json", JSON.stringify(config,null,2))