const log4js = require('log4js');
// Accessory configurations for log4js
// Works with log4js >= 2.3.3

// Usage:
//var logger = require('./app/loadLogger').logger; // Default is stderr only

// Alternate (app : file + stderr)
// const loadLog = require('./app/loadLogger');
// var logger = loadLog.log4js.getLogger('app'); // For an express app:  stderr + file : logs/application.log)
var $depth = 11;

function ln(){
  let toReplace=(new Error).stack.split("\n")[$depth];
  if (toReplace == undefined){
    return "";
  } else {
    return toReplace.replace(/^\s+at\s+(\S+)\s\((.+?)([^\/]+):(\d+):\d+\)$/, function(){
      return arguments[1] + ' ' + arguments[3] + ' line ' + arguments[4];
   });
  }
};

var config = {
 "appenders": {
   "fileLogger": {
     "type": "file",
     "filename": "logs/application.log",
     "maxLogSize": 20480,
     "backups": 3,
     "layout": {
       "type": "pattern",
       "pattern": "[%[%5.5p%]] %d{ISO8601_WITH_TZ_OFFSET} - {%x{ln}}|%]\t%m",
       "tokens": {
         "ln": ln
       }
     },
     "category": "fileLogger"
   },
   "consoleLogger": {
     "type": "stderr",
     "layout": {
       "type": "pattern",
       "pattern": "[%[%5.5p%]] %d - {%x{ln}}|%]\t%m",
       "tokens": {
         "ln": ln
       }
     },
     "category": "consoleLogger"
   }
 },
  "categories": {
    "default": {
      "appenders": ["consoleLogger"],
      "level": "WARN"
    },
    "app": {
      "appenders": ["consoleLogger", "fileLogger"],
      "level": "DEBUG"
    }
  }
};

log4js.configure(config);

var logger = new log4js.getLogger('default');

module.exports = {
  logger: logger,
  log4js: log4js
}
