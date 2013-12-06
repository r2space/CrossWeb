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
  , _             = smart.util.underscore;

/**
 * 创建组织
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
    }

  });
};

/**
 * 得到组织列表
 */
exports.getGroupList = function(handler, callback) {

  var params = handler.params;

  var otherUid = params.uid; // 指定用户
  var firstLetter = params.firstLetter;
  var start = params.start;
  var limit = params.limit;
  var type = params.type;
  var joined = params.joined;
  var keywords = params.keywords;

  if(joined && otherUid) { // 查找指定用户加入的公开组
    // TODO
  } else { // 查找所有公开组和自己加入的私有组
    // TODO
  }

};

/**
 * 更新组织
 */
exports.updateGroup = function(handler, callback) {

  var code = handler.code;
  var uid = handler.uid;
  var params = handler.params;


};

/**
 * 查询组织
 */
exports.getGroup = function(handler, callback) {

  var code = handler.code;
  var uid = handler.uid;
  var params = handler.params;


};

/**
 * 添加成员
 */
exports.addMember = function(handler, callback) {

  var code = handler.code;
  var uid = handler.uid;
  var params = handler.params;


};

/**
 * 删除成员
 */
exports.removeMember = function(handler, callback) {

  var code = handler.code;
  var uid = handler.uid;
  var params = handler.params;


};

/**
 * 获取组成员一览
 */
exports.getMember = function(handler, callback) {

  var code = handler.code;
  var uid = handler.uid;
  var params = handler.params;


};

/**
 * 获取所有组成员的ID 递归
 */
exports.getUsersInGroup = function(gid, callback){
  group.getUsersInGroup( {gid: gid, recursive: true}, function(err, result){
    if (err) {
      return callback(err);
    }
    return callback(err, result.items);
  });
};

// 一时对应
exports.getAllGroupByUid = function(uid, callback) {
  var handler = new context().bind({ session: { user: { _id: constant.DEFAULT_USER } } }, {});
  handler.addParams("uid", uid);
  // TODO
  handler.addParams("gid", "52a136b72fdd17500d000002");
  ctrlGroup.get(handler, function(err, result){
    callback(err, [result]);
  });
};

exports.at = function(gid, callback) {
  var handler = new context().bind({ session: { user: { _id: constant.DEFAULT_USER } } }, {});
  handler.addParams("gid", gid);
  handler.addParams("valid", 1);
  group.get(handler, function(err, result) {

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
  async.forEach(gids, function(uid, cb){

    handler.addParams("gid", gid);
    group.get(handler, function(err, result) {

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

  handler.addParams("name", params.name.name_zh);
  handler.addParams("extend", {
      letter_zh: params.name.letter_zh
    , category : params.category
  });
  handler.addParams("description", params.description);
  handler.addParams("type", params.type === "1" ? constant.GROUP_TYPE_GROUP : constant.GROUP_TYPE_DEPARTMENT);
  handler.addParams("public", params.secure === "1" ? constant.GROUP_PRIVATE : constant.GROUP_PUBLIC);
}

/**
 * 结果转换，SmartCore -> Cross
 */
function transResult(result) {
  if(!result) {
    return result;
  }

  var newResult = {};
  newResult.name = {
      name_zh: result.name
    , letter_zh: result.extend.letter_zh
  };
  newResult.description = result.description;
  newResult.category    = result.extend.category;
  newResult.type = result.type === constant.GROUP_TYPE_GROUP ? "1" : "2";
  newResult.public = result.public === constant.GROUP_PRIVATE ? "1" : "2";
  newResult.createby = result.createBy;
  newResult.createat = result.createAt;
  newResult.editby = result.updateBy;
  newResult.editat = result.updateAt;

  return result;
}