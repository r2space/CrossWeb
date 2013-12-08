/**
 * @file 存储用户信息
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var ctrlUser    = require("../controllers/ctrl_user")
  , auth        = smart.framework.auth
  //, constant    = smart.framework.constant
  , context     = smart.framework.context
  , log         = smart.framework.log
  , response    = smart.framework.response
  , _           = smart.util.underscore;

var FAKE_PASSWORD = "0000000000000000";

/**
 * 简易登陆实现
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @returns {*} 无
 */
exports.simpleLogin = function(req, res){

  log.debug("user name: " + req.query.name);
  req.query.password = auth.sha256(req.query.password);

  // 認証処理
  auth.simpleLogin(req, res, function(err, result) {

    if (err) {
      log.error(err, undefined);
      log.audit("login failed.", req.query.name);
    } else {
      log.audit("login succeed.", result._id);
    }

    // add cross property
    var user =  req.session.user;
    req.session.user.uid = user.userName;
    req.session.user.email={
      email1 : user.email
    };
    req.session.user.name = {
      name_zh : user.extend.name_zh,
      letter_zh: user.extend.letter_zh
    };
    req.session.user.tel = {
      mobile : user.extend.mobile
    };
    req.session.user.following = user.extend.following;
    req.session.user.uid = user.userName;

    response.send(res, err, result);
  });
};

/**
 * 简易退出
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @returns {*} 无
 */
exports.simpleLogout = function(req, res){

  res.render("login", {"title": "login"});
};

/**
 * 查询用户
 * @param req 请求对象
 * @param res 响应对象
 * @returns {*} 无
 */
exports.getUser = function(req, res) {

  var handler = new context().bind(req, res);

  ctrlUser.get(handler, function(err, result) {

    return response.send(res, err, result);
  });

};

/**
 * 查询用户列表
 * @param req 请求对象
 * @param res 响应对象
 * @returns {*} 无
 */
exports.getUserList = function(req, res) {

  var handler = new context().bind(req, res);

  if (handler.params.kind != "all") {
    ctrlUser.getUserList(handler, function(err, userResult) {
      return response.send(res, err, {items: userResult});
    });
  } else {
    ctrlUser.getList(handler, function(err, userResult) {
        return response.send(res, err, {items: userResult});
    });
  }

};

/**
 * 关注用户
 * @param req 请求对象
 * @param res 响应对象
 * @returns {*} 无
 */
exports.follow = function(req, res){
  var handler = new context().bind(req, res);
  handler.addParams("uid", req.session.user._id);
  ctrlUser.follow(handler, function(err, result) {

    return response.send(res, err, result);
  });
}

/**
 * 取消关注用户
 * @param req 请求对象
 * @param res 响应对象
 * @returns {*} 无
 */
exports.unfollow = function(req, res){
  var handler = new context().bind(req, res);
  handler.addParams("uid", req.session.user._id);
  ctrlUser.unfollow(handler, function(err, result) {

    return response.send(res, err, result);
  });
}

/**
 * 添加用户
 * @param req 请求对象
 * @param res 响应对象
 * @returns {*} 无
 */
exports.add = function(req, res) {

  var handler = new context().bind(req, res);

  ctrlUser.add(handler, function(err, result) {

    if (err) {
      return response.send(res, err);
    }

    return response.send(res, err, {isSuccess: result ? true : false});
  });

};

/**
 * 更新用户
 * @param req 请求对象
 * @param res 响应对象
 * @returns {*} 无
 */
exports.update = function(req, res) {

  var handler = new context().bind(req, res);

  ctrlUser.update(handler, function(err, result) {

    if (err) {
      return response.send(res, err);
    }
    return response.send(res, err, {isSuccess: result ? true : false});

  });

};

/**
 * 删除用户
 * @param req 请求对象
 * @param res 响应对象
 * @returns {*} 无
 */
exports.remove = function(req, res) {

  var handler = new context().bind(req, res);
  handler.addParams("uid", handler.params._id);

  ctrlUser.remove(handler, function(err, result) {

    return response.send(res, err, {isSuccess: result ? true : false});
  });

};

/**
 * 修改密码（for Web）
 * @param req 请求对象
 * @param res 响应对象
 * @returns {*} 无
 */
exports.updatePassword = function(req, res) {

  var handler = new context().bind(req, res);

  var name = handler.params.id;
  var oldPassword = handler.params.oldPassword;
  var newPassword = handler.params.newPassword;

  handler.addParams("name", name);
  handler.addParams("password", auth.sha256(oldPassword));

  ctrlUser.isPasswordRight(handler, function(err, result) {

    if (err) {
      return response.send(res, err);
    }

    handler.addParams("password", auth.sha256(newPassword));

    ctrlUser.update(handler, function(err, result) {
      return response.send(res, err, {isSuccess: result ? true : false});
    });

  });
};









