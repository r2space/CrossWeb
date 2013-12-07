/**
 * API APNs
 * Copyright (c) 2012 Author Name dd_dai
 */

var response = smart.framework.response
  , apn = require("../controllers/ctrl_apn");
  
/**
 * 更新设备的token
 */
exports.update = function (req, res) {

  var uid = req.session.user._id
    , tocken = req.body.devicetoken
    , owner = req.body.deviceowner;

  apn.update(uid, tocken, owner, function(err, result){
    if (err) {
      return response.send(res, err);
    } else {
      return response.send(res, err, {items: result});
    }
  });
};

/**
 * 获取设备的token
 */
exports.find = function (req, res) {

  apn.find(req.query.deviceowner, function(err, result){
    if (err) {
      return response.send(res, err);
    } else {
      return response.send(res, err, {items: result});
    }
  });
};

exports.clear = function (req, res) {

  apn.remove(req.body.devicetoken, function(err, result){
    if (err) {
      return response.send(res, err);
    } else {
      return response.send(res, err, {items: result});
    }
  });
};
