var notification = require("../controllers/ctrl_notification")
  , user  = smart.ctrl.user
  , group  = require("../controllers/ctrl_group")
  , async = smart.util.async
  , _      = smart.util.underscore
  , context   = smart.framework.context
  , auth = smart.framework.auth
  , constant  = smart.framework.constant
  , error = smart.framework.errors
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

    var condition = { "extend.following": handler.params.uid};
    handler.addParams("condition", condition);
    user.getList(handler, function(err, followers){
      var fs = [];
      _.each(followers.items, function(user) {
        fs.push(user._id);
      });
      userData.follower = fs;
      return callback(err, userData);
    });
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
    async.eachSeries(userResult.items, function(user, done) {
      var u = trans_user_api(user);

      if(u.groups && u.groups.length > 0) {
        handler.addParams("gid", u.groups[0]);
        group.getGroup(handler, function(err, result) {
          u.department = result;
          users.push(u);
          done(err);
        });
      } else {
        u.department = null;
        users.push(u);
        done(null);
      }

    }, function (err) {
      return callback(err, users);
    });

  });

};

exports.getUserList = function(handler, callback){

  var params = handler.params;
  if (!params) {
    // {"kind":"following", "firstLetter":"", "uid":uid_, "start":0, "limit":20}
    // {"kind":"all", "firstLetter":firstLetter_, "uid":uid_, "start":start_, "limit":limit_}
    params = handler;
    handler = new context().bind({ session: { user: { _id: constant.DEFAULT_USER } } }, {});
    handler.addParams("kind", handler.kind);
    handler.addParams("firstLetter", handler.firstLetter);
    handler.addParams("uid", handler.uid);
  }

  var kind_ = params.kind || "all";
  var firstLetter_ = params.firstLetter;
  var uid_ = params.uid || handler.uid.toString();
  var keywords_ = params.keywords;
  var gid = params.gid;
  var condition = {};
  // 首字母过滤
  if (keywords_) {
    condition.$or = [
      {"extend.name_zh": new RegExp(keywords_.toLowerCase(), "i")}
      , {"extend.letter_zh": new RegExp(keywords_.toLowerCase(), "i")}
      , {"email": new RegExp(keywords_.toLowerCase(), "i")}
      , {"first": new RegExp(keywords_.toLowerCase(), "i")}
    ];
  }
  if (firstLetter_) {
    firstLetter_ = sanitize(firstLetter_).xss();
    condition.$or = [
      {"extend.name_zh": new RegExp("^" + firstLetter_.toLowerCase() + ".*$", "i")}
      , {"extend.letter_zh": new RegExp("^" + firstLetter_.toLowerCase() + ".*$", "i")}
    ];
  }

  // 获取所有用户
  if (kind_ == "all") {
    exports.at(uid_, function(err, follower) {
      if (err) {
        return callback(new error.InternalServer(err));
      }

      handler.addParams("condition", condition);

      user.getList(handler, function(err, result){
        var uList = [];
        async.eachSeries(result.items, function(item, done){
          var u = trans_user_api(item);
          if (follower) {
            u.followed = _.some(follower.following, function(u){return u == item._id;});
          }

          if(u.groups && u.groups.length > 0) {
            handler.addParams("gid", u.groups[0]);
            group.getGroup(handler, function(err, result) {
              u.department = result;
              uList.push(u);
              done(err);
            });
          } else {
            u.department = null;
            uList.push(u);
            done(null);
          }

        }, function (err) {
          return callback(err, uList);
        });
      });
    });
  }

  // 获取关注我的人
  if (kind_ == "follower") {
    condition["extend.following"] = uid_;
    handler.addParams("condition", condition);
    user.getList(handler, function(err, result){
      var uList = [];
      async.eachSeries(result.items, function(item, done){
        var u = trans_user_api(item);
        if(u.groups && u.groups.length > 0) {
          handler.addParams("gid", u.groups[0]);
          group.getGroup(handler, function(err, result) {
            if(err) {
              return done(err);
            }
            u.department = result;
            uList.push(u);
            return done();
          });
        } else {
          uList.push(u);
          return done();
        }

      }, function(err) {
        return callback(err, uList);
      });
    });
  }

  // 获取我关注的人
  if (kind_ == "following") {
    handler.addParams("uid", uid_);
    user.get(handler, function(err, result) {

      if (err) {
        return callback(err);
      }
      exports.listByUids(result.extend.following, function(e, users){

        //设置所属组
        if(!e && users) {
          async.eachSeries(users, function(userItem, done) {
            if(userItem.groups && userItem.groups.length > 0) {
              handler.addParams("gid", userItem.groups[0]);
              group.getGroup(handler, function(err, result) {
                userItem.department = result;
                done(err);
              });
            } else {
              userItem.department = null;
              done(null);
            }
          }, function(err) {
            callback(e,  users);
          });
        } else {
          callback(e);
        }
      });
    });
  }

  if(kind_ == "group") {
    group.getMember(handler, function(err, result){
      if (err) {
        return callback(new error.InternalServer(err));
      }
      return callback(err,  result.items);
    });
  }

};

exports.listByUids = function(uids, callback){

  var handler = new context().bind({ session: { user: { _id: constant.DEFAULT_USER } } }, {});

  var users = [];
  async.eachSeries(uids, function(uid, cb){

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
      var target = row._doc || row;
      var user = trans_user_api(target["$"+field]);
      target.user = user;
      //delete row["$"+field];
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
    if (_.contains(following, followuid)) {
      return callback(err, false);
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
      return callback(err, result.extend.following);
    });
  });
};

/**
 * 取消关注
 */
exports.unfollow = function(handler, callback){
  var  currentuid  =  handler.params.uid;
  var  followuid =  handler.params._id;        console.log(currentuid); console.log(followuid);
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

    if ( !(result.extend && result.extend.following) ) {
      return callback(new error.NotFound(__("user.error.notFound")));
    }

    var following = [];
    _.each(result.extend.following, function(u){
      if(u != followuid) {
        following.push(u);
      }
    });
    handler.addParams("extendKey", "following");
    handler.addParams("extendValue", following);

    user.updateExtendProperty(handler, function(err, result) {
      if (err) {
        return callback(new error.InternalServer(err));
      }
      return callback(err, result.extend.following);
    });
  });

};

// translation functions : cross <=>  smartcore

function trans_user_api(result) {
  if (!result || !result.extend){
     return result;
  }

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
    , groups : result.groups
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

