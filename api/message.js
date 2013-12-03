var message = require('../controllers/ctrl_message')
  , api_message = require('../api/message')
  // , amqp = lib.core.amqp
  , util = lib.core.util
  , json = lib.core.json;
  // , dbfile = lib.ctrl.dbfile
  // , notification = lib.ctrl.notification;

/**
 * createMessage:
 *  发表留言
 * Update On:
 *  2012/9/20 12:00
 * Resource Information:
 *  API - /message/createMessage.json
 *  支持格式 - json
 *  HTTP请求方式 - POST
 *  是否需要登录 - YES
 *  访问授权限制 - NO
 * Example:
 *  Resource - URL: http://localhost:3000/message/createMessage.json
 *  Resource - Object: {
 *  code: 200,
 *  msg: "发布信息成功",
 *  message: {
 *    content: "hello world",
 *    createat: 1348485575652,
 *    createby: "sh",
 *    editat: 1348485575652,
 *    editby: "sh"
 *  }
 * @param {String}  content (required) 消息内容
 * @return {code} 响应结果状态码
 * @return {msg} 响应结果信息
 * @return {message} 消息对象
 */
exports.createMessage = function(req_, res_){

  var currentuser = req_.session.user._id;

  message.createMessage(currentuser, req_.body, function(err, result) {
    if (err) {
      return res_.send(json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema({items: result}));
    }
  });
};

exports.copyMessage = function(req_, res_){

  var currentuser = req_.session.user._id;

  message.copyMessage(currentuser, req_.body, function(err, result) {
    if (err) {
      return res_.send(json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema({items: result}));
    }
  });
};


