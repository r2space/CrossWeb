var sync    = require('async')
, _       = require("underscore")
  , auth    = require("../core/auth")
  , mod_group   = require('../modules/mod_group')
  , user    = require('../modules/mod_user');

var operationDate = new Date();

sync.waterfall([

  // 创建DA
  function(callback) {
    var g = {
        "name": {
          "name_zh":"DA",
          "letter_zh":"DA"
        }
      , "description": "Dream Arts"
      , "type": 2
      , "secure": 1
      , "createby": "li"
      , "createat": operationDate
      , "editby": "li"
      , "editat": operationDate
    }
    mod_group.create(g, function(err, result) {
      callback(err, result);
    });
  },

  // DAC
  function(g, callback) {
    var group = {
         "name": {
          "name_zh":"DA China",
          "letter_zh":"DAC"
        }
      , "parent":g._id
      , "description": "梦创信息（大连）有限公司"
      , "type": 2
      , "secure": 1
      , "createby": "li"
      , "createat": operationDate
      , "editby": "li"
      , "editat": operationDate
    }
    user.find({"name.name_zh": {$in: ["宋文淋","張吉旺"]}}, function(err, member){
      var ids = [];
      _.each(member,function(m){ids.push(m._id);});
      group.member = ids;
      mod_group.create(group, function(err, result) {
        callback(err, result);
      });
    });
  },

  // 业务管理部
  function(g, callback) {
    var group = {
         "name": {
          "name_zh":"业务管理部",
          "letter_zh":"yewu"
        }
      , "parent":g._id
      , "description": "业务管理部"
      , "type": 2
      , "secure": 1
      , "createby": "li"
      , "createat": operationDate
      , "editby": "li"
      , "editat": operationDate
    }

    user.find({"name.name_zh": {$in: ["曲春華","形月"]}}, function(err, member){
      var ids = [];
      _.each(member,function(m){ids.push(m._id);});
      group.member = ids;
      mod_group.create(group, function(err, result) {
        callback(err, g._id);
      });
    });
  },

  // support
  function(parent, callback) {
    var group = {
         "name": {
          "name_zh":"技术支持（中国）",
          "letter_zh":"support"
        }
      , "parent":parent
      , "description": "技术支持（中国）"
      , "type": 2
      , "secure": 1
      , "createby": "li"
      , "createat": operationDate
      , "editby": "li"
      , "editat": operationDate
    }

    user.find({"name.name_zh": {$in: ["于雪芹","閻妍","王芳","","","","","","","","","",""]}}, function(err, member){
      var ids = [];
      _.each(member,function(m){ids.push(m._id);});
      group.member = ids;
      mod_group.create(group, function(err, result) {
        callback(err, parent);
      });
    });
  },

  // NHK
  function(parent, callback) {
    var group = {
         "name": {
          "name_zh":"NHK（中国）",
          "letter_zh":"nhk"
        }
      , "parent":parent
      , "description": "NHK（中国）"
      , "type": 2
      , "secure": 1
      , "createby": "li"
      , "createat": operationDate
      , "editby": "li"
      , "editat": operationDate
    }

    user.find({"name.name_zh": {$in: ["呉明喜","邵亜平","瀋華","全国","孫博","王麗潔","羅浩","董暁贇","周蛟竜","管世明","",""]}}, function(err, member){
      var ids = [];
      _.each(member,function(m){ids.push(m._id);});
      group.member = ids;
      mod_group.create(group, function(err, result) {
        callback(err, parent);
      });
    });
  },

  // INSUITE
  function(parent, callback) {
    var group = {
         "name": {
          "name_zh":"INSUITE（中国）",
          "letter_zh":"insuite"
        }
      , "parent":parent
      , "description": "INSUITE（中国）"
      , "type": 2
      , "secure": 1
      , "createby": "li"
      , "createat": operationDate
      , "editby": "li"
      , "editat": operationDate
    }

    user.find({"name.name_zh": {$in: ["朱晨","戦暁鹿","孫広旭","戴丹丹","張成","方強","石橋卓也","","","","","","","","","",""]}}, function(err, member){
      var ids = [];
      _.each(member,function(m){ids.push(m._id);});
      group.member = ids;
      mod_group.create(group, function(err, result) {
        callback(err, parent);
      });
    });
  },

  // Smartdb
  function(parent, callback) {
    var group = {
         "name": {
          "name_zh":"SmartDB（中国）",
          "letter_zh":"smartdb"
        }
      , "parent":parent
      , "description": "SmartDB（中国）"
      , "type": 2
      , "secure": 1
      , "createby": "li"
      , "createat": operationDate
      , "editby": "li"
      , "editat": operationDate
    }

    user.find({"name.name_zh": {$in: ["王東","徐陽","楊勝利","楊暁宇","李政","梁翠英","趙麗曄","","","","","",""]}}, function(err, member){
      var ids = [];
      _.each(member,function(m){ids.push(m._id);});
      group.member = ids;
      mod_group.create(group, function(err, result) {
        callback(err, parent);
      });
    });
  },

  // center
  function(parent, callback) {
    var group = {
         "name": {
          "name_zh":"Center（中国）",
          "letter_zh":"center"
        }
      , "parent":parent
      , "description": "Center（中国）"
      , "type": 2
      , "secure": 1
      , "createby": "li"
      , "createat": operationDate
      , "editby": "li"
      , "editat": operationDate
    }

    user.find({"name.name_zh": {$in: ["王錫綱","王森森","王宏瑜","崔江娟","孫娜","李海礁","魏巍","張欣威","周魏魏","","",""]}}, function(err, member){
      var ids = [];
      _.each(member,function(m){ids.push(m._id);});
      group.member = ids;
      mod_group.create(group, function(err, result) {
        callback(err, parent);
      });
    });
  },

  // 开发
  function(parent, callback) {
    var group = {
         "name": {
          "name_zh":"开发（中国）",
          "letter_zh":"kaifa"
        }
      , "parent":parent
      , "description": "开发（中国）"
      , "type": 2
      , "secure": 1
      , "createby": "li"
      , "createat": operationDate
      , "editby": "li"
      , "editat": operationDate
    }

    user.find({"name.name_zh": {$in: ["王琳琪","王経国","李林","李浩","","","","","","","","",""]}}, function(err, member){
      var ids = [];
      _.each(member,function(m){ids.push(m._id);});
      group.member = ids;
      mod_group.create(group, function(err, result) {
        callback(err, parent);
      });
    });
  }

], function(err) {
  callback("ok");
});
