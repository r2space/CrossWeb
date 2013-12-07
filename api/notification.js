var amqp = smart.framework.amqp
  , util = smart.framework.util
  , response = smart.framework.response
  , notification = require('../controllers/ctrl_notification');



exports.read = function(req, res) {

  var nids = req.body.nids;
  var uids = req.body.uids || [req.session.user._id];
  

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


exports.getList = function(req, res) {

  var param = {
    "start":req.query.start ,
    "limit":req.query.limit ,
    "type":req.query.type ,
    "uid": req.query.uid || req.session.user._id
  };

  notification.getList(param, function(err, result){
    return response.send(res, err, result);
  });
};

exports.getUnreadList = function(req, res) {

  var param = {
    "start":req.query.start ,
    "limit":req.query.limit ,
    "type":req.query.type ,
    "uid": req.query.uid || req.session.user._id ,
    "unread":true
  };

  notification.getList(param, function(err, result){
    return response.send(res, err, result);
  });
};