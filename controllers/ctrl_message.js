var async = require("async")
  , amqp = lib.core.amqp
  , _ = require("underscore")
  // , i18n    = require('i18n')

  , ctrl_notification = lib.ctrl.notification
  , ctrl_user = lib.ctrl.user
  , fileinfo = lib.ctrl.dbfile

  // , util = lib.core.util
  , error = lib.core.errors
  // , log = lib.core.log
  , process = lib.core.process
  , message = require('../modules/mod_message')

  // TODO: 要对应  
  , user = lib.mod.user
  , group = lib.mod.group
  , topic = require('../modules/mod_topic')
  , notification = lib.mod.notification;

/**
 *
 * 创建消息
 */
exports.createMessage = function(currentuid_, params_, callback_){

  var content = params_.content
    , contentType = params_.contentType
    , attach = params_.attach
    , target = params_.target
    // , tousers = params_.tousers
    // , togroups = params_.togroups
    , range = params_.range || 1
    , at = params_.at
    , type = params_.type || 1
    , currentdate = Date.now();

  var newMessage = {};
  newMessage.type = type;
  if(target){
    newMessage.target = target;
  }
  if(attach){
    newMessage.attach = attach;
  }

  if(at){
    newMessage.at = at;
  }

  newMessage.range = range;
  newMessage.contentType = contentType;
  newMessage.content = content;
  newMessage.createby = currentuid_;
  newMessage.createat = currentdate;
  newMessage.editby = currentuid_;
  newMessage.editat = currentdate;

  message.create(newMessage, function(err, msg){
    if (err) {
      return callback_(new error.InternalServer(err));
    }
    //TODO 评论的时候这部分可能出错
    //TIPS ： 这部分代码同时对应 评论  和 提到我 的功能  START
    if(msg.target){
      message.at(msg.target, function(err, msgtarget){
        if(msgtarget.createby)
        {
          msg.part = {targetcreateby :msgtarget.createby};
          ctrl_notification.createForMessage(msg);
          
        }
      });
    }else{
      ctrl_notification.createForMessage(msg);
    }
    //TIPS ： 这部分代码同时对应 评论  和 提到我 的功能  END
    
     
    // 更新全文检索索引
    process.updateFulltextIndex(msg._id, "3", msg.content);
    if(msg.attach.length > 0){
      var fids = [];
      for(var i =0 ;i <attach.length;i++){
        fids.push(msg.attach[i].fileid);
      }
      if(fids.length > 0){
        amqp.smartThumb({
          fids:fids.join(),
          msg_id:msg._id,
          collection:"messages",
          width:"500"
        });
      }
      
    }
    callback_(err, msg);
  });
};

exports.copyMessage = function(currentuid_, params_, callback_){

  var content = params_.content
    , target = params_.target
    , at = params_.at
    , range = params_.range || 1
    , currentdate = Date.now();

  var tasks = [];

  // 1.取得 original message
  var task_getTargetMsg = function(cb){
    message.at(target, function(err,original){
      err = err ? new error.InternalServer(err) : null;
      cb(err,original);
    });
  };
  tasks.push(task_getTargetMsg);

  // 2.转发original message
  var task_saveMsg = function(original, cb){
    var newMessage = {};
    newMessage.type = original.type;
    newMessage.target = target;
    
    if(original.attach){
      newMessage.attach = original.attach;
    }

    newMessage.at = at;
    
    newMessage.range = range;
    newMessage.contentType = original.contentType;
    // TODO转发的对应
    // 转发字符的临时对应
    newMessage.content = content + "\n>" + original.content;
    newMessage.createby = currentuid_;
    newMessage.createat = currentdate;
    newMessage.editby = currentuid_;
    newMessage.editat = currentdate;

    message.create(newMessage, function(err, msg){
      err = err ? new error.InternalServer(err) : null;
      ctrl_notification.createForMessage(msg);
      // amqp.notify({
      //     _id: message_.at.users
      //   , msg: "1"
      // });
      cb(err, msg);
    });
  };
  tasks.push(task_saveMsg);

  async.waterfall(tasks,function(err, msg){
    return callback_(err, msg);
  });
};

