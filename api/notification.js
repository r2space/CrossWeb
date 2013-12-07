var util = smart.framework.util
  , amqp = smart.framework.amqp
  , conf = smart.util.config
  , response = smart.framework.response
  , notification = require('../controllers/ctrl_notification');



exports.read = function(req, res) {

  var nids = req.body.nids;
  var uids = req.body.uids || [req.session.user._id];
  

  notification.read(nids, uids, function(err, result){
    if (err) {
      return response.send(res, err);
    } else {
      amqp.send(conf.mq.queue_notice, {
          _id: uids
        , code: conf.db.dbname
        , content: "1"
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