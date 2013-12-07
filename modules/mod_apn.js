/**
 * Apn:
 * Copyright (c) 2013 Author li
 * 保存Apn终端信息
 */

var mongo = smart.util.mongoose
  , conn = smart.framework.connection
  , schema = mongo.Schema;

function model(code) {
  return conn.model(code, 'Apn', Apn);
}

var Apn = new schema({
    devicetoken: {type: String}
  , deviceowner: {type: String}
  , createby: {type: String, description: "创建者"}
  , createat: {type: Date, description: "创建时间"}
  , editby: {type: String, description: "修改者"}
  , editat: {type: Date, description: "修改时间"}
  });

/**
 *
 */
exports.create = function(apn_, callback_) {

  var apn = model();
  new apn(apn_).save(function(err, result){
    callback_(err, result);
  });
};

exports.remove = function(token_, callback_) {

  var apn = model();

  apn.remove({devicetoken: token_}, function(err, result){
    callback_(err, result);
  });
};


exports.find = function(condition, callback_) {

  var apn = model();

  apn.find(condition, function(err, result){
    callback_(err, result);
  });
};


/**
 *
 */
exports.update = function(apnid_, apn_, callback_) {

  var apn = model();

  apn.update({_id: apnid_}, apn_, function(err, result) {
    callback_(err, result);
  });
};