exports.deleteMessage = function (mid_, callback_){
  if(!mid_){
    return callback_(new error.BadRequest("消息ID不能为空"));
  }

  message.remove(mid_, function(err, msg){
    err = err ? new error.InternalServer(err) : null;
    return callback_(err, msg);
  });
};

exports.like = function (mid_, uid_, callback_){
  if(!mid_){
    return callback_(new error.BadRequest("消息ID不能为空"));
  }

  message.like(mid_,uid_, function(err, msg){
    err = err ? new error.InternalServer(err) : null;
    return callback_(err, msg);
  });
};

exports.unlike = function (mid_, uid_, callback_){
  if(!mid_){
    return callback_(new error.BadRequest("消息ID不能为空"));
  }

  message.unlike(mid_,uid_, function(err, msg){
    err = err ? new error.InternalServer(err) : null;
    return callback_(err, msg);
  });
};

/**
 * 获取消息一览
 */
exports.getMessageList = function(option_, start_, count_, callback_){
  if (start_) {
    if (isNaN(start_)) {
      return callback_(new error.BadRequest("开始位置不是数字"));
    }
  }

  if (count_) {
    if (isNaN(count_)) {
      return callback_(new error.BadRequest("获取数量不是数字"));
    }
  }

  var timeline = new Date();

  var tasks = []
    , mid_ = option_.mid
    , uid_ = option_.uid
    , gid_ = option_.gid
    , login = option_.login
    , type = option_.type;

  if("user-homepage" == type) {
    // 人的发言
    var task_getUidsOfGroups = function(cb){
      group.getAllGroupByUid(login,function(err, groups){
        err = err ? new error.InternalServer(err) : null;
        var gids = [];
        _.each(groups,function(g){
          gids.push(g._id);
        });
        cb(err,{"uids":[uid_],"gids":gids});
      });
    };
    tasks.push(task_getUidsOfGroups);
  } else if("group-homepage" == type) {
    // 组内的发言
    var task_getGids = function(cb){
      cb("",{"range" : [gid_]});
    };
    tasks.push(task_getGids);
  } else if("topPage" == type){
    // 1.我关注人的发言+我的发言
    var task_getUids = function(cb){
      user.at(login,function(err,user){
        err = err ? new error.InternalServer(err) : null;
        var ids = [];
        ids.push(login);
        ids = ids.concat(user.following);
        cb(err,ids);
      });
    };
    tasks.push(task_getUids);

    // 2.相关组的发言
    var task_getUidsOfGroups2 = function(uids, cb){
      group.getAllGroupByUid(login,function(err, groups){
        err = err ? new error.InternalServer(err) : null;
        var gids = [];
        _.each(groups,function(g){
          gids.push(g._id);
        });
        cb(err,{uids:uids,range:gids});
      });
    };
    tasks.push(task_getUidsOfGroups2);

    // TODO
    //3.followed文件的动态
    //4.followed新鲜事的关注
  }
  else {
    // get message by mid
    var task_getMids = function(cb){
      cb("",{"mids" : [mid_]});
    };
    tasks.push(task_getMids);
  }

  // 消息
  var task_getMsgs = function(option, cb){
    option.before = option_.before;
    message.list(option, start_, count_, timeline, function(err, retmsg){
      err = err ? new error.InternalServer(err) : null;
      cb(err, retmsg);
    });
  };
  tasks.push(task_getMsgs);

  // 用户信息
  var task_getUsrInfo = function(msgs, cb) {
    async.forEach(msgs.items, function(msg, cb_) {
      ctrl_user.getUser(msg.createby, function(err, u) {
        msg.part = {"createby": {id: u._id, name: u.name, photo: u.photo, title:u.title, following:u.following, follower:u.follower}};
        cb_(err);
      });
    }, function(err) {
      err = err ? new error.InternalServer(err) : null;
      cb(err, msgs);
    });
  };
  tasks.push(task_getUsrInfo);

  // 取得范围range
  var task_getRangeInfo = function(msgs, cb) {
    async.forEach(msgs.items, function(msg, cb_) {
      if(msg.range != "1"){
        group.at(msg.range, function(err, u) {
          msg.part.range = u;
          cb_(err);
        });
      } else {
        cb_("");
      }
    }, function(err) {
      err = err ? new error.InternalServer(err) : null;
      cb(err, msgs);
    });
  };
  tasks.push(task_getRangeInfo);

  // 取得提到at
  var task_getAtInfo = function(msgs, cb) {
    async.forEach(msgs.items, function(msg, cb_) {
      async.waterfall([
        // 获取文书的值
        function(callback) {
          var tousers = msg.at.users;
          if(tousers) {
            user.find({"_id": {$in: tousers}}, function(err, users) {
              var array = [];
              _.each(users,function(u){array.push({id: u._id, name: u.name, photo: u.photo});});
              msg.part.atusers = array;
              callback(err);
            });
          }else{
            callback();
          }
        },
        // 获取文书的定义
        function(callback) {
          var togroups = msg.at.groups;
          if(togroups) {
            group.getAllGroupByUid(login,function(err,viewable){
              var gids = [];
              _.each(viewable, function(g){
                if(_.contains(togroups,g._id.toString())){
                  gids.push(g._id);
                }
              });
              group.find({"_id": {$in: gids}}, function(err, groups) {
                var array = [];
                _.each(groups,function(u){array.push({id: u._id, name: u.name, photo: u.photo});});
                msg.part.atgroups = array;
                callback(err);
              });
            });
          }else{
            callback();
          }
        }
      ], function(err) {
        cb_(err);
      });
    }, function(err) {
      err = err ? new error.InternalServer(err) : null;
      cb(err, msgs);
    });
  };
  tasks.push(task_getAtInfo);


  // 评论信息的个数
  var task_getRepMsgs = function(msgs, cb) {
    async.forEach(msgs.items, function(msg, cb_) {
      message.replyListNum(msg._id, function(err, repmsgs) {
        msg.part.replyNums = repmsgs;
        cb_(err);
      });
    }, function(err) {
      err = err ? new error.InternalServer(err) : null;
      cb(err, msgs);
    });
  };
  tasks.push(task_getRepMsgs);

  // 转发信息的个数
  var task_getFwdMsgs = function(msgs, cb) {
    async.forEach(msgs.items, function(msg, cb_) {
      message.forwardListNum(msg._id, function(err, forwardNums) {
        msg.part.forwardNums = forwardNums;
        cb_(err);
      });
    }, function(err) {
      err = err ? new error.InternalServer(err) : null;
      cb(err, msgs);
    });
  };
  tasks.push(task_getFwdMsgs);

  // 添付文书的信息
  var task_getDocuments = function(msgs, cb) {
    async.forEach(msgs.items, function(msg, cb_){
      if(msg.contentType == "documentBox" && msg.attach.length > 0){
        var fids = [];
        _.each(msg.attach, function(attach){
          fids.push(attach.fileid);
        });
        // var condition = {"_id": {"$in": fids}};
        fileinfo.getByIds(fids, function(err, result){
          msg.part.documents = result;
          cb_(err);
        });
      } else {
        cb_();
      }
    }, function(err){
      err = err ? new error.InternalServer(err) : null;
      cb(err, msgs);
    });
  };
  tasks.push(task_getDocuments);


  // 添付文书的信息
  var task_getNotification = function(msgs, cb) {
    
    async.forEach(msgs.items, function(msg, cb_) {
      notification.find({"objectid" : msg._id}, function(err, notification) {
        msg.part.notification = notification;
        cb_(err);
      });
    }, function(err) {
      err = err ? new error.InternalServer(err) : null;
      cb(err, msgs);
    });
  
  };
  tasks.push(task_getNotification);
  //TODO 收藏 和 赞

  async.waterfall(tasks,function(err, msgs){
    //用户刷新 HOME Msg List  的  时间点
    msgs.timeline =  new Date().getTime();
    return callback_(err, msgs);
  });

};

