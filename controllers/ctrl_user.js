var notification = require("../controllers/ctrl_notification")
  , user  = smart.ctrl.user
  , async = smart.util.async
  , _      = smart.util.underscore
  , context   = smart.framework.context
  , auth = smart.framework.auth
  , constant  = smart.framework.constant
  , sanitize = smart.util.validator.sanitize;

var FAKE_PASSWORD = "0000000000000000";

exports.get = function(handler, callback) {
  if (!handler || !handler.params) {
    handler = new context().bind({ session: { user: { _id: constant.DEFAULT_USER } } }, {});
  }
  handler.addParams("valid", 1);
  handler.addParams("uid", handler.params._id);

  user.get(handler, function(err, result) {

    if (err) {
      return callback(err);
    }
    var userData = trans_user_api(result);
    return callback(err, userData);
  });

};

exports.at = function(uid, callback) {
  var handler = new context().bind({ session: { user: { _id: constant.DEFAULT_USER } } }, {});
  handler.addParams("uid", uid);
  handler.addParams("valid", 1);
  user.get(handler, function(err, result) {

    if (err) {
      return callback(err);
    }
    var userData = trans_user_api(result);
    return callback(err, userData);
  });

};

exports.getUser = function(uid, callback_){
  var handler = new context().bind({ session: { user: { _id: constant.DEFAULT_USER } } }, {});
  handler.addParams("uid", uid);
  handler.addParams("valid", 1);

  user.get(handler, function(err, result) {

    if (err) {
      return callback_(new error.InternalServer(err));
    }
    if (!result) {
      return callback_(new error.NotFound(__("user.error.notFound")));
    }
    var userData = trans_user_api(result);

    var condition = { "extend.following" : uid };
    handler.addParams("condition", condition);
    user.getList(handler, function(err, followers){
    //user.followerIds(uid_, function(err, followerIds){
      //var json = userData.toJSON();
      var fs = [];
      _.each(followers.items, function(user) {
        fs.push(user._id);
      });
      userData.follower = fs;
      return callback_(err, userData);
    });
  });
};

exports.getList = function(handler, callback) {

  var keywords = handler.params.keywords;
  var condition = { valid: 1 };
  if (_.isEmpty(keywords) === false) {
    condition.first = new RegExp("^" + keywords.toLowerCase() + ".*$", "i");
  }

  handler.addParams("condition", condition);
  user.getList(handler, function(err, userResult) {

    if (err) {
      return callback(err);
    }

    var users = [];
    _.each(userResult.items, function(user) {
      var u = trans_user_api(user);
      users.push(u);
    });

    return callback(err, { totalItems: userResult.totalItems, items: users });
  });

};

exports.getUserList = function(params, callback){

  // {"kind":"following", "firstLetter":"", "uid":uid_, "start":0, "limit":20}
  // {"kind":"all", "firstLetter":firstLetter_, "uid":uid_, "start":start_, "limit":limit_}

  var kind_ = params.kind || "all";
  var firstLetter_ = params.firstLetter;
  var uid_ = params.uid;
  var keywords_ = params.keywords;
  var gid = params.gid;
  var condition = {};
  // 首字母过滤
  if (keywords_) {
    condition.$or = [
      {"name.name_zh": new RegExp("^" + keywords_.toLowerCase() + ".*$", "i")}
      , {"name.letter_zh": new RegExp("^" + keywords_.toLowerCase() + ".*$", "i")}
      , {"email.email1": new RegExp("^" + keywords_.toLowerCase() + ".*$", "i")}
      , {"email.email2": new RegExp("^" + keywords_.toLowerCase() + ".*$", "i")}
    ];
  }
  if (firstLetter_) {
    firstLetter_ = sanitize(firstLetter_).xss();
    condition.$or = [
      {"extend.name_zh": new RegExp("^" + firstLetter_.toLowerCase() + ".*$", "i")}
      , {"extend.letter_zh": new RegExp("^" + firstLetter_.toLowerCase() + ".*$", "i")}
    ];
  }

  var  handler = new context().bind({ session: { user: { _id: constant.DEFAULT_USER } } }, {});

  // 获取所有用户
  if (kind_ == "all") {
    handler.addParams("condition", condition);
    user.at(uid_, function(err, follower) {
      if (err) {
        return callback_(new error.InternalServer(err));
      }

      user.getList(handler, function(err, result){
        var uList = [];
        _.each(result.items, function(item){
          var u = trans_user_api(item);
          if (follower) {
            u.followed = _.some(follower.following, function(u){return u == item._id;});
          }
          uList.push(u);
        });
        return callback(err, uList);
      });
    });
  }

  // 获取关注我的人
  if (kind_ == "follower") {
    condition["extend.following"] = uid_;
    handler.addParams("condition", condition);
    user.getList(handler, function(err, result){
      var uList = [];
      _.each(result.items, function(item){
        var u = trans_user_api(item);
        uList.push(u);
      });
      return callback(err, uList);
    });
  }

  // 获取我关注的人
  if (kind_ == "following") {
    handler.addParams("uid", uid);
    user.get(handler, function(err, result) {

      if (err) {
        return callback(err);
      }
      exports.listByUids(result.extend.following, function(e, users){
         callback(e, users);
      });
    });
  }

  if(kind_ == "group") {
    group.at(gid, function(err, result){
      if (err) {
        return callback_(new error.InternalServer(err));
      }

      handler.addParams("condition", condition);
      user.getList(handler, function(err, result){
        var uList = [];
        _.each(result.items, function(item){
          var u = trans_user_api(item);
          if ($.inArray(result.member, u._id)) {
            uList.push(u);
          }
        });
        return callback(err, uList);
      });
    });
  }

};

