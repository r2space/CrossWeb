/**
 * notification:
 * Copyright (c) 2012 Author Name li
 */

var _ = smart.util.underscore
  , mongo = smart.util.mongoose
  , util = smart.framework.util
  , log = smart.framework.log
  , conn = smart.framework.connection
  , sync = smart.util.async
  , ctrl_group = require("../controllers/ctrl_group")
  , schema = mongo.Schema;

function model(code) {
  return conn.model(code, 'Notification', Notification);
}

// 通知的数据结构设计为不允许编辑
var Notification = new schema({
    content: {type: String, description: "通知内容"}  
  , readers: [String]
  , tousers: [String]  // 人
  , togroups: [String]   // 组
    // at . reply . document
  , type: {type: String, description: "通知类型 5:文书更新消息"}
  , createby: {type: String, description: "发送者"}
  , createat: {type: Date, description: "创建时间"}
  , objectid: {type: String, description: "objectid"}
});

exports.create = function(notification_, callback_) {
  
  var notification = model();
  new notification(notification_).save(function(err, notification){
    callback_(err, notification);
  });
};


exports.delete = function(nid_, callback_) {

  var notification = model();

  notification.findByIdAndRemove(nid_, function(err, result) {
    callback_(err, result);
  });
};


exports.update = function(nid_, newvals_, callback_) {

  var notification = model();

  notification.findByIdAndUpdate(nid_, newvals_, function(err, result) {
    callback_(err, result);
  });
};


exports.at = function(nid_, callback_) {

  var notification = model();

  notification.findById(nid_, function(err, result) {
    callback_(err, result);
  });
};

exports.list = function(option_, callback_) {

  var notification = model()
    , or = []
    , and = []
    , options = {"sort": {"createat": "desc"}}
    , start = option_.start
    , limit = option_.limit
    , uid = option_.uid
    , type = option_.type
    , unread = option_.unread;

  // 开始位置,返回个数
  options["skip"] = start || 0;
  options["limit"] = limit || 20;

  or.push({"tousers":uid});

  if(unread){
    and.push({"readers": { $ne : uid }});
  }

  if(type){
    var types = [];
    if(type.indexOf(",") == -1){
      types.push(type);
    } else {
      types = type.split(",");
    }
//    console.log(types);
    and.push({"type":{$in : types}});
  }

  ctrl_group.getAllGroupByUid(uid, function(err, groups){
    var gids = [];
    _.each(groups, function(g){gids.push(g._id);});
    or.push({"togroups": {$in : gids}});
    
    if(and.length>0){
      notification.count()
      .and(and)
      .or(or)
      .exec(function(err, count){
          notification.find().setOptions(options)
          .and(and)
          .or(or)
          .exec(function(err, messages){
            callback_(err, {total:count, items:messages});
          });
      });
    }else{
      notification.count()
      .or(or)
      .exec(function(err, count){
          notification.find().setOptions(options)
          .or(or)
          .exec(function(err, messages){
            callback_(err, {total:count, items:messages});
          });
      });
    }

  });

};


exports.find = function(args_, callback_) {

  var notification = model();

  notification.find(args_, function(err, result) {
    callback_(err, result);
  });
};

