
var util = lib.core.util;
var ctrl_topic = require('../controllers/ctrl_topic');

/**
 * getTopic:
 *  查询一条话题
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /topic/get.json
 *  支持格式 - json
 *  HTTP请求方式 - GET
 *  是否需要登录 - NO
 *  访问授权限制 - NO
 * @param {String}  _id (required) 话题ID
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 查得的话题对象
 */
exports.getTopic = function(req_, res_){
  var tid = util.checkString(req_.query._id);

  ctrl_topic.getTopic(tid, function(err, result){
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

/**
 * getTopicList:
 *  查询话题列表
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /topic/list.json
 *  支持格式 - json
 *  HTTP请求方式 - GET
 *  是否需要登录 - NO
 *  访问授权限制 - NO
 * @param {String}  uid 创建者ID
 * @param {String}  firstLetter 首字母
 * @param {Number}  start 起始位置
 * @param {Number}  count 返回数量
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 查得的话题对象数组
 */
exports.getTopicList = function(req_, res_){
  var uid = util.checkString(req_.query.uid);
  var firstLetter = util.checkString(req_.query.firstLetter);
  var start = util.checkString(req_.query.start);
  var count = util.checkString(req_.query.count);

  ctrl_topic.getTopicList(uid, firstLetter, start, count, function(err, result){
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

/**
 * createTopic:
 *  创建话题
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /topic/create.json
 *  支持格式 - json
 *  HTTP请求方式 - POST
 *  是否需要登录 - YES
 *  访问授权限制 - NO
 * @param {String}  title (required) 话题标题
 * @param {String}  abstract 摘要
 * @param {String}  content 内容
 * @param {String}  keyword 关键词
 * @param {String}  category 类别
 * @param {String}  status 状态
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 新创建的话题对象
 */
exports.createTopic = function(req_, res_){
  var title = util.checkString(req_.body.title);
  var abstract = util.checkString(req_.body.abstract);
  var content = util.checkString(req_.body.content);
  var keyword = util.checkString(req_.body.keyword);
  var category = util.checkString(req_.body.category);
  var status = util.checkString(req_.body.status);
  var creator = req_.session.user ? req_.session.user._id : "";

  ctrl_topic.createTopic(title, abstract, content, keyword, category, status, creator, function(err, result){
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

/**
 * deleteTopic:
 *  删除话题
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /topic/delete.json
 *  支持格式 - json
 *  HTTP请求方式 - DELETE
 *  是否需要登录 - YES
 *  访问授权限制 - NO
 * @param {String}  tid (required) 话题ID
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 删除的话题对象
 */
exports.deleteTopic = function(req_, res_){
  var tid = util.checkString(req_.body.tid);

  ctrl_topic.deleteTopic(tid, function(err, result){
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

/**
 * updateTopic:
 *  更新话题
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /topic/update.json
 *  支持格式 - json
 *  HTTP请求方式 - PUT
 *  是否需要登录 - YES
 *  访问授权限制 - NO
 * @param {String}  tobj (required) 更新的话题对象
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 更新的话题对象
 */
exports.updateTopic = function(req_, res_){
  var tobj = util.checkObject(req_.body);
  tobj.editby = req_.session.user ? req_.session.user._id : "";
  tobj.editat = Date.now();

  ctrl_topic.updateTopic(tobj, function(err, result){
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

/**
 * addMember:
 *  加入成员
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /topic/addMember.json
 *  支持格式 - json
 *  HTTP请求方式 - POST
 *  是否需要登录 - YES
 *  访问授权限制 - NO
 * @param {String}  tid (required) 话题ID
 * @param {String}  uids 成员ID
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 加入成员后的话题对象
 */
exports.addMember = function(req_, res_){
  var tid = util.checkString(req_.body.tid);
  var uids = util.checkString(req_.body.uids);
  var userid = req_.session.user ? req_.session.user._id : "";

  ctrl_topic.addMember(tid, uids, userid, function(err, result){
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

/**
 * removeMember:
 *  删除成员
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /topic/removeMember.json
 *  支持格式 - json
 *  HTTP请求方式 - POST
 *  是否需要登录 - YES
 *  访问授权限制 - NO
 * @param {String}  tid (required) 话题ID
 * @param {String}  uids 成员ID
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 删除成员后的话题对象
 */
exports.removeMember = function(req_, res_){
  var tid = util.checkString(req_.body.tid);
  var uids = util.checkString(req_.body.uids);
  var userid = req_.session.user ? req_.session.user._id : "";

  ctrl_topic.removeMember(tid, uids, userid, function(err, result){
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