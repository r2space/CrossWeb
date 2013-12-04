/**
 * API Group
 * Copyright (c) 2012 Author Name dd_dai
 */

var group    = require("../controllers/ctrl_group")
  , file     = smart.ctrl.file
  , response = smart.framework.response
  , util     = smart.framework.util;
  
/**
 * createGroup:
 *  创建组织
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /group/create.json
 *  支持格式 - json
 *  HTTP请求方式 - POST
 *  是否需要登录 - YES
 *  访问授权限制 - NO
 * @param {String}  name (required) 组织名称
 * @param {String}  member 组织成员
 * @param {String}  description 描述
 * @param {String}  category 类别
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 新创建的组织对象
 */
exports.createGroup = function (req_, res_) {

  var creator = req_.session.user ? req_.session.user._id : "";

  var g = {
      "name": util.checkString(req_.body.name)
    , "member": util.checkObject(req_.body.member)
    , "description": req_.body.description
    , "category": req_.body.category
    , "secure": req_.body.secure
    };

  group.createGroup(g, creator, function(err, result){
    if (err) {
      return response.send(res_, err);
    } else {
      return res_.send(json.dataSchema({items: result}));
    }
  });
};

/**
 * deleteGroup:
 *  删除组织
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /group/delete.json
 *  支持格式 - json
 *  HTTP请求方式 - DELETE
 *  是否需要登录 - YES
 *  访问授权限制 - NO
 * @param {String}  _id (required) 组织ID
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 删除的组织对象
 */
exports.deleteGroup = function (req_, res_) {
  var gid = util.checkString(req_.query._id);

  group.deleteGroup(gid, function(err, result){
    if(err){
      return response.send(res_, err);
    }else{
      return res_.send(result);
    }
  });
};

/**
 * getGroupList:
 *  得到组织列表
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /group/list.json
 *  支持格式 - json
 *  HTTP请求方式 - GET
 *  是否需要登录 - NO
 *  访问授权限制 - NO
 * @param {String}  gids 组织ID集合
 * @param {String}  uid 创建者ID
 * @param {String}  firstLetter 首字母
 * @param {Number}  start 起始位置
 * @param {Number}  count 返回数量
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 获取的组织对象列表
 */
exports.getGroupList = function(req_, res_) {

  var condition = {
      "uid": req_.query.uid || req_.session.user._id
    , "login": req_.session.user._id
    , "firstLetter": util.checkString(req_.query.firstLetter)
    , "start": util.checkString(req_.query.start)
    , "limit": util.checkString(req_.query.limit)
    , "type": util.checkString(req_.query.type)
    , "joined":util.checkString(req_.query.joined)
    , "keywords":util.checkString(req_.query.keywords)
    };

  group.getGroupList(condition, function(err, result){
    if(err){
      return response.send(res_, err);
    }else{
      return res_.send(json.dataSchema({items: result}));
    }
  });
};

/**
 * updateGroup:
 *  更新组织
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /group/update.json
 *  支持格式 - json
 *  HTTP请求方式 - PUT
 *  是否需要登录 - YES
 *  访问授权限制 - NO
 * @param {String}  gobj (required) 更新的组织对象
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 更新的组织对象
 */
exports.updateGroup = function(req_, res_) {
  var gobj = util.checkObject(req_.body);
  gobj.editby = req_.session.user ? req_.session.user._id : "";
  gobj.editat = Date.now();

  group.updateGroup(gobj, function(err, result){
    if(err){
      return response.send(res_, err);
    }else{
      return res_.send(result);
    }
  });
};

/**
 * API - /group/update/photo.json
 */
exports.updateGroupPhoto = function(req_, res_) {

  var uid = req_.session.user._id;
    // , gid = req_.body.gid;

  // Get file list from the request
  var filearray;
  if (req_.files.files instanceof Array) {
    filearray = req_.files.files;
  } else {
    filearray = [];
    filearray.push(req_.files.files);
  }

  // 保存文件到数据库
  dbfile.gridfsSave(uid, filearray, function(err, fileinfos){
    if(err){
      return response.send(res_, err);
    }else{
      return res_.send(json.dataSchema({items: fileinfos}));
    }
  });
};

exports.setPhoto = function(req, res){
  group.setPhoto(req, res);
};

/**
 * getGroup:
 *  得到组织
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /group/get.json
 *  支持格式 - json
 *  HTTP请求方式 - GET
 *  是否需要登录 - NO
 *  访问授权限制 - NO
 * @param {String}  gid (required) 组织ID
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 获取的组织对象
 */
exports.getGroup = function(req_, res_) {
  var gid = util.checkString(req_.query._id);

  group.getGroup(gid, function(err, result){
    if(err){
      return response.send(res_, err);
    }else{
      return res_.send(json.dataSchema(result));
    }
  });
};

/**
 * addMember:
 *  加入成员
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /group/join.json
 *  支持格式 - json
 *  HTTP请求方式 - POST
 *  是否需要登录 - YES
 *  访问授权限制 - NO
 * @param {String}  gid (required) 组织ID
 * @param {String}  uid 成员ID
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 加入成员后的组织对象
 */
exports.addMember = function(req_, res_) {
  var gid = util.checkString(req_.body.gid);
  var uid = util.checkString(req_.body.uid);
  var userid = req_.session.user ? req_.session.user._id : "";

  group.addMember(gid, uid, userid, function(err, result){
    if (err) {
      return response.send(res_, err);
    } else {
      return res_.send(json.dataSchema({items: result}));
    }
  });
};

/**
 * removeMember:
 *  删除成员
 * Update On:
 *  2012/10/31 12:00
 * Resource Information:
 *  API - /group/leave.json
 *  支持格式 - json
 *  HTTP请求方式 - POST
 *  是否需要登录 - YES
 *  访问授权限制 - NO
 * @param {String}  gid (required) 组织ID
 * @param {String}  uids 成员ID
 * @return {code} 错误状态码
 * @return {msg} 错误信息
 * @return {result} 删除成员后的组织对象
 */
exports.removeMember = function(req_, res_) {
  var gid = util.checkString(req_.body.gid);
  var uid = util.checkString(req_.body.uid);
  var userid = req_.session.user ? req_.session.user._id : "";

  group.removeMember(gid, uid, userid, function(err, result){
    if (err) {
      return response.send(res_, err);
    } else {
      return res_.send(json.dataSchema({items: result}));
    }
  });
};

/**
 * 获取组成员一览
 */
exports.getMember = function(req_, res_) {
  var gid = util.checkString(req_.query.gid)
    , start = util.checkString(req_.query.start)
    , limit = util.checkString(req_.query.limit)
    , firstLetter = util.checkString(req_.query.firstLetter);

  group.getMember(gid, firstLetter, start, limit, function(err, result){
    if (err) {
      return response.send(res_, err);
    } else {
      return res_.send(json.dataSchema({items: result}));
    }
  });
};
