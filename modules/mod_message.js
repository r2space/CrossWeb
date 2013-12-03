/**
 * Message:
 * Copyright (c) 2012 Author Name li
 */

var mongo = require('mongoose')
  // , util = require('util')
  // , log = lib.core.log
  , conn = require('./connection')
  , solr = lib.core.solr
  , schema = mongo.Schema;


var Message = new schema({
    type : {type: Number}       // 消息类型，Message:1; Reply:2
  , target: {type: String}       // 回复的对象消息ID ； 转发元消息ID
  , at: {
      users: [String]   // 提到的人
    , groups: [String]   // 提到的组
    }
  , range: {type: String} // 发布范围，公开：1 ； 某个组织：组织ID 
  , contentType: {type: String} // 消息内容的类型 textBox:纯文字 imageBox:图片 fileBox:上传文件 videoBox:视频 documentBox:文书一览          
  , content: {type: String}     // 消息文本
  , attach: [ { fileid: String, filename: String } ]         
  , createby: {type: String}
  , createat: {type: Date}
  , editby: {type: String}
  , editat: {type: Date}
  , likers: [String]    // 赞的列表
  , part: {type: schema.Types.Mixed}
  //, repnums: {type: Number}
  , thumb : {
      fileid : {type:String}
    , width: {type:Number}
    , height : {type:Number}
    }
  });


/**
 * 创建消息
 */
exports.create = function (message_, callback_) {

  var message = model();

  new message(message_).save(function(err, result) {
    // solr.update(result, "message", "insert", function(){});
    callback_(err, result);
  });
};


/**
 * 删除消息
 */
exports.remove = function(mid_, callback_) {

  var message = model();

  message.findByIdAndRemove(mid_, function(err, result) {
    solr.update(result, "message", "delete", function(){});
    callback_(err, result);
  });
};


/**
 * 更新消息
 */
exports.update = function(mid_, newvals_, callback_) {

  var message = model();

  message.findByIdAndUpdate(mid_, newvals_, function(err, result) {
    solr.update(result, "message", "update", function(){});
    callback_(err, result);
  });
};


/**
 * 赞一个消息
 */
exports.like = function(mid_, uid_, callback_){
  var message = model();
  message.findByIdAndUpdate(
      mid_
    , {$addToSet: {likers: uid_}}
    , {upsert:true}
    , function(err, result){
      callback_(err, result);
    });
};

/**
 * 取消赞
 */
exports.unlike = function(mid_, uid_, callback_){
  var message = model();
  message.findByIdAndUpdate(
      mid_
    , {$pull: {likers: uid_}}
    , {upsert:true}
    , function(err, result){
      callback_(err, result);
    });
};


/**
 * 获取一个消息
 */
exports.at = function(mid_, callback_) {

  var message = model();

  message.findById(mid_, function(err, result) {
    callback_(err, result);
  });
};


/**
 * 给定条件检索消息
 * Example: 
 *  用名称检索{content: "Hello"}
 */
exports.find = function(args_, callback_) {

  var message = model();

  message.find(args_, function(err, result) {
    callback_(err, result);
  });
};

/**

 */
exports.list = function(option_, start_, limit_, timeline_, callback_) {

  var message = model()
    , condition = []
    , before = option_.before
    , options = {"sort": {"editat": "desc"}}
    , mids = option_.mids
    , uids = option_.uids
    , gids = option_.gids
    , range = option_.range;

  // 开始位置,返回个数
  var beforeCondition = {};
  if(before){ // 取before前的消息
    beforeCondition.createat = {$lt: before};
  } else {
    options.skip = start_ || 0;
  }
  options.limit = limit_ || 20;

  // 获取，指定的人发布的公开消息
  if (uids && uids.length > 0) {
    condition.push({"createby": {$in: uids} , "range": "1"});

    // 获取，指定的人发布给指定组的消息
    if (gids && gids.length > 0) {
      condition.push({"createby": {$in: uids} , "range": {$in: gids}});
    }
  }

  // 获取，发给指定组的消息
  if (range && range.length > 0) {
    condition.push({"range": {$in: range}});
  }

  // get message by mids
  if(mids && mids.length > 0){
    condition.push({"_id": {$in: mids}});
  }
  
  if (!timeline_) {
    timeline_ = new Date();
  }

  message.count()
  .where("type").equals(1)
  .or(condition)
  .exec(function(err, count){
    message.find(beforeCondition).setOptions(options)
    .where("type").equals(1)
    .or(condition)
    .exec(function(err, messages){
      callback_(err, {total:count, items:messages});
    });
  });
};

/**
 * 获得Home Message  List  新消息个数
 * timeline_ 用户上次刷新画面的  时间点
 */
