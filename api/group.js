/**
 * API Group
 * Copyright (c) 2012 Author Name dd_dai
 */

"use strict";

var file     = smart.ctrl.file
  , context  = smart.framework.context
  , response = smart.framework.response
  , group    = require("../controllers/ctrl_group");

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
exports.createGroup = function (req, res) {

  var handler = new context().bind(req, res);

  group.createGroup(handler, function(err, result){
    if (err) {
      return response.send(res, err);
    } else {
      return response.send(res, err, {items: result});
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
exports.getGroupList = function(req, res) {

  var handler = new context().bind(req, res);

  group.getGroupList(handler, function(err, result){
    return response.send(res, err, result);
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
exports.updateGroup = function(req, res) {

  var handler = new context().bind(req, res);

  group.updateGroup(handler, function(err, result){
    return response.send(res, err, result);
  });
};

/**
 * TODO
 * API - /group/update/photo.json
 */
//exports.updateGroupPhoto = function(req_, res_) {
//
//  var uid = req_.session.user._id;
//    // , gid = req_.body.gid;
//
//  // Get file list from the request
//  var filearray;
//  if (req_.files.files instanceof Array) {
//    filearray = req_.files.files;
//  } else {
//    filearray = [];
//    filearray.push(req_.files.files);
//  }
//
//  // 保存文件到数据库
//  dbfile.gridfsSave(uid, filearray, function(err, fileinfos){
//    if(err){
//      return response.send(res_, err);
//    }else{
//      return res_.send(json.dataSchema({items: fileinfos}));
//    }
//  });
//};

// TODO
//exports.setPhoto = function(req, res){
//  group.setPhoto(req, res);
//};

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
exports.getGroup = function(req, res) {

  var handler = new context().bind(req, res);

  group.getGroup(handler, function(err, result){
    return response.send(res, err, result);
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
exports.addMember = function(req, res) {

  var handler = new context().bind(req, res);

  group.addMember(handler, function(err, result){
    return response.send(res, err, {items: result});
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
exports.removeMember = function(req, res) {

  var handler = new context().bind(req, res);

  group.removeMember(handler, function(err, result){
    return response.send(res, err, {items: result});
  });
};

/**
 * 获取组成员一览
 */
exports.getMember = function(req, res) {

  var handler = new context().bind(req, res);

  group.getMember(handler, function(err, result){
    return response.send(res, err, {items: result});
  });
};