exports.getProfileMessage = function(uid_, start_, count_, timeline_, callback_){
  if(!uid_){
    return callback_(new error.BadRequest("无效的用户"));
  }

  if(isNaN(start_)){
    return callback_(new error.BadRequest("开始位置不是数字"));
  }

  if(isNaN(count_)){
    return callback_(new error.BadRequest("获取数量不是数字"));
  }

  if(!timeline_){
    timeline_ = new Date();
  }else if(isNaN(timeline_)){
    return callback_(new error.BadRequest("时间轴不是数字")); 
  }else{
    timeline_ = new Date(Number(timeline_));
  }

  async.parallel({
    user: function(callback){
      user.at(uid_, function(err, u){
        callback(err, u);
      });
    },
    groups: function(callback){
      group.find({"member": uid_}, function(err, groups){
        callback(err, groups);
      });
    },
    topics: function(callback){
      topic.find({"member": uid_}, function(err, topics){
        callback(err, topics);
      });
    }
  }, 
  function(err, results){
    if(err){
      return callback_(new error.InternalServer(err));
    }else{
      var friendIds = results.user.friends;
      var groupIds = [];
      var topicIds = [];

      for(var i = 0; i < results.groups.length; i++){
        groupIds.push(results.groups[i]._id);
      }
      for(i = 0; i < results.topics.length; i++){
        topicIds.push(results.topics[i]._id);
      }

      message.list(friendIds, groupIds, topicIds, start_, count_, timeline_, function(err, msgs){
        if(err){
          return callback_(new error.InternalServer(err));
        }else{
          var retMessages = [];
          async.forEachSeries(msgs, function(msg, cb){
            async.parallel({
              group: function(callback){
                if(msg.createin.gid){
                  group.at(msg.createin.gid, function(err, g){
                    callback(err, g);
                  });
                }else{
                  callback(null);
                }
              },
              topic: function(callback){
                if(msg.createin.tid){
                  topic.at(msg.createin.tid, function(err, t){
                    callback(err, t);
                  });
                }else{
                  callback(null);
                }
              },
              user: function(callback){
                if(msg.createby){
                  user.at(msg.createby, function(err, u){
                    callback(err, u);
                  });
                }else{
                  callback(null);
                }
              },
              originalmsg: function(callback){
                if(msg.originalmid){
                  message.at(msg.originalmid, function(err, m){
                    callback(err, m);
                  });
                }else{
                  callback(null);
                }
              }
            }, function(err, r){
              if(r.group){
                delete(msg._doc.createin.gid);
                msg._doc.createin.group = r.group;
              }
              if(r.topic){
                delete(msg._doc.createin.tid);
                msg._doc.createin.topic = r.topic;
              }
              if(r.user){
                msg._doc.createby = r.user;
              }
              if(r.originalmsg){
                msg._doc.originalmsg = r.originalmsg;
              }
              retMessages.push(msg);
              cb();
            });
          }, function(err){
            err = err ? new error.InternalServer(err) : null;
            return callback_(err, retMessages);
          });
        }
      });
    }
  });
};
exports.getMessageBoxList = function(uid_,start_, count_,callback_){
  if(!uid_){
    return callback_(new BadRequest("消息ID不能为空"));
  }

  if(isNaN(start_)){
    return callback_(new error.BadRequest("开始位置不是数字"));
  }

  if(isNaN(count_)){
    return callback_(new error.BadRequest("获取数量不是数字"));
  }

  var tasks = [];
  var task_boxList = function(cb){
    message.boxList(uid_, start_, count_, function(err, replies){
      err = err ? new error.InternalServer(err) : null;
      if (err) {
        return callback_(err);
      } else {
        cb(err, replies);
      }
    });
  };
  tasks.push(task_boxList);
  
  var task_getUsrInfo = function(replies, cb){
    async.forEach(replies.items, function(reply, cb_){
      user.at(reply.createby, function(err, u){
        reply.part = {"createby": {id: u._id, name: u.name, photo: u.photo}};
        cb_(err);
      });
      
    }, function(err){
      err = err ? new error.InternalServer(err) : null;
      cb(err, replies);
    });
  };
  tasks.push(task_getUsrInfo);

  var task_getTargetMsg= function(replies, cb){
    
    async.forEach(replies.items, function(reply, cb_){
      message.at(reply.target, function(err,tmsg){
        try{
          reply.part.targetmsg = {content :tmsg.content?tmsg.content : " "};
        }catch(e){
          reply.part.targetmsg = {content : " "};
        }
        cb_(err);
      });
    }, function(err){
      err = err ? new error.InternalServer(err) : null;
      cb(err, replies);
    });
  };
  tasks.push(task_getTargetMsg);
  

  async.waterfall(tasks,function(err,replies){
    return callback_(err, replies);
  });

};

