/**
 * @file 存储用户信息
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var ctrlUser    = smart.ctrl.user
  , ctrlAclink  = smart.ctrl.aclink
  , auth        = smart.framework.auth
  , constant    = smart.framework.constant
  , context     = smart.framework.context
  , log         = smart.framework.log
  , response    = smart.framework.response
  , _           = smart.util.underscore;

var FAKE_PASSWORD = "0000000000000000";

function hasPermission(permissions, pcode) {
  if(permissions) {
    for(var i = 0; i < permissions.length; i++) {
      if(permissions[i] === pcode) {
        return true;
      }
    }
  }

  return false;
}

exports.PERMISSION_ADMIN = "1";
exports.PERMISSION_CASH = "2";

/**
 * 简易登陆实现
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @returns {*} 无
 */
exports.simpleLogin = function(req, res){

  log.debug("user name: " + req.query.name);

  // パスワードのsha256文字列を取得する
  req.query.password = auth.sha256(req.query.password);

  // 認証処理
  auth.simpleLogin(req, res, function(err, result) {

    if (err) {
      log.error(err, undefined);
      log.audit("login failed.", req.query.name);
    } else {
      log.audit("login succeed.", result._id);
    }

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

  // TODO
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
  handler.addParams("uid", handler.params.userId);

  ctrlUser.get(handler, function(err, result) {

    if (err) {
      return response.send(res, err);
    }

    var userData;
    if(result) {

      result.extend = result.extend ? result.extend : {};

      userData = {
        _id       : result._id
        , uid        : result.userName
        , password  : FAKE_PASSWORD
        , name      : {
          name_zh : result.extend.name_zh,
          letter_zh : result.extend.letter_zh
        }
        , tel : {
          mobile : result.extend.mobile
        }
        , following : result.extend.following
        , createat  : result.createAt
        , createby  : result.createBy
        , editat    : result.updateAt
        , editby    : result.updateBy
      };

      return response.send(res, err, userData);
    } else {
      return response.send(res, err);
    }
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

  handler.addParams("userName", handler.params.keyword);
  handler.addParams("realName", handler.params.keyword);
  handler.addParams("and", false);

  ctrlUser.getListByKeywords(handler, function(err, userResult) {

    if (err) {
      return response.send(res, err);
    }

    var users = [];
    var uids = [];
    _.each(userResult.items, function(user) {

      user.extend = user.extend ? user.extend : {};

      users.push({
        _id       : user._id
        , uid        : user.userName
        , name      : {
          name_zh : user.extend.name_zh,
          letter_zh : user.extend.letter_zh
        }
        , tel : {
          mobile : user.extend.mobile
        }
        , following : user.extend.following
        , createat  : user.createAt
        , createby  : user.createBy
        , editat    : user.updateAt
        , editby    : user.updateBy
      });

      uids.push(user._id.toString());
    });

    if(uids.length > 0) {
      return response.send(res, err, { totalItems: userResult.totalItems, items: users });
    } else {
      return response.send(res, err, { totalItems: 0, items: [] });
    }

  });

};

/**
 * 关注用户
 * @param req 请求对象
 * @param res 响应对象
 * @returns {*} 无
 */
exports.follow = function(req_, res_){

  var currentuid = req_.session.user._id;
  user.follow(currentuid, req_.body.uid, function(err, result){
    json.send(res_, err, {"items": result});
  });
};

/**
 * 添加用户
 * @param req 请求对象
 * @param res 响应对象
 * @returns {*} 无
 */
exports.add = function(req, res) {

  var handler = new context().bind(req, res);

  var params = handler.params;

  handler.addParams("userName", params.id);
  handler.addParams("password", auth.sha256(params.password));
  handler.addParams("first", params.name);
  handler.addParams("email", "xxx@xxx.com");
  handler.addParams("lang", "ja");
  handler.addParams("timezone", "GMT+09:00");
  handler.addParams("extend", {
    name_zh  : params.name        // name.name_zh
    , letter_zh : params.letter  // name.letter_zh
    , following : params.following
    , mobile     : params.mobile  // tel.mobile
  });

  ctrlUser.add(handler, function(err, result) {

    if (err) {
      return response.send(res, err);
    }

    return response.send(res, err, {isSuccess: result ? true : false});
  });

};

// --------------------下記対応しない---------------------------- //

/**
 * 更新用户
 * @param req 请求对象
 * @param res 响应对象
 * @returns {*} 无
 */
exports.update = function(req, res) {

  var handler = new context().bind(req, res);

  var params = handler.params;

  handler.addParams("uid", params.userId);
  if (params.password !== FAKE_PASSWORD) {
    handler.addParams("password", auth.sha256(params.password));
  } else {
    handler.removeParams("password");
  }
  handler.addParams("first", params.name);
  handler.addParams("extend", {
    name_zh  : params.name        // name.name_zh
    , letter_zh : params.letter  // name.letter_zh
    , following : params.following
    , mobile     : params.mobile  // tel.mobile
  });

  ctrlUser.update(handler, function(err, result) {

    if (err) {
      return response.send(res, err);
    }

    // 更新权限
    /*handler.addParams("type", constant.ACLINK_TYPE_USER_PERMISSION);
     handler.addParams("main", result._id.toString());
     var subs = [];
     if(params.admin === true) {
     subs.push(exports.PERMISSION_ADMIN);
     }
     if(params.cash === true) {
     subs.push(exports.PERMISSION_CASH);
     }
     handler.addParams("subs", subs);*/

    ctrlAclink.update(handler, function(err, result) {
      return response.send(res, err, {isSuccess: result ? true : false});
    });
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
  handler.addParams("uid", handler.params.userId);

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










