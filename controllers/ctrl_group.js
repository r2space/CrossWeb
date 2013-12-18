/**
 * @file 存取组信息的controller
 * @author lizheng
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var ctrlGroup     = smart.ctrl.group
  , ctrlUser      = smart.ctrl.user
  , constant      = smart.framework.constant
  , context       = smart.framework.context
  , async         = smart.util.async
  , _             = smart.util.underscore
  , ctrlNotification    = require("./ctrl_notification");

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

  var extend = {
      letter_zh: params.name.letter_zh ? params.name.letter_zh.toUpperCase() : ""
    , category : params.category
    , photo : params.photo
    };
  handler.addParams("extend", extend);
  handler.addParams("name", params.name.name_zh);
  handler.addParams("owners", [handler.uid.toString()]);
  handler.addParams("description", params.description);
  handler.addParams("type", params.type === "1" ? constant.GROUP_TYPE_GROUP : constant.GROUP_TYPE_DEPARTMENT);
  handler.addParams("visibility",
    (params.secure === "1" || params.secure === 1) ? constant.GROUP_VISIBILITY_PRIVATE : constant.GROUP_VISIBILITY_PUBLIC);

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
      newResult.secure = result.visibility === constant.GROUP_VISIBILITY_PRIVATE ? "1" : "2";
      newResult.member = [];
      newResult.owner = result.owners;
      newResult.photo = result.extend.photo;
      newResult.email = {
        email1: result.email
      };
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
      newResult.email = {
        email1: result.email
      };
      newResult.photo = result.extend.photo;
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

/**
 * 创建组
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回新创建的组
 */
exports.createGroup = function(handler, callback) {

  handler.addParams("type", "1"); // 旧模型中，1:组（自由创建），2:部门（公司组织结构）

  if(handler.params.photo) {
    handler.addParams("photo", {
      "big" : handler.params.photo.fid,
      "small" : handler.params.photo.fid,
      "middle" : handler.params.photo.fid
    });
  }

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

    var condition1 = [];
    // 取用户加入的组
    condition1.push({
      "_id": {$in: groups}
    });
    if(type) {
      condition1.push({
        "type": type === "1" ? constant.GROUP_TYPE_GROUP : constant.GROUP_TYPE_DEPARTMENT
      });
    }
    if(firstLetter) {
      condition1.push({
        "extend.letter_zh": firstLetter.toUpperCase()
      });
    }
    if(keyword) {
      condition1.push({
        "name": { $regex : keyword, $options: "i" }
      });
    }
    handler.addParams("condition", condition1.length > 0 ? {$and: condition1} : {});

    // 取公开的组
    if(!joined) {
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
      if(condition1.length > 0) {
        handler.addParams("condition", {$or: [{$and: condition1}, {$and: condition2}]});
      } else {
        handler.addParams("condition", {$and: condition2});
      }
    }

    var finalCondition = handler.params.condition;
    if(_.isEmpty(finalCondition)) {
      finalCondition = {"valid": 1};
    } else {
      finalCondition = {$and: [finalCondition, {"valid": 1}]};
    }

    handler.addParams("condition", finalCondition);


    handler.addParams("skip", params.start || params.skip);
    handler.addParams("limit", params.limit || params.count);
    handler.addParams("order", "type name");

    ctrlGroup.getList(handler, function(err, resultGroups) {
      if(resultGroups) {
        resultGroups = transResult(resultGroups);
        // 设置成员
        async.eachSeries(resultGroups.items, function(group, done) {

          handler.addParams("gid", group._id.toString());
          handler.addParams("start", 0);
          handler.addParams("limit", Number.MAX_VALUE);
          handler.removeParams("keywords");
          handler.removeParams("firstLetter");

          exports.getMember(handler, function(err, resultUsers) {
            if(resultUsers) {
              group.member = [];
              _.each(resultUsers.items, function(user) {
                group.member.push(user._id.toString());
              });
            }

            done(err);
          });

        }, function(err) {
          return callback(err, resultGroups);
        });
      } else {
        callback(err);
      }
    });
  });
};

/**
 * 更新组
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回组列表
 */
exports.updateGroup = function(handler, callback) {

  handler.addParams("gid", handler.params._id.toString());

  if(handler.params.photo) {
    if(handler.params.photo.fid) {
      handler.addParams("photo", {
        "big" : handler.params.photo.fid,
        "small" : handler.params.photo.fid,
        "middle" : handler.params.photo.fid
      });
    }
    handler = transParam(handler);

    // 添加组
    ctrlGroup.update(handler, function(err, result) {
      if(err) {
        return callback(err);
      }

      return callback(err, transResult(result));
    });
  } else {
    ctrlGroup.get(handler, function(err, result) {
      if(err) {
        return callback(err);
      }

      handler.addParams("photo", result.extend.photo);

      handler = transParam(handler);
      // 添加组
      ctrlGroup.update(handler, function(err, result) {
        if(err) {
          return callback(err);
        }

        return callback(err, transResult(result));
      });

      return callback(err, transResult(result));
    });
  }
};

/**
 * 查询组织
 */
exports.getGroup = function(handler, callback) {

  handler.addParams("gid", handler.params._id || handler.params.gid);

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
      _.each(users.items, function(el) {
        resultGroup.member.push(el._id.toString());
      });

      // 取owner
      if(resultGroup.owner && resultGroup.owner[0]) {
        handler.addParams("uid", resultGroup.owner[0]);
        ctrlUser.get(handler, function(err, result) {
          if(err) {
            return callback(err);
          }

          if(result) {
            resultGroup.mainOwner = transUserResult(result);
          }

          return callback(err, resultGroup);
        });
      } else {
        return callback(err, resultGroup);
      }
    });
  });
};

