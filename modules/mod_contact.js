/**
 * Contact:
 * Copyright (c) 2013 Author li
 * 保存两人对话或组会话的成员信息。会话的详细内容需使用该contact的ID去shortmail表里获取。
 */

var mongo = require('mongoose')
  , conn = require('./connection')
  , schema = mongo.Schema;

function model() {
  return conn().model('Contact', Contact);
}

var Contact = new schema({
    title: {type: String}
  , member: [String]
  , photo: {
      big: {type: String}
    , middle: {type: String}
    , small: {type: String}
    }
  , lastMessage: {type: String}
  , createby: {type: String, description: "创建者"}
  , createat: {type: Date, description: "创建时间"}
  , editby: {type: String, description: "修改者"}
  , editat: {type: Date, description: "修改时间"}
  });

/**
 *
 */
exports.create = function(contact_, callback_) {

  var contact = model();
  new contact(contact_).save(function(err, result){
    callback_(err, result);
  });
};

/**
 *
 */
exports.at = function(contactid_, callback_) {

  var contact = model();

  contact.findById(contactid_, function(err, result){
    callback_(err, result);
  });
};

/**
 *
 */
exports.update = function(contactid_, obj_, callback_) {

  var contact = model();

  contact.findByIdAndUpdate(contactid_, obj_, function(err, result) {
    callback_(err, result);
  });
};

/**
 * create的简易版
 * 如果不存在，则创建两人的对话
 */
exports.createOneOnOne = function(uid1_, uid2_, lastMessage_, callback_) {

  exports.findOneOnOne(uid1_, uid2_, function(err, result){
    if (err) {
      callback_(err, result);
    }

    var obj;
    var date = new Date();

    // 存在，更新最终消息，并返回
    if (result && result.length > 0) {
      obj = {lastMessage: lastMessage_, editat: date, editby: uid1_};
      return exports.update(result[0]._id, obj, function(err, result){
        callback_(err, result);
      });
    }

    // 不存在，创建
    obj = {
        member: [uid1_, uid2_]
      , lastMessage: lastMessage_
      , createby: uid1_
      , createat: date
      , editby: uid1_
      , editat: date
      };

    exports.create(obj, function(err, result){
      callback_(err, result);
    });
  });

};

/**
 * 获取两人的对话
 */
exports.findOneOnOne = function(uid1_, uid2_, callback_) {

  var contact = model()
    , condition = {
      $and: [
        {member: {$size: 2}}
      , {member: {$all: [uid1_, uid2_]}}
      ]
    };

  contact.find(condition, function(err, result){
    callback_(err, result);
  });
};

exports.findByUser = function(uid_, callback_) {

  var contact = model()
    , condition = {member: uid_};

  contact.find(condition).sort({editat: 'desc'}).exec(function(err, result){
    callback_(err, result);
  });
};

