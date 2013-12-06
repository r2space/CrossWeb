/**
 * @file 存取组信息的controller
 * @author lizheng
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var ctrlGroup     = smart.ctrl.group
  , ctrlUser      = smart.ctrl.user
  , constant      = smart.framework.constant
  , async         = smart.util.async
  , _             = smart.util.underscore;

/**
 * 参数转换，Cross -> SmartCore
 *
 * 字段映射关系 :
 *
 * Cross               SmartCore
 * -------------------------------------
 * name.name_zh    ->  Group.name
 * name.letter_zh  ->  Group.extend.letter_zh
 * description     ->  Group.description
 * type            ->  Group.type
 * secure          ->  Group.public
 * member          ->  User.groups
 */
function transParam(handler) {
  var params = handler.params;

  handler.addParams("extend", {
      letter_zh: params.name.letter_zh.toUpperCase()
    , category : params.category
    });
  handler.addParams("name", params.name.name_zh);
  handler.addParams("description", params.description);
  handler.addParams("type", params.type === "1" ? constant.GROUP_TYPE_GROUP : constant.GROUP_TYPE_DEPARTMENT);
  handler.addParams("visibility",
    params.secure === "1" ? constant.GROUP_VISIBILITY_PRIVATE : constant.GROUP_VISIBILITY_PUBLIC);

  return handler;
}

/**
 * 结果转换，SmartCore -> Cross
 */
function transResult(result) {

  var newResult;

  if(result) {
    if(_.isArray(result)) {
      newResult = [];
      _.each(result, function(el) {
        newResult.push(transResult(el));
      });
    } else if(result.items) {
      newResult = [];
      _.each(result.items, function(el) {
        newResult.push(transResult(el));
      });
      result.items = newResult;
      newResult = result;
    } else {
      newResult = {};
      newResult._id = result._id.toString();
      newResult.name = {
        name_zh: result.name
        , letter_zh: result.extend.letter_zh
      };
      newResult.description = result.description;
      newResult.category    = result.extend.category;
      newResult.type = result.type === constant.GROUP_TYPE_GROUP ? "1" : "2";
      newResult.visibility = result.visibility === constant.GROUP_VISIBILITY_PRIVATE ? "1" : "2";
      newResult.createby = result.createBy;
      newResult.createat = result.createAt;
      newResult.editby = result.updateBy;
      newResult.editat = result.updateAt;
    }
  } else {
    newResult = result;
  }

  return newResult;
}

/**
 * 创建组
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回新创建的组
 */
exports.createGroup = function(handler, callback) {

  handler = transParam(handler);

  // 添加组
  ctrlGroup.add(handler, function(err, result) {
    if(err) {
      return callback(err);
    }

    var users = handler.params.member;

    if(users) {
      users = users.split(",");
      users.add(handler.uid.toString());
    } else {
      users = [handler.uid.toString()];
    }

    // 添加组员
    async.eachSeries(users, function(uid, done) {

      handler.addParams("gid", result._id.toString());
      handler.addParams("uid", uid);

      ctrlGroup.addUser(handler, function(err) {
        done(err);
      });
    }, function(err) {
      result = transResult(result);
      result.member = users;
      return callback(err, result);
    });
  });
};

/**
 * 得到组列表
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回组列表
 */
exports.getGroupList = function(handler, callback) {

  var params = handler.params;
  var joined = params.joined;

  var targetUid = params.uid || handler.uid.toString();

  handler.addParams("uid", targetUid);

  ctrlUser.get(handler, function(err, result) {
    if(err) {
      return callback(err);
    }

    var groups = result.groups || [];

    var params = handler.params;
    var type = params.type;
    var firstLetter = params.firstLetter;
    var keyword = params.keywords;

    var condition = [];
    if(joined) { // 取用户加入的组
      condition.push({
        "_id": {$in: groups}
      });
      if(type) {
        condition.push({
          "type": type === "1" ? constant.GROUP_TYPE_GROUP : constant.GROUP_TYPE_DEPARTMENT
        });
      }
      if(firstLetter) {
        condition.push({
          "extend.letter_zh": firstLetter.toUpperCase()
        });
      }
      if(keyword) {
        condition.push({
          "name": { $regex : keyword, $options: "i" }
        });
      }
      handler.addParams("condition", {$and: condition});
    }

    if(!joined) { // 取公开的组
      var condition2 = [];
      condition2.push({
        "visibility": constant.GROUP_VISIBILITY_PUBLIC
      });
      if(type) {
        condition2.push({
          "type": type === "1" ? constant.GROUP_TYPE_GROUP : constant.GROUP_TYPE_DEPARTMENT
        });
      }
      if(firstLetter) {
        condition2.push({
          "extend.letter_zh": firstLetter.toUpperCase()
        });
      }
      if(keyword) {
        condition2.push({
          "name": { $regex : keyword, $options: "i" }
        });
      }
      handler.addParams("condition", {$or: [{$and: condition}, {$and: condition2}]});
    }

    handler.addParams("skip", params.start);
    handler.addParams("limit", params.limit);
    handler.addParams("order", "name");

    ctrlGroup.getList(handler, function(err, result) {
      if(result) {
        result = transResult(result);
      }

      callback(err, result);
    });
  });
};