/**
 * 添加成员
 */
exports.addMember = function(handler, callback) {

  if(!handler.params.uid) {
    handler.addParams("uid", handler.uid.toString());
  }

  ctrlGroup.addUser(handler, function(err, result) {

    if(err) {
      return callback(err);
    }

    exports.getGroup(handler, function(err, result) {

      if(!err) {
        if(handler.params.uid !== handler.uid.toString()){
          //发通知
          var invite = {
              uid       : handler.params.uid
            , userid    : handler.uid.toString()
            , type      : "invite"
            , msg       : "被加入"
            , groupName : result.name.name_zh
            , groupId   : result._id
            };
          ctrlNotification.createForInvite(invite);
        }
      }

      return callback(err, result);
    });

  });

};

/**
 * 删除成员
 */
exports.removeMember = function(handler, callback) {


  if(!handler.params.uid) {
    handler.addParams("uid", handler.uid.toString());
  }

  ctrlGroup.removeUser(handler, function(err, result) {

    if(err) {
      return callback(err);
    }

    exports.getGroup(handler, function(err, result) {

      if(!err) {
        if(handler.params.uid !== handler.uid.toString()){
          //发通知
          var invite = {
              uid       : handler.params.uid
            , userid    : handler.uid.toString()
            , type      : "remove"
            , msg       : "被加入"
            , groupName : result.name.name_zh
            , groupId   : result._id
            };
          ctrlNotification.createForInvite(invite);
        }
      }

      return callback(err, result);
    });

  });
};

/**
 * 获取组成员一览
 */
exports.getMember = function(handler, callback) {

  var params = handler.params;

  var srcLimit = params.limit;
  var srcStart = params.start;
  handler.addParams("recursive", false);
  handler.addParams("skip", 0);
  handler.addParams("limit", Number.MAX_VALUE);

  ctrlGroup.getUsersInGroup(handler, function(err, resultUsers) {

    if(err) {
      return callback(err);
    }

    var condition = [];

    condition.push({
      "_id": {$in: resultUsers.items}
    });

    if(params.firstLetter) {
      condition.push({
        "extend.letter_zh": params.firstLetter.toUpperCase()
      });
    }

    if(params.keywords) {
      condition.push({$or: [
        {"extend.name_zh": {$regex: params.keywords, $options: "i"}},
        {"email": {$regex: params.keywords, $options: "i"}}
      ]});
    }

    handler.addParams("condition", {$and: condition});
    handler.addParams("order", "extend.name_zh");
    handler.addParams("skip", srcStart);
    handler.addParams("limit", srcLimit);

    ctrlUser.getList(handler, function(err, result) {

      if(err) {
        return callback(err);
      }

      return callback(err, transUserResult(result));
    });
  });

};

/**
 * 检查当前用户能否查看某个组
 */
exports.canSee = function(handler, callback) {

  var gid = handler.params.id;
  handler.addParams("gid", gid);

  ctrlGroup.get(handler, function(err, result) {

    if(err) {
      return callback(err);
    }

    if(result.visibility == constant.GROUP_VISIBILITY_PUBLIC) { // 公开组
      return callback(err, true);
    }

    handler.addParams("uid", handler.uid.toString());
    ctrlUser.get(handler, function(err, result) {
      if(err) {
        return callback(err);
      }

      var groups = result.groups || [];
      return callback(err, _.contains(groups, gid));
    });
  });
};

/**
 * 检查当前用户能否编辑某个组
 */
exports.canEdit = function(handler, callback) {

  var gid = handler.params.id;
  handler.addParams("gid", gid);

  ctrlGroup.get(handler, function(err, result) {

    if(err) {
      return callback(err);
    }

    return callback(err, _.contains(result.owners || [], handler.uid.toString()));
  });
};


/**
 * 获取所有组成员的ID 递归
 */
exports.getUsersInGroup = function(gid, callback){
  var handler = new context().bind({ session: { user: { _id: constant.DEFAULT_USER } } }, {});
  handler.addParams("gid", gid);
  handler.addParams("recursive", true);
  ctrlGroup.getUsersInGroup( handler, function(err, result){
    if (err) {
      return callback(err);
    }

    return callback(err, result.items);
  });
};


// TODO 下列函数被ctrl_message调用，无法获得req和res，因此无法使用Handler

exports.getAllGroupByUid = function(uid, callback) {
  var handler = new context().bind({ session: { user: { _id: constant.DEFAULT_USER } } }, {});
  handler.addParams("uid", uid);
  handler.addParams("joined", true);
  exports.getGroupList(handler, function(err, result) {
    if(err) {
      return callback(err);
    }

    return callback(err, result.items);
  });
};

exports.at = function(gid, callback) {
  var handler = new context().bind({ session: { user: { _id: constant.DEFAULT_USER } } }, {});
  handler.addParams("gid", gid);
  handler.addParams("valid", 1);
  ctrlGroup.get(handler, function(err, result) {

    if (err) {
      return callback(err);
    }
    var groupData = transResult(result);
    return callback(err, groupData);
  });

};

exports.find = function(gids, callback){

  var handler = new context().bind({ session: { user: { _id: constant.DEFAULT_USER } } }, {});

  var groups = [];
  async.forEach(gids, function(gid, cb){

    handler.addParams("gid", gid);
    ctrlGroup.get(handler, function(err, result) {

      if (err) {
        return callback(err);
      }
      var groupData = transResult(result);
      groups.push(groupData);
      return cb(err);
    });
  }, function(err){
    callback(err, groups);
  });
};