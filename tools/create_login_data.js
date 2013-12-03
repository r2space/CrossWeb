
// ----
Object.defineProperty(global, 'lib', {
  get: function(){
    console.log("" + __dirname + path.sep + ".." + path.sep + confapp.libs);
    return require("" + __dirname + path.sep + ".." + path.sep + confapp.libs);
  }
});

// ----
var sync    = require('async')
  , path    = require("path")
  , confapp = require("config").app
  , csv     = require('csv')
  , auth    = lib.core.auth
  , group   = lib.mod.group
  , user    = lib.mod.user;

var operationDate = new Date();

sync.waterfall([

  // 创建组
  function(callback) {
    var g = {
        "name": {
            "name_zh": "Dac China"
          , "letter_zh": "Dac China"
          }
        , "description": "梦创信息（大连）有限公司"
        , "type": 2
        , "secure": 2
        , "createby": "li"
        , "createat": operationDate
        , "editby": "li"
        , "editat": operationDate
        };

    group.create(g, function(err, result) {
      console.log(result);
      callback(err, result);
    });
  },

  // 读取csv文件
  function(g, callback) {
    csv().from.path(__dirname+'/address.csv').on('record', function(row) {
      console.log(row);

      /^(.*)@.*$/.test(row[2]);
      var u = {
          "uid": row[2]
        , "password": auth.sha256(RegExp.$1)
        , "email": {
            "email1": row[2]
          }
        , "name": {
            "name_zh": row[0] + row[1]
          , "letter_zh": " "
          }
        , "tel": {
            "mobile": row[3]
          }
        , "createby": "li"
        , "createat": operationDate
        , "editby": "li"
        , "editat": operationDate
        , "lang" : "zh"
        , "timezone" : "GMT+08:00"
        };

      // 添加用户
      user.create(u, function(err, result) {

        // 加为成员
        group.addMember(g._id, result._id, function(){
        });
      });

    }).on('end', function(count){
      console.log('Number of lines: ' + count);

      callback();
    }).on('error', function(error){
      console.log(error.message);
    });
  }

], function(err) {
  console.log(err);
});
