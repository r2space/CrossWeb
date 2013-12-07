var apn = require('../modules/mod_apn')
  , errors = smart.framework.errors;

exports.update = function(uid_, tocken_, owner_, callback_) {

  var date = Date.now();
  var obj = {
      devicetoken: tocken_
    , deviceowner: owner_
    , editat: date
    , editby: uid_
    };

  // 如果存在，则更新，不存在则创建
  apn.find({devicetoken: tocken_}, function(err, result){
    if (err) {
      return callback_(new errors.InternalServer(err), result);
    }

    // 更新
    if (result && result.length > 0) {
      return apn.update(result[0]._id, obj, function(err, result){
        err = err ? new errors.InternalServer(err) : null;
        callback_(err, result);
      });
    }

    // 创建
    obj.createat = date;
    obj.createby = uid_;
    return apn.create(obj, function(err, result){
      err = err ? new errors.InternalServer(err) : null;
      callback_(err, result);
    });
  });

};

exports.find = function(owner_, callback_) {

  apn.find({deviceowner: owner_}, function(err, result){
    err = err ? new errors.InternalServer(err) : null;
    callback_(err, result);
  });
};

exports.remove = function(owner_, callback_) {

  apn.remove(owner_, function(err, result){
    err = err ? new errors.InternalServer(err) : null;
    callback_(err, result);
  });
};
