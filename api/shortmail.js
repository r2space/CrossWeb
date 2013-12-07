var shortmail = require('../controllers/ctrl_shortmail')
  , amqp = smart.framework.amqp
  , response = smart.framework.response;

/**
 * 发送私有信
 */
exports.sendPrivateMessage = function(req, res) {

  // TODO: 更改变量名 body._id -> to
  var mail = {
      to: req.body._id
    , message: req.body.message
    , by: req.session.user._id
    };

  // 将消息保存到数据库中
  shortmail.create(mail, function(err, result){

    if (err) {
      return response.send(res, err);
    } else {

      // 保存成功发送消息
      // amqp.notice({
      //     _id: mail.to
      //   , msg: mail.message
      //   });
      amqp.sendApn({
          target: mail.to
        , body: mail.message
        });
      console.log(mail.message);

      return response.send(res, err, result);
    }
  });
};

/**
 * 获取未读的私信
 */
exports.getUnreadList = function(req, res) {

  var uid = req.session.user._id;

  shortmail.unread(uid, function(err, result){
    if (err) {
      return response.send(res, err);
    } else {
      return response.send(res, err, result);
    }
  });
};

exports.getMailUser = function(req, res) {

  var _id = req.session.user._id;
  shortmail.getMailUser(_id, function(err, result){
    if (err) {
      return response.send(res, err);
    } else {
      return response.send(res, err, {items: result});
    }
  });
};

exports.getContacts = function(req, res) {
  var uid = req.session.user._id
    , firstLetter  = req.query.firstLetter
    , start = req.query.start
    , limit = req.query.count;

  shortmail.getContacts(uid, firstLetter, start, limit, function(err, result){
    if (err) {
      return response.send(res, err);
    } else {
      return response.send(res, err, {items: result});
    }
  });

};

exports.getMailList = function(req, res) {

  var contact = req.query.contact
    , date = req.query.date
    , count = req.query.date;

  shortmail.getMailList(contact, date, count, function(err, result){
    if (err) {
      return response.send(res, err);
    } else {
      return response.send(res, err, {items: result});
    }
  });


  // var _id = req.session.user._id;
  // var uid = req.query.uid
  //   , type = req.query.type
  //   , date = req.query.date;

  // if (type === "earlier") {
  //   shortmail.getEarlierMails(_id, uid, date, function(err, result){
  //     if (err) {
  //       return res.send(json.errorSchema(err.code, err.message));
  //     } else {
  //       return res.send(json.dataSchema({"items": result}));
  //     }
  //   });

  // } else {
  //   shortmail.getMailList(_id, uid, function(err, result){
  //     if (err) {
  //       return res.send(json.errorSchema(err.code, err.message));
  //     } else {
  //       return res.send(json.dataSchema({"items": result}));
  //     }
  //   });
  // }
};

exports.getEarlierMails = function(req, res){
  var _id = req.session.user._id
    , _uid = req.query.uid
    , _date = req.query.date;

  shortmail.getEarlierMails(_id, _uid, _date, function(err, result){
    if (err) {
      return response.send(res, err);
    } else {
      return response.send(res, err, {items: result});
    }
  });
};