/*
  我发出的评论的Api
*/ 
exports.getMessageBoxList = function(req_, res_) {

  var start = Number(util.checkString(req_.query.start));
  var count = Number(util.checkString(req_.query.count));
  var uid   = req_.session.user._id;

  message.getMessageBoxList(uid, start, count, function(err, result) {
    if (err) {
      return res_.send(json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

/*
一共有三种取得message list的情况
A.homepage 当前login user能看见的所有的相关信息
 1.我关注人的发言+我的发言
 2.相关组的发言
 3.followed文件的动态
 4.followed新鲜事的关注
B.用户的主页
C.组的主页
*/ 
exports.getMessageList = function(req_, res_, option_) {

  var start = Number(util.checkString(req_.query.start));
  var count = Number(util.checkString(req_.query.count));
  option_.before = req_.query.before;

  message.getMessageList(option_, start, count, function(err, result) {
    if (err) {
      return res_.send(json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

exports.getGroupHomePageMessageList = function(req_, res_) {

  var gid = util.checkString(req_.query.gid);
  var option = {
    "gid" : gid ,
    "login" : req_.session.user._id ,
    "type" : "group-homepage"
  };
  api_message.getMessageList(req_,res_, option);
};

exports.getUserHomePageMessageList = function(req_, res_) {
  
  var uid = util.checkString(req_.query.uid);
  var option = {
    "uid" : uid ,
    "login" : req_.session.user._id ,
    "type" : "user-homepage"
  };
  api_message.getMessageList(req_,res_, option);
};

exports.getTopPageMessageList = function(req_, res_) {

  var option = {
    "login" : req_.session.user._id ,
    "type" : "topPage"
  };
  api_message.getMessageList(req_,res_, option);
};

/**
 * deleteMessage:
 *  删除消息
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /message/delete.json
 *  支持格式 - json
 *  HTTP请求方式 - DELETE
 *  是否需要登录 - YES
 *  访问授权限制 - NO
 * @param {String}  mid 消息ID
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 删除的消息对象
 */
exports.deleteMessage = function(req_, res_){
  var mid = util.checkString(req_.body.mid);

	message.deleteMessage(mid, function(err, result){
    if(err){
      return res_.send({
          "code": err.code
        , "msg": err.message
        });
    }else{
      return res_.send(result);
    }
  });
};

exports.like = function(req_, res_){
  var mid = util.checkString(req_.body.mid);
  var uid = req_.session.user._id;
  message.like(mid, uid, function(err, result){
    if(err){
      return res_.send({
          "code": err.code
        , "msg": err.message
        });
    }else{
      return res_.send(json.dataSchema(result));
    }
  });
};

exports.unlike = function(req_, res_){
  var mid = util.checkString(req_.body.mid);
  var uid = req_.session.user._id;
  message.unlike(mid, uid, function(err, result){
    if(err){
      return res_.send({
          "code": err.code
        , "msg": err.message
        });
    }else{
      return res_.send(json.dataSchema(result));
    }
  });
};

/**
 * getMessage:
 *  查询单条消息
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /message/get.json
 *  支持格式 - json
 *  HTTP请求方式 - GET
 *  是否需要登录 - NO
 *  访问授权限制 - NO
 * @param {String}  mid 消息ID
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 查得的消息对象
 */
exports.getMessage = function(req_, res_){
  var mid = util.checkString(req_.query.mid);
  var login = req_.session.user._id;

  message.getMessage(mid, login, function(err, result){
    if (err) {
      return res_.send(json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

/**
 * getProfileMessage:
 *  查询单条消息
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /message/profileMessage.json
 *  支持格式 - json
 *  HTTP请求方式 - GET
 *  是否需要登录 - YES
 *  访问授权限制 - NO
 * @param {String}  timeline 时间轴
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 主页面消息对象集合
 */
exports.getProfileMessage = function(req_, res_){
  var timeline = util.checkString(req_.query.timeline);
  var uid = req_.session.user ? req_.session.user._id : "";
  var start = Number(util.checkString(req_.query.start)) || 1;
  var count = Number(util.checkString(req_.query.count)) || 20;

  message.getProfileMessage(uid, start, count, timeline, function(err, result){
    if(err){
      return res_.send(json.errorSchema(err.code, err.message));
    }else{
      return res_.send(json.dataSchema({items: result}));
    }
  });
};

/**
 * addReply:
 *  增加回复
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /message/addReply.json
 *  支持格式 - json
 *  HTTP请求方式 - POST
 *  是否需要登录 - YES
 *  访问授权限制 - NO
 * @param {String}  mid (required) 消息ID
 * @param {String}  content 消息内容
 * @param {String}  to 对象用户ID
 * @param {String}  attach 附件
 * @param {String}  by 回复者ID
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 回复后的消息对象
 */
exports.addReply = function(req_, res_){
  var content = util.checkString(req_.body.content);
  var replyto = util.checkString(req_.body.replyto);
  var attach = util.checkObject(req_.body.attach);
  var notifyto = util.checkObject(req_.body.notifyto);
  var by = req_.session.user ? req_.session.user._id : "";
  var at = Date.now();

  message.addReply(content, notifyto, replyto, by, at, attach, function(err, result){
    if(err){
      return res_.send({
          "code": err.code
        , "msg": err.message
        });
    }else{
      return res_.send(result);
    }
  });
};

exports.getForwardList = function(req_, res_){
  var mid = util.checkString(req_.query.mid);
  var start = Number(util.checkString(req_.query.start)) || 0;
  var count = Number(util.checkString(req_.query.count)) || 20;

  message.getForwardList(mid, start, count, function(err, result){
    if (err) {
      return res_.send(json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

exports.getReplyList = function(req_, res_){
  var mid = util.checkString(req_.query.mid);
  var start = Number(util.checkString(req_.query.start)) || 0;
  var count = Number(util.checkString(req_.query.count)) || 20;

  message.getReplyList(mid, start, count, function(err, result){
    if (err) {
      return res_.send(json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });

};

exports.getMsgAtList = function(req_,res_){
  //获取我的uid
  var _id = req_.session.user._id;


  message.getMsgAtList(_id, function(err, result){
    if (err) {
      res_.send({msg: 'bad request exception'});
    } else {
      res_.send(json.dataSchema({items: result}));
    }
  });
};

exports.getMsgCommentList = function(req_,res_){
  //获取我的uid
  var _id = req_.session.user._id;

  message.getMsgCommentList(_id, function(err, result){
    if (err) {
      res_.send({msg: 'bad request exception'});
    } else {
      res_.send(json.dataSchema({items: result}));
    }
  });

};


exports.getMsgUnRead = function(req_,res_){
  //获取我的uid
  var option = {
    "login" : req_.session.user._id
  };
  var _timeline = req_.query.timeline;
  message.getMsgUnRead(option,_timeline,function(err,result){
    if (err) {
      res_.send({msg: 'bad request exception'});
    } else {
      res_.send(json.dataSchema({items: result}));
    }
  });

};

