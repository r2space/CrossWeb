var _ = smart.util.underscore
  , amqp = smart.util.amqp
  , async = smart.util.async
  , log = smart.framework.log
  , error = smart.framework.errors
  , util = smart.framework.util
  , group = smart.ctrl.group
  , user = smart.ctrl.user
  , notification = require("../modules/mod_notification");


//我被某组移除的通知
exports.createForRemove = function(invite,callback_){
    var notification_ = {
      content: invite.groupName,
      read:[],
      tousers : [invite.uid],
      togroups : [],
      type : "remove",
      objectid: invite.groupId,
      createby: invite.userid,
      createat: new Date()
    };

    amqp.notice({
      _id: invite.uid
    , type : "group"
    });


    notification.create(notification_, function(err, notification){
//      console.log(notification);
    });
    
}

//我被加入某组的通知
exports.createForInvite = function(invite,callback_){
    var notification_ = {
      content: invite.groupName,
      read:[],
      tousers : [invite.uid],
      togroups : [],
      type : "invite",
      objectid: invite.groupId,
      createby: invite.userid,
      createat: new Date()
    };

    amqp.notice({
      _id: invite.uid
    , type : "group"
    });


    notification.create(notification_, function(err, notification){
//      console.log(notification);
    });
    
}

//创建消息的通知
exports.createForFollow = function(follow, callback_){
    var notification_ = {
      content: __("ctrl.notifiction.js.label.follow"), //"关注我"
      read:[],
      tousers : [follow.followeruid_],
      togroups : [],
      type : "follow",
      objectid: follow.currentuid_,
      createby: follow.currentuid_,
      createat: new Date()
    };

    amqp.notice({
      _id: follow.followeruid_
    , type : "follow"
    });


    notification.create(notification_, function(err, notification){
      // console.log(notification);
    });
    
}

exports.createForMessage = function(message_, callback_) {
  
  var tasks = [];

  // TODO: 分离Core后，需要把消息关联的内容拿出去
  // var message = require('../modules/mod_message');

  // reply
  //TODO :这里可能 有BUG  message_.part.targetcreateby, 未空
  //DONE : 修改回复的BUG
  if(message_.type == 2&&message_.part.targetcreateby){
    var task_reply = function(cb){

        var notification_ = {
          content: message_.content,
          read:[],
          tousers : message_.part.targetcreateby,
          togroups : [],
          type : "reply",
          objectid: message_.target,
          createby: message_.createby,
          createat: message_.createat
        };

        amqp.notice({
          _id: message_.part.targetcreateby
        , content : "1"
        });

        notification.create(notification_, function(err, notification){
          cb(err, notification);
        });

    };
    tasks.push(task_reply);
  }
    
  // at
  if(message_.at.users.length > 0 || message_.at.groups.length > 0){
    var task_at = function(cb){
      
      var notification_ = {
        content: message_.content,
        readers:[],
        tousers : message_.at.users,
        togroups : message_.at.groups,
        type : "at",
        objectid: message_._id,
        createby: message_.createby,
        createat: message_.createat
      };

      notification.create(notification_, function(err, notification){
        cb(err, notification);
        async.forEach(message_.at.users,function(user){
          amqp.notice({
            _id: user
          , content : "1"
          });
        });
        async.forEach(message_.at.groups,function(gid){
          group.getUsersInGroup( {gid: gid, recursive: true}, function(err, uids){
            async.forEach(uids, function(uid){
              amqp.notice({
                _id: uid
              , content : "1"
              });
            });
          });
        });
      });
    };
    tasks.push(task_at);
  }
  
  async.waterfall(tasks,function(err, result){
    if(callback_){
      callback_(err, result);
    }
  });
};


exports.read = function(nids, uids, callback_) {

  notification.find({_id : {$in : nids}}, function(error, notifications){
    async.forEach(notifications, function(noti, cb_) {
      noti.readers = _.union(noti.readers, uids);
      notification.update(noti._id, {"readers":noti.readers}, function(err, result){
        //console.log(result);
        amqp.notice({
          _id: noti.readers
        , content : "1"
        });
        cb_(err, result);
      });
    }, function(err) {
      err = err ? new error.InternalServer(err) : null;
      callback_(err, nids);
    });
  });

};

exports.getList = function(param, callback_) {

  var tasks = [];
  var task_getNotifications = function(cb_){
    notification.list(param,function(err,result){
      cb_(err,result);
    });
  };
  tasks.push(task_getNotifications);

  var task_getUsers = function(result, cb_){
    user.appendUser(null , result.items, "createby", function(err, added){
      result.items = added;
      cb_(err, result);
    });
  };
  tasks.push(task_getUsers);

  // TODO: 分离Core后，需要把消息关联的内容拿出去
  // var ctrl_message = require("../controllers/ctrl_message");
  // var task_getMessages = function(result, cb_){
  //   async.forEach(result.items, function(notify, cb){
  //     if(notify.type == 'at'){
  //       ctrl_message.getMessage(notify.objectid, param.uid, function(err_, msg){
  //         notify._doc.message = msg;
  //         cb(err_);
  //       });
  //     } else {
  //       cb();
  //     }
  //   }, function(err){
  //     cb_(err,result)
  //   });
  // };
  // tasks.push(task_getMessages);

  async.waterfall(tasks,function(err, result){
    return callback_(err, result);
  });

};

