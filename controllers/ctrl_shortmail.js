
var async = require("async")
  , _ = require("underscore")
  , shortmail = require('../modules/mod_shortmail')
  , contact = require('../modules/mod_contact')
  , ctrl_user = lib.ctrl.user
  , error = lib.core.errors;

exports.getMailUser = function(_id, callback_){

  contact.findByUser(_id, function(err, result){

    // 内部错误
    if (err) {
      return callback_(new error.InternalServer(err), result);
    }

    // 没有数据
    if (result.length < 1) {
      return callback_(err, []);
    }

    // 转换数据格式
    var users = [];
    _.each(result, function(item){

      var u = item.member[0] == _id ? item.member[1] : item.member[0];
      users.push({
          _id: item._id
        , lastMessage: item.lastMessage
        , person: u
        , member: item.member
        , editby: item.editby
        , editat: item.editat
        });
    });

    // 设定用户信息
    ctrl_user.appendUser(users, "person", function(err, result){
      callback_(err, result);
    });
  });

};

exports.getContacts = function(uid_, firstLetter_, start_, limit_, callback_){

  var tasks = [];
  var task_getUsers = function(cb){
    ctrl_user.getUserList({"kind":"all", "firstLetter":firstLetter_, "uid":uid_, "start":start_, "limit":limit_}, function(err, users){
      err = err ? new error.InternalServer(err) : null;
      if (err) {
        return callback_(err);
      } else {
        cb(err, {"contact": users});
      }
    });
  };
  tasks.push(task_getUsers);

  var task_getLastMail = function(result, cb){
    async.forEach(result.contact, function(user,cb_){
      shortmail.getLastMail(uid_, user._id, function(err, mail){
        if(mail.length>0){
          user._doc.lastMail = mail[0]; 
        }
        cb_(err);
      });
    }
    , function(err){
      cb(err, result);
    });
  };
  tasks.push(task_getLastMail);

  var task_getUnreadCount = function(result, cb){
    async.forEach(result.contact, function(user,cb_){
      shortmail.getUnreadCount(uid_, user._id, function(err, count){
        user._doc.unreadCount = count; 
        cb_(err);
      });
    }
    , function(err){
      cb(err,result);
    });
    
  };
  tasks.push(task_getUnreadCount);

  var task_done = function(err, result){
    return callback_(err, result);
  };

  async.waterfall(tasks,task_done);
};


exports.getEarlierMails = function(contact_, date_, limit_, callback_){

  shortmail.getEarlierMails(contact_, date_, limit_, function(err, result){
    err = err ? new error.InternalServer(err) : null; 
    callback_(err, result);
  });
};
// exports.getEarlierMails = function(_id, _uid, _date, callback_){

//   shortmail.getEarlierMails(_id, _uid, _date, function(err, mails){

//     if (err) {
//       return callback_(err);
//     }

//     ctrl_user.appendUser(mails, "createby", function(err, result){
//       callback_(err, result);
//     });

//   });
// };

// 获取与指定人的对话
exports.getMailList = function(contact_, date_, limit_, callback_){

  shortmail.getStoryByContact(contact_, date_, limit_, function(err, result){
    err = err ? new error.InternalServer(err) : null; 

    callback_(err, result);
  });

  // shortmail.getMailList(_id, _uid, function(err, mails) {

  //   if (err) {
  //     return callback_(err);
  //   }

  //   ctrl_user.appendUser(mails, "createby", function(err, result){
  //     callback_(err, result);
  //   });
  // });
};


// add by li
exports.unread = function(uid_, callback_) {
  shortmail.unread(uid_, function(err, result){
    callback_(err, result);
  });
};

// 添加一句话
exports.create = function(mail_, callback_) {

  contact.createOneOnOne(mail_.by, mail_.to, mail_.message, function(err, result){
    if (err) {callback_(err, result);}

    mail_.contact = result._id;
    shortmail.create(mail_, function(err, result){
      callback_(err, result);
    });
  });

};




