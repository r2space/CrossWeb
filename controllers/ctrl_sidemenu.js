
var sync      = require("async")
  , _         = require('underscore')
  , user      = lib.ctrl.user
  , group     = lib.ctrl.group
  , shortmail = require("./ctrl_shortmail")
  , util      = lib.core.util;

/**
 * 消息
 */
exports.message = function(uid_, callback_) {

  var sidemenus = [];

  sync.waterfall([
    // 通知
    function(callback) {
      exports.notification(function(err, result){
        sidemenus.push(result.items[0]);
        callback(err);
      });
    },

    // 组
    function(callback) {
      exports.group(uid_, function(err, result){
        sidemenus.push(result.items[0]);
        callback(err);
      });
    }
  ],
    
  function(err) {
    callback_(err, {items: sidemenus});
  });
};

exports.notification = function(callback_) {
  var sidemenu = {
      "item": "notification"
    , "type": "notification"
    , "title": __("navbar.menu.notification")
    , "submenus": []
    };

  sidemenu.submenus.push({
      "item": "at"
    , "type": "notification"
    , "title": __("sidemenu.message.atme")
    });

  sidemenu.submenus.push({
      "item": "comment"
    , "type": "notification"
    , "title": __("sidemenu.message.replyme")
    });

  callback_(null, {items: [sidemenu]});
};

exports.user = function(uid_, callback_) {

  sync.waterfall([

    // 获取给定用户的好友
    function(callback) {

      user.getUserList({"kind":"following", "firstLetter":"", "uid":uid_, "start":0, "limit":20}, function(err, result) {
        callback(err, result);
      });
    },

    // 获取好友的详细信息
    function(following, callback) {

      user.listByUids(following, 0, 5, function(err, result){
        callback(err, result);
      });
    }

  ], function(err, result) {

    var sidemenu = {
        "item": "following"
      , "type": "folder"
      , "title": __("sidemenu.user.following")
      , "submenus": []
      };
    
    _.each(result, function(item){
      sidemenu.submenus.push({
          "item": item._id
        , "type": "user"
        , "title": item.name.name_zh
        });
    });

    callback_(err, {items: [sidemenu]});
  });
};

/**
 * 组
 */
exports.group = function(uid_, callback_) {

  var condition = {
      "uid": uid_
    , "joined":true
    };

  group.getGroupList(condition, function(err, result){
    
    var sidemenu = {
        "item": "groups"
      , "title": __("sidemenu.group")
      , "type": "folder"
      , "submenus": []
      };
    
    _.each(result, function(item){
      sidemenu.submenus.push({
          "item": item._id
          //判断租名字 是否为object类型
        , "title": util.isAllNull(item.name.name_zh)?item.name:item.name.name_zh
        , "type": "group"
        });
    });

    callback_(err, {items: [sidemenu]});
  });
};

exports.fulltextsearch = function(uid_, callback_) {
  var sidemenu = {
      "item": "filter"
    , "type": "title"
    , "title": "Filter"
    , "submenus": []
    };

  sidemenu.submenus.push({
      "item": "all"
    , "type": "fts"
    , "title": "All"
    });

  sidemenu.submenus.push({
      "item": "user"
    , "type": "fts"
    , "title": __("navbar.menu.user")
    });

  sidemenu.submenus.push({
      "item": "group"
    , "type": "fts"
    , "title": __("navbar.menu.group")
    });

  sidemenu.submenus.push({
      "item": "message"
    , "type": "fts"
    , "title": __("navbar.menu.message")
    });
    
  callback_(null, {items: [sidemenu]});
};

exports.shortmail = function(uid_, callback_) {
  var sidemenus = [];

  shortmail.getMailUser(uid_, function(err, result){
    var menu = {
        "item": "users"
      , "title": __('shortmail.html.label.talk')
      , "type": "folder"
      , "submenus": []
      };

    _.each(result.items, function(item){
      menu.submenus.push({
          "item": item._id
        , "title": item.name.name_zh
        , "notice": item._doc.unreadCount
        , "href": "/shortmail/" + item._id
        , "type": "sortmail"
        });
    });

    sidemenus.push(menu);
    callback_(null, {items: sidemenus});
  });
};

exports.bookmark = function(callback_) {

  var sidemenu = {
      "item": "bookmark"
    , "type": "folder"
    , "title": __("Bookmark")
    , "submenus": []
    };

  sidemenu.submenus.push({
      "item": "news"
    , "type": "bookmark"
    , "title": "新鲜事儿"
    });
  sidemenu.submenus.push({
      "item": "message"
    , "type": "bookmark"
    , "title": "消息"
    });
  sidemenu.submenus.push({
      "item": "notice"
    , "type": "bookmark"
    , "title": "通知"
    });

  callback_(null, {items: [sidemenu]});
};

exports.files = function(uid_, callback_) {
  var sidemenu = {
      "item": "myfiles"
    , "type": "folder"
    , "title": __("sidemenu.file.mine")
    , "submenus": []
    };

  // sidemenu.submenus.push({
  //     "item": "official"
  //   , "type": "files"
  //   , "title": __("sidemenu.file.public")});
  // sidemenu.submenus.push({
  //     "item": "recent"
  //   , "type": "files"
  //   , "title": __("sidemenu.file.updated")
  // });
  // sidemenu.submenus.push({
  //     "item": "following"
  //   , "type": "files"
  //   , "title": __("sidemenu.file.followed")
  // });

  sidemenu.submenus.push({
      "item": "file"
    , "type": "folder"
    , "title": __("file.tab.file")
    });
  sidemenu.submenus.push({
      "item": "image"
    , "type": "folder"
    , "title": __("file.tab.image")
    });
  sidemenu.submenus.push({
      "item": "video"
    , "type": "folder"
    , "title": __("file.tab.video")
    });
  sidemenu.submenus.push({
      "item": "audio"
    , "type": "folder"
    , "title": __("file.tab.audio")
    });

  callback_(null, {items: [sidemenu]});

};
