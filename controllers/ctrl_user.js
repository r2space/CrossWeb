var notification = require("../controllers/ctrl_notification")
  , user  = smart.ctrl.user
  , async = smart.util.async
  , _      = smart.util.underscore;;

var FAKE_PASSWORD = "0000000000000000";

exports.get = function(handler, callback) {

  handler.addParams("uid", handler.params.userId);

  user.get(handler, function(err, result) {

    if (err) {
      return callback(err);
    }
    var userData = trans_user_api(result);
    return callback(err, userData);
  });

};

exports.getList = function(handler, callback) {

  handler.addParams("uid", handler.params.userId);

  user.getListByKeywords(handler, function(err, userResult) {

    if (err) {
      return response.send(res, err);
    }

    var users = [];
    var uids = [];
    _.each(userResult.items, function(user) {

      users.push(trans_user_api(user));
      uids.push(user._id.toString());
    });

    if (err) {
      return callback(err);
    }
    return callback(err, { totalItems: userResult.totalItems, items: users });
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
  var  followuid =  handler.params.userId;
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
        followeruid_:followeruid
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
  var  followuid =  handler.params.userId;
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

// private functions : cross <=>  smartcore

function trans_user_api(result) {
  var userData = {};

  if (result) {

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
    };
  }
  return userData;
}

function trans_user_db(handler) {

  var params = handler.params;

  handler.addParams("uid", params.userId);
  handler.addParams("userName", params.id);
  handler.addParams("password", auth.sha256(params.password));
  handler.addParams("first", params.name);
  handler.addParams("lang", params.lang || "ja");
  handler.addParams("timezone", params.timezone || "GMT+09:00");
  handler.addParams("email", params.email.email1);
  handler.addParams("extend", {
    name_zh  : params.name        // name.name_zh
    , letter_zh : params.letter  // name.letter_zh
    , following : params.following
    , mobile     : params.mobile  // tel.mobile
  });

}