exports.addReply = function(content_, notifyto_, replyto_, by_, at_, attach_, callback_){
  if(!replyto_){
    return callback_(new BadRequest("消息ID不能为空"));
  }

  if(notifyto_){
    notifyto_ = notifyto_.split(",");
  } else {
    notifyto_ = [];
  }


  var reply = {
      "type": 2
    , "content": content_
    , "notifyto": notifyto_
    , "replyto": replyto_
    , "attach": attach_
    , "createat": at_
    , "createby": by_
    };

  var tasks = [];
  var task_getRepliedMsg = function(cb){
    message.at(replyto_, function(err, m){
      err = err ? new error.InternalServer(err) : null;
      cb(err, m);
    });
  };
  tasks.push(task_getRepliedMsg);

  var task_addReply = function(msg, cb){
    reply.notifyto.push(msg.createby);
    message.create(reply, function(err,result){
      if(err){
        cb(new error.InternalServer(err));
      } else {
        err = err ? new error.InternalServer(err) : null;
        cb(err, result);
      }
    });
  };
  tasks.push(task_addReply);

  var task_getUsrInfo = function(rpl,cb){
    if (rpl.createby) {
      user.at(rpl.createby, function(err, u){
        rpl._doc.createby = u;
        // TODO 处理user返回哪些字段
        cb(err, rpl);
      });
    } else {
      cb(null,rpl);
    }
  };
  tasks.push(task_getUsrInfo);

  async.waterfall(tasks,function(err,rpl){
    return callback_(err, rpl);
  });

};