exports.unreadMessageCount = function(option_, start_, limit_, timeline_, callback_) {

  var message = model()
    , condition = []
    , options = {"sort": {"editat": "desc"}}
    , mids = option_.mids
    , uids = option_.uids
    , gids = option_.gids
    , range = option_.range;

  // 开始位置,返回个数
  options.skip = start_ || 0;
  options.limit = limit_ || 20;

  // 获取，指定的人发布的公开消息
  if (uids && uids.length > 0) {
    condition.push({"createby": {$in: uids} , "range": "1"});

    // 获取，指定的人发布给指定组的消息
    if (gids && gids.length > 0) {
      condition.push({"createby": {$in: uids} , "range": {$in: gids}});
    }
  }

  // 获取，发给指定组的消息
  if (range && range.length > 0) {
    condition.push({"range": {$in: range}});
  }

  // get message by mids
  if(mids && mids.length > 0){
    condition.push({"_id": {$in: mids}});
  }
  
  if (!timeline_) {
    timeline_ = new Date();
  }

  message.count({"createby":{"$ne":option_.login}})
  .where("createat").gt(timeline_)
  .where("type").equals(1)
  .or(condition)
  .exec(function(err, count){
    //console.log(count);
    //message.find().setOptions(options)
    //.where("createat").gt(timeline_)
    //.where("createby").equals("/^.+(?!'"+option_.login+"')$/")
    //.where("type").equals(1)
    //.or(condition)
    //.exec(function(err, messages){
    callback_(err, {total:count});
    //});
  });
};



/**
 * 获取指定ID的所有消息
 * @param {String} mids_ 消息ID数组
 */
exports.listByIds = function(uid_, mids_, callback_) {

  var message = model()
    , condition = {"_id": {$in: mids_}};

  if (uid_) {
    condition.createby = uid_;
  }

  message.find(condition).exec(function(err, messages){
    callback_(err, messages);
  });
};


/**
 * 我回复我的消息的一览
 * @param {String} mid_         原消息ID
 * @param {String} start_       开始位置
 * @param {String} limit_       返回个数
 */
exports.boxList = function(uid_, start_, limit_, callback_) {

  var message = model()
    , options = {"sort": {"createat": "desc"}};

  options.skip = start_ || 0;
  options.limit = limit_ || 20;

  message.count({"type":"2","createby":uid_})
  .exec(function(err, count){
    message.find()
      .setOptions(options)
      .where("type").equals(2)
      .where("createby").equals(uid_)
      .exec(function(err, result){
        callback_(err, {total:count,items:result});
      });
  });
};

/**
 * 获取指定消息的回复消息一览
 * @param {String} mid_         原消息ID
 * @param {String} start_       开始位置
 * @param {String} limit_       返回个数
 */
exports.replyList = function(mid_, start_, limit_, callback_) {

  var message = model()
    , options = {"sort": {"createat": "desc"}};

  options.skip = start_ || 0;
  options.limit = limit_ || 20;

  message.count({"type":"2","target":mid_})
  .exec(function(err, count){
    message.find()
      .setOptions(options)
      .where("type").equals(2)
      .where("target").equals(mid_)
      .exec(function(err, result){
        callback_(err, {total:count,items:result});
      });
  });
};

exports.forwardList = function(mid_, start_, limit_, callback_) {

  var message = model()
    , options = {"sort": {"createat": "desc"}};

  options.skip = start_ || 0;
  options.limit = limit_ || 20;

  message.count({"type":"1","target":mid_})
  .exec(function(err, count){
    message.find()
    .setOptions(options)
    .where("type").equals(1)
    .where("target").equals(mid_)
    .exec(function(err, result){
      callback_(err, {total:count,items:result});
    });
  });
};

/**
 * 获取指定消息的回复消息num
 * @param {String} mid_         原消息ID
 */
exports.replyListNum = function(mid_, callback_) {

  var message = model();

  message.count({"type":"2","target":mid_})
    .exec(function(err, result){
      callback_(err, result);
    });
};

/**
 * 获取指定消息的转发消息num
 * @param {String} mid_         原消息ID
 */
exports.forwardListNum = function(mid_, callback_) {

  var message = model();

  message.count({"type":"1","target":mid_})
    .exec(function(err, result){
      callback_(err, result);
    });
};


/**
 *  获得通知at  我的消息  
 * @param {String} id_        原消息ID
 */
exports.queryMsgAtList = function(id_, callback_){
  var message = model();
  message.find({"at": {
    "groups": [],
    "users": [id_]
  }}).exec(function(err,result){
    callback_(err,result);
  });
};

/**
 *  获得我发的消息
 * @param {String} id_        用户_id
 */
exports.queryMyMessage  = function(id_, callback_){
  var message = model();
  message.find({"type":"1","createby":id_}).exec(function(err,result){
    callback_(err,result);
  });
};
/**
 * 获得评论我的消息
 * @param {String} mid_        我发的消息ID
 */
exports.queryMsgCommentList = function(mid_, callback_){
  var message = model();
  message.find({"type":"2","target":{$in: mid_}}).exec(function(err,result){
    callback_(err,result);
  });
};




function model() {
  return conn().model('Message', Message);
}