/**
 * 更新组
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回组列表
 */
exports.updateGroup = function(handler, callback) {

  handler = transParam(handler);

  // TODO 添加图片更新的处理

  handler.addParams("gid", handler.params._id.toString());

  // 添加组
  ctrlGroup.update(handler, function(err, result) {
    if(err) {
      return callback(err);
    }

    return callback(err, transResult(result));
  });
};

/**
 * 查询组织
 */
exports.getGroup = function(handler, callback) {

  ctrlGroup.get(handler, function(err, resultGroup) {
    if(err) {
      return callback(err);
    }

    var resultGroup = transResult(resultGroup);

    var condition = {
        groups: resultGroup._id.toString()
      , valid: 1
      };

    handler.addParams("condition", condition);
    handler.addParams("limit", Number.MAX_VALUE);

    ctrlUser.getList(handler, function(err, users) {

      if(err) {
        return callback(err);
      }

      resultGroup.member = [];
      _.each(users, function(el) {
        resultGroup.member.push(el._id.toString());
      });

      return callback(err, resultGroup);
    });
  });
};

/**
 * 添加成员
 */
exports.addMember = function(handler, callback) {

  // TODO 没有发通知

  if(!handler.params.uid) {
    handler.addParams("uid", handler.uid.toString());
  }

  ctrlGroup.addUser(handler, function(err, result) {

    if(err) {
      return callback(err);
    }

    exports.getGroup(handler, function(err, result) {

      return callback(err, transResult(result));
    });

  });

};

/**
 * 删除成员
 */
exports.removeMember = function(handler, callback) {

  // TODO 没有发通知

  if(!handler.params.uid) {
    handler.addParams("uid", handler.uid.toString());
  }

  ctrlGroup.removeUser(handler, function(err, result) {

    if(err) {
      return callback(err);
    }

    exports.getGroup(handler, function(err, result) {

      return callback(err, transResult(result));
    });

  });
};

/**
 * 获取组成员一览
 */
exports.getMember = function(handler, callback) {

  var params = handler.params;

  handler.addParams("recursive", false);
  handler.addParams("skip", 0);
  handler.addParams("limit", Number.MAX_VALUE);

  ctrlGroup.getUsersInGroup(handler, function(err, resultUsers) {

    if(err) {
      return callback(err);
    }

    var condition = {};

    condition.push({
      "_id": {$in: resultUsers.items}
    });

    if(params.firstLetter) {
      condition.push({
        "extend.letter_zh": params.firstLetter.toUpperCase()
      });
    }

    handler.addParams("condition", condition);
    handler.addParams("order", "extend.name_zh");
    handler.addParams("skip", params.start);
    handler.addParams("limit", params.limit);

    ctrlUser.getList(handler, function(err, result) {

      if(err) {
        return callback(err);
      }

      return callback(err, transUserResult(result));
    });
  });

};

function transUserResult(result) {
  var newResult;

  if(result) {
    if(_.isArray(result)) {
      newResult = [];
      _.each(result, function(el) {
        newResult.push(transUserResult(el));
      });
    } else if(result.items) {
      newResult = [];
      _.each(result.items, function(el) {
        newResult.push(transUserResult(el));
      });
      result.items = newResult;
      newResult = result;
    } else {
      newResult = {};
      newResult._id = result._id.toString();
      newResult.name = {
        name_zh: result.extend.name_zh
        , letter_zh: result.extend.letter_zh
      };
      newResult.uid = result.userName;
      newResult.tel    = {
        mobile : result.extend.mobile
      };
      newResult.following = result.extend.following;
      newResult.createby = result.createBy;
      newResult.createat = result.createAt;
      newResult.editby = result.updateBy;
      newResult.editat = result.updateAt;
    }
  } else {
    newResult = result;
  }

  return newResult;
}
