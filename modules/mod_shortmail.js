/**
 * ShortMail:
 * Copyright (c) 2012 Author li
 */

var mongo = require('mongoose')
  , conn = require('./connection')
  , _ = require('underscore')
  , sync = require('async')
  , schema = mongo.Schema
  , user = lib.mod.user;

function model() {
  return conn().model('ShortMail', ShortMail);
}

var ShortMail = new schema({
    message: {type: String}
  , contact: {type: String, description: "对话组"}
  , read: {type: Number}
  , to: {type: String}
  , attach: [{
      name: {type: String}
    , path: {type: String}
    }]
  , createby: {type: String, description: "创建者"}
  , createat: {type: Date, description: "创建时间"}
  , editby: {type: String, description: "修改者"}
  , editat: {type: Date, description: "修改时间"}
  , remove: {type: Number}
  });

exports.create = function(mail_, callback_) {
  var shortmail = model()
    , m = new shortmail();

  m.message = mail_.message;
  m.contact = mail_.contact;
  m.read = 0;
  m.to = mail_.to;
  m.createby = mail_.by;
  m.createat = new Date();
  m.editby = mail_.by;
  m.editat = new Date();
  m.remove = 0;

  m.save(function(err, mail){
    callback_(err, mail);
  });
};

// exports.unreaded2 = function(userid_, callback_){
//   var shortmail = model();
//   sync.waterfall([
//     function(callback){
//       shortmail.find({to: userid_, read: 0},{createby:1})
//         .distinct("createby", function(err,ids){
//           callback(ids);
//         });
//     },

//     // 获取用户
//     function(uids,callback){
//       sync.forEach(uids, function(uid,cb))
//     },

//     // 获取用户最近一条消息
//   ],function(){});
// };

exports.unread = function(userid_, callback_) {
  var shortmail = model();

  sync.waterfall([

    // 获取消息
    function(callback){
      shortmail.find({to: userid_, read: 0})
        .skip(0)
        .limit(5)
        .sort({editat: 'desc'})
        .exec(function(err, result){
          callback(err, {list: result});
        });
    },

    // 获取用户
    function(mails, callback) {
      var userids = [];
      _.each(mails.list, function(mail){
        userids.push(mail.createby);
      });

      user.find({"_id": {$in: userids}}, function(err, result){
        mails.user = result;
        callback(err, mails);
      });
    },

    // 获取总件数
    function(mails, callback){
      shortmail.count({to: userid_, read: 0}, function(err, result){
        mails.count = result;
        callback(err, mails);
      });
    }
  ],
  function(err, mails) {

    var result = [];
    _.each(mails.list, function(item) {

      // 获取用户名称及图片
      var user = _.find(mails.user, function(u){
        return u._id == item.createby;
      });

      result.push({
          "uid": user._id
        , "user": user.name.name_zh
        , "photo": user.photo
        , "message": item.message
        , "_id": item._id
        });
    });

    callback_(err, {list: result, count: mails.count});
  });
};

exports.read = function(id_, callback_) {
  var shortmail = model();

  shortmail.update({"_id": id_}, {"read": 1}, function(err, count){
    callback_(err, count);
  });
};

// exports.getMailUser = function(id_, callback_){
//   var shortmail = model();

//   shortmail.find({'$or':[{'createby' : id_}, {'to':id_}]})
//     .distinct('to', function(err, result){
//       callback_(err, result);
//     });

//   return;

//   sync.waterfall(
//   [
//     // 获取消息
//     function(callback){
//       shortmail.find({'$or':[{'createby' : id_},{'to':id_}]})
//         .sort({editat:'desc'})
//         .exec(function(err, result){
//           var data ={};
//           data.ids = [];
//           data.unreadCount = {};
//           for(var i in result){
//             if(result[i].createby === id_){
//               if(!_.contains(data.ids, result[i].to)){
//                 data.ids.push(result[i].to);
//               }
              
//             }else{
//               if(!_.contains(data.ids, result[i].createby)){
//                 data.ids.push(result[i].createby);
//               }
//               if(!result[i].read){
//                 if(data.unreadCount[result[i].createby] === undefined){
//                   data.unreadCount[result[i].createby] = 0;
//                 }
//                 data.unreadCount[result[i].createby] += 1;
//               }
//             }
//           }
//           callback(err, data);
//         });
//     },
 
//     // 获取用户
//     function(data, callback) {
//       user.find({"_id": {$in: data.ids}}, function(err, result){
//         _.each(result, function(user){
//           user._doc.unreadCount = data.unreadCount[user._id];
//         });
//         callback(err, result);
//       });
//     }
//   ],
//   function(err, all_users) {
//     return new callback_(err, {"items": all_users});
//   }
//   );
// };

exports.getLastMail = function(id_, uid_, callback_){
  var shortmail = model();
  shortmail.find({'createby':uid_,'to':id_})
    .sort({createat: -1})
    .limit(1)
    .exec(function(err, result){
      callback_(err, result);
    });
};

exports.getUnreadCount = function(id_, uid_, callback_) {
  var shortmail = model();

  shortmail.find({'createby':uid_,'to':id_, read: 0})
          .sort({editat:'desc'})
          .count()
          .exec(function(err, result){
            callback_(err, result);
          });
};


// 通过会话的ID，获取内容
exports.getStoryByContact = function(contact_, date_, limit_, callback_) {

  var shortmail = model();
  var condition = {contact: contact_};
  if(date_){
    condition.createat = {$lt: date_};
  }

  shortmail.find(condition)
    .sort({"createat": 'asc'})
    .limit(limit_)
    .exec(function(err, mails){
      callback_(err, mails);
    });
};

exports.getEarlierMails = function(id_, uid_, date_, callback_){
  var shortmail = model();

  var condition = {'$or':[{'createby':id_,'to':uid_},{'createby':uid_,'to':id_}]};
  if(date_){
    condition.createat = {$lt: date_};
  }

  shortmail.find(condition)
    .sort({"createat": 'desc'})
    .limit(20)
    .exec(function(err, mails){
      callback_(err, mails.reverse());
    });
};

exports.getMailList = function(id_, uid_, callback_){

  var shortmail = model();
  
  shortmail.find({"read": 0, '$or':[{'createby':id_,'to':uid_},{'createby':uid_,'to':id_}]})
    .sort({createat: 'asc'})
    .exec(function(err, mails){

      // 更新为以读
      sync.forEach(mails, function(mail, cb) {
        if (mail.createby != id_ && mail.read != 1) {
          shortmail.findByIdAndUpdate(mail._id, {"read": 1},function(err, m) {
            mail = m;
            cb(err);
          });
        }
      });

      callback_(err, mails);
    });
};

exports.getByContact = function(contact_, callback_) {

  var shortmail = model();

  shortmail.find({contact: contact_})
    .sort({createat: 'asc'})
    .exec(function(err, mails){

      // 更新为以读
      sync.forEach(mails, function(mail, cb) {
        if (mail.createby != id_ && mail.read != 1) {
          shortmail.findByIdAndUpdate(mail._id, {"read": 1},function(err, m) {
            mail = m;
            cb(err);
          });
        }
      });

      callback_(err, mails);
    });
};