exports.listByUids = function(uids, callback){

  var handler = new context().bind({ session: { user: { _id: constant.DEFAULT_USER } } }, {});

  var users = [];
  async.forEach(uids, function(uid, cb){

    handler.addParams("uid", uid);
    user.get(handler, function(err, result) {

      if (err) {
        return callback(err);
      }
      var userData = trans_user_api(result);
      users.push(userData);
      return cb(err);
    });
  }, function(err){
    callback(err, users);
  });
};

exports.appendUser = function(source, field, callback) {
  var code = "";
  user.appendUser(code, source, field, function(err, src){
    _.each(src, function(row) {
      row.user = row["$" + field];
    });
    callback(err, src);
  });
};

exports.add = function(handler, callback) {

  trans_user_db(handler);

  user.add(handler, function(err, result) {

    if (err) {
      return callback(err);
    }

    return callback(err, true);
  });

};

exports.update = function(handler, callback) {

  trans_user_db(handler);

  user.update(handler, function(err, result) {

    if (err) {
      return callback(err);
    }

    return callback(err, true);
  });

};

/**
 * 加关注
 */
exports.follow = function(handler, callback){
  var  currentuid  =  handler.params.uid;
  var  followuid =  handler.params._id;
  if (!followuid) {
    return callback(new error.BadRequest(__("user.error.emptyName")));
  }

  if (!currentuid) {
    return callback(new error.BadRequest(__("user.error.wrongUser")));
  }

  if (followuid == currentuid) {
    return callback(new error.BadRequest(__("user.error.cannotFollowSelf")));
  }

  user.get(handler, function(err, result) {
    if (err) {
      return callback(new error.InternalServer(err));
    }

    if (!result) {
      return callback(new error.NotFound(__("user.error.notFound")));
    }

    var following = [];
    if (result.extend && result.extend.following) {
      following = result.extend.following;
    }
    following.push(followuid);

    handler.addParams("extendKey", "following");
    handler.addParams("extendValue", following);

    user.updateExtendProperty(handler, function(err, result) {
      if (err) {
        return callback(new error.InternalServer(err));
      }

      var follow = {
        currentuid_: currentuid,
        followeruid_:followuid
      };

      notification.createForFollow(follow);
      return callback(err, result.friends);
    });
  });
};

/**
 * 取消关注
 */
exports.unfollow = function(handler, callback){
  var  currentuid  =  handler.params.uid;
  var  followuid =  handler.params._id;
  if (!followuid) {
    return callback(new error.BadRequest(__("user.error.emptyName")));
  }

  if (!currentuid) {
    return callback(new error.BadRequest(__("user.error.wrongUser")));
  }

  if (followuid == currentuid) {
    return callback(new error.BadRequest(__("user.error.cannotFollowSelf")));
  }

  user.get(currentuid, function(err, result) {
    if (err) {
      return callback(new error.InternalServer(err));
    }

    if ( !(result.extend && result.extend.following) ) {
      return callback(new error.NotFound(__("user.error.notFound")));
    }

    var following = result.extend.following;
    following.splice($.inArray(followuid, following), 1);

    handler.addParams("extendKey", "following");
    handler.addParams("extendValue", following);

    user.updateExtendProperty(handler, function(err, result) {
      if (err) {
        return callback(new error.InternalServer(err));
      }
      return callback(err, result.friends);
    });
  });

};

// translation functions : cross <=>  smartcore

function trans_user_api(result) {

  var userData = {
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
    , email  : {
      email1    : result.email
    }
    , createat  : result.createAt
    , createby  : result.createBy
    , editat    : result.updateAt
    , editby    : result.updateBy
    , photo : result.extend.photo
  };
  return userData;
}

function trans_user_db(handler) {

  var params = handler.params;
  handler.addParams("uid", params._id);
  // handler.addParams("userName", params.id);
  handler.addParams("password", auth.sha256(params.password));
  // handler.addParams("first", params.name);
  handler.addParams("lang", params.lang || "ja");
  handler.addParams("timezone", params.timezone || "GMT+09:00");
  // handler.addParams("email", params.email.email1);
  var photo = params.photo;
  photo.big = params.photo.fid;
  photo.small = params.photo.fid;
  photo.middle = params.photo.fid;
  handler.addParams("extend", {
    name_zh  : params.name.name_zh        // name.name_zh
    , letter_zh : params.name.letter_zh  // name.letter_zh
    , following : params.following
    , mobile     : params.tel.mobile  // tel.mobile
    , photo : photo
  });
}