/**
 * 获取指定的消息
 */
exports.getMessage = function(mid_, login_, callback_){
  if (!mid_) {
    return callback_(new error.BadRequest("消息ID不能为空"));
  }

  exports.getMessageList({"mid": mid_, "login":login_}, 0, 20, function(err, result) {
    callback_(err,result.items[0]);
  });
};

/**
 * 获取回复消息
 */
// exports.getReplyList = function(mid_, start_, count_, callback_){
//   if(!mid_){
//     return callback_(new error.BadRequest("消息ID不能为空"));
//   }

//   if(isNaN(start_)){
//     return callback_(new error.BadRequest("开始位置不是数字"));
//   }

//   if(isNaN(count_)){
//     return callback_(new error.BadRequest("获取数量不是数字"));
//   }

//   message.replyList(mid_, start_, count_, function(err, result){
//     err = err ? new error.InternalServer(err) : null;
//     return callback_(err, result);
//   });
// }

exports.getReplyList = function(mid_, start_, count_, callback_){
  if(!mid_){
    return callback_(new BadRequest("消息ID不能为空"));
  }

  if(isNaN(start_)){
    return callback_(new error.BadRequest("开始位置不是数字"));
  }

  if(isNaN(count_)){
    return callback_(new error.BadRequest("获取数量不是数字"));
  }

  var tasks = [];
  var task_getReplies = function(cb){
    message.replyList(mid_, start_, count_, function(err, replies){
      err = err ? new error.InternalServer(err) : null;
      if (err) {
        return callback_(err);
      } else {
        cb(err, replies);
      }
    });
  };
  tasks.push(task_getReplies);
  
  var task_getUsrInfo = function(replies, cb){
    async.forEach(replies.items, function(reply, cb_){
      user.at(reply.createby, function(err, u){
        reply.part = {"createby": {id: u._id, name: u.name, photo: u.photo}};
        cb_(err);
      });
    }, function(err){
      err = err ? new error.InternalServer(err) : null;
      cb(err, replies);
    });
  };
  tasks.push(task_getUsrInfo);

  async.waterfall(tasks,function(err,replies){
    return callback_(err, replies);
  });
};

