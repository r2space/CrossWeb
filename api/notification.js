var amqp = smart.util.amqp
  , util = smart.framework.util
  , response = smart.framework.response
  , notification = require('../controllers/ctrl_notification');



exports.read = function(req_, res_) {

  var nids = req_.body.nids;
  var uids = req_.body.uids || [req_.session.user._id];
  

  notification.read(nids, uids, function(err, result){
    if (err) {
      return response.send(res, err);
    } else {
      // console.log("read");
      // console.log(result);
      amqp.notice({
          _id: uids
        , content:"1"
      });

      return response.send(res, err, result);
    }
  });

};


exports.getList = function(req_, res_) {

  var param = {
    "start":req_.query.start ,
    "limit":req_.query.limit ,
    "type":req_.query.type ,
    "uid": req_.query.uid || req_.session.user._id
  };

  notification.getList(param, function(err, result){
    return response.send(res, err, result);
  });
};

exports.getUnreadList = function(req_, res_) {

  var param = {
    "start":req_.query.start ,
    "limit":req_.query.limit ,
    "type":req_.query.type ,
    "uid": req_.query.uid || req_.session.user._id ,
    "unread":true
  };

  notification.getList(param, function(err, result){
    return response.send(res, err, result);
  });
};