exports.getForwardList = function(mid_, start_, count_, callback_){
  if(!mid_){
    return callback_(new error.BadRequest("消息ID不能为空"));
  }

  if(isNaN(start_)){
    return callback_(new error.BadRequest("开始位置不是数字"));
  }

  if(isNaN(count_)){
    return callback_(new error.BadRequest("获取数量不是数字"));
  }

  var tasks = [];
  var task_getReplies = function(cb){
    message.forwardList(mid_, start_, count_, function(err, replies){
      err = err ? new error.InternalServer(err) : null;
      if (err) {
        return callback_(err);
      } else {
        cb(err, replies);
      }
    });
  };
  tasks.push(task_getReplies);
  
  var task_getUsrInfo = function(replies, cb){
    async.forEach(replies.items, function(reply, cb_){
      user.at(reply.createby, function(err, u){
        reply.part = {"createby": {id: u._id, name: u.name, photo: u.photo}};
        cb_(err);
      });
    }, function(err){
      err = err ? new error.InternalServer(err) : null;
      cb(err, replies);
    });
  };
  tasks.push(task_getUsrInfo);

  // 取得范围range
  var task_getRangeInfo = function(msgs, cb) {
    async.forEach(msgs.items, function(msg, cb_) {
      if(msg.range != "1"){
        group.at(msg.range, function(err, u) {
          msg.part.range = {id: u._id, name: u.name, photo: u.photo};
          cb_(err);
        });
      } else {
        cb_("");
      }
    }, function(err) {
      err = err ? new error.InternalServer(err) : null;
      cb(err, msgs);
    });
  };
  tasks.push(task_getRangeInfo);

  // 取得提到at
  var task_getAtInfo = function(msgs, cb) {
    async.forEach(msgs.items, function(msg, cb_) {
      async.waterfall([
        // 获取文书的值
        function(callback) {
          var tousers = msg.at.users;
          if(tousers) {
            user.find({"_id": {$in: tousers}}, function(err, users) {
              var array = [];
              _.each(users,function(u){array.push({id: u._id, name: u.name, photo: u.photo});});
              msg.part.atusers = array;
              callback(err);
            });
          }else{
            callback();
          }
        },
        // 获取文书的定义
        function(callback) {
          var togroups = msg.at.groups;
          if(togroups) {
            group.find({"_id": {$in: togroups}}, function(err, groups) {
              var array = [];
              _.each(groups,function(u){array.push({id: u._id, name: u.name, photo: u.photo});});
              msg.part.atgroups = array;
              callback(err);
            });
          }else{
            callback();
          }
        }
      ], function(err) {
        cb_(err);
      });
    }, function(err) {
      err = err ? new error.InternalServer(err) : null;
      cb(err, msgs);
    });
  };
  tasks.push(task_getAtInfo);

  async.waterfall(tasks,function(err,replies){
    return callback_(err, replies);
  });
};


// unused source?
//
// function checkRepostMessage(msg_, callback_){
//   if(msg_ instanceof Array){
//     async.forEachSeries(msg_, function(item, cb){
//       if(item.originalmid){
//         message.at(item.originalmid, function(err, m){
//           if(err){
//             cb(err);
//           }else{
//             item._doc["originalmsg"] = m;
//             cb();
//           }
//         });
//       }else{
//         cb(); 
//       }
//     }, function(err){
//       err = err ? new error.InternalServer(err) : null;
//       return callback_(err, msg_);
//     });
//   }else{
//     if(!msg_.originalmid){
//       return callback_(null, msg_);
//     }else{
//       message.at(msg_.originalmid, function(err, m){
//         msg_._doc["originalmsg"] = m;
//         return callback_(err, msg_);
//       });
//     }
//   }
// };




//获得提到我的一览
exports.getMsgAtList = function(_id, callback_){

  var tasks = [];
  var task_getMailList = function(cb){
    message.queryMsgAtList(_id,function(err, result){
      err = err ? new error.InternalServer(err) : null;
      if (err) {
        return callback_(err);
      } else {
        cb(err, result);
      }
    });
  };
  

  tasks.push(task_getMailList);

  var task_getUsrInfo = function(replies, cb){
    async.forEach(replies, function(reply, cb_){
      user.at(reply.createby, function(err, u){
        reply.part = {"user": {id: u._id, name: u.name, photo: u.photo}};
        cb_(err);
      });
    }, function(err){
      err = err ? new error.InternalServer(err) : null;
      cb(err, replies);
    });
  };
  tasks.push(task_getUsrInfo);
  
  async.waterfall(tasks,function(err,result){
    return callback_(err, result);   
  });

};


//获得回复我的一览
exports.getMsgCommentList = function(_id, callback_){

  var tasks = [];
  // var msgsss = [];
  var task_getMyMailList = function(cb){
    message.queryMyMessage(_id,function(err, result){
      err = err ? new error.InternalServer(err) : null;
      if (err) {
        return callback_(err);
      } else {
        cb(err, result);
      }
    });
  };
  

  tasks.push(task_getMyMailList);

  var task_getReplyMailList = function(msgs,cb){
    var msg_id = [];
    async.forEach(msgs, function(msg){
      msg_id.push(msg._id);
        
    });
    message.queryMsgCommentList(msg_id, function(err, msgs_){
      err = err ? new error.InternalServer(err) : null;
      if (err) {
        return cb(err);
      } else {
        cb(err, msgs_);
      }
    });
  };
  tasks.push(task_getReplyMailList);  

  // 使用用户的共通方法来添加用户信息
  var task_getUsrInfo = function(replies, cb){
    ctrl_user.appendUser(replies, "createby", function(err, result){
      cb(err, result);
    });
    // async.forEach(replies, function(reply, cb_){
    //   user.at(reply.createby, function(err, u){
    //     reply.part = {"user": {id: u._id, name: u.name, photo: u.photo}};
    //     cb_(err);
    //   });
    // }, function(err){
    //   err = err ? new error.InternalServer(err) : null;
    //   cb(err, replies);
    // });
  };
  tasks.push(task_getUsrInfo);

  async.waterfall(tasks,function(err,result){
    return callback_(err, result);   
  });

};



//获得我未读消息的数量 和 消息
exports.getMsgUnRead = function(option_,timeline_,callback_){


  var tasks = []
  // , mid_ = option_.mid
  // , uid_ = option_.uid
  // , gid_ = option_.gid
  , login = option_.login;
  // , type = option_.type;

  var task_getUids = function(cb){
    user.at(login,function(err,user){
      err = err ? new error.InternalServer(err) : null;
      var ids = [];
      ids = ids.concat(user.following);
      cb(err,ids);
    });
  };
  tasks.push(task_getUids);

  // 2.相关组的发言
  var task_getUidsOfGroups = function(uids, cb){
    group.getAllGroupByUid(login,function(err, groups){
      err = err ? new error.InternalServer(err) : null;
      var gids = [];
      _.each(groups,function(g){
        gids.push(g._id);
      });
      cb(err,{uids:uids,range:gids});
    });
  };
  tasks.push(task_getUidsOfGroups);

  var task_getMessageList = function(opt,cb){
    opt.login = login;
    //获得HOME MESSAGE的新消息个数
    message.unreadMessageCount(opt, 0, 99999, timeline_, function(err, retmsg){
      err = err ? new error.InternalServer(err) : null;
      cb(err, retmsg);
    });
  };
  tasks.push(task_getMessageList);


  async.waterfall(tasks,function(err,result){
    return callback_(err, result);   
  });
};
