var shortmail = require('../controllers/ctrl_shortmail')
  , amqp = lib.core.amqp
  , json = lib.core.json;

/**
 * 发送私有信
 */
exports.sendPrivateMessage = function(req_, res_) {

  // TODO: 更改变量名 body._id -> to
  var mail = {
      to: req_.body._id
    , message: req_.body.message
    , by: req_.session.user._id
    };

  // 将消息保存到数据库中
  shortmail.create(mail, function(err, result){

    if (err) {
      return res_.send(json.errorSchema(err.code, err.message));
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

      return res_.send(json.dataSchema(result));
    }
  });
};

/**
 * 获取未读的私信
 */
exports.getUnreadList = function(req_, res_) {

  var uid = req_.session.user._id;

  shortmail.unread(uid, function(err, result){
    if (err) {
      return res_.send(json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

exports.getMailUser = function(req_, res_) {

  var _id = req_.session.user._id;
  shortmail.getMailUser(_id, function(err, result){
    if (err) {
      return res_.send(json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema({items: result}));
    }
  });
};

exports.getContacts = function(req_, res_) {
  var uid = req_.session.user._id
    , firstLetter  = req_.query.firstLetter
    , start = req_.query.start
    , limit = req_.query.count;

  shortmail.getContacts(uid, firstLetter, start, limit, function(err, result){
    if (err) {
      res_.send({msg: 'bad request exception'});
    } else {
      res_.send(json.dataSchema({items: result}));
    }
  });

};

exports.getMailList = function(req_, res_) {

  var contact = req_.query.contact
    , date = req_.query.date
    , count = req_.query.date;

  shortmail.getMailList(contact, date, count, function(err, result){
    if (err) {
      return res_.send(json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema({"items": result}));
    }
  });


  // var _id = req_.session.user._id;
  // var uid = req_.query.uid
  //   , type = req_.query.type
  //   , date = req_.query.date;

  // if (type === "earlier") {
  //   shortmail.getEarlierMails(_id, uid, date, function(err, result){
  //     if (err) {
  //       return res_.send(json.errorSchema(err.code, err.message));
  //     } else {
  //       return res_.send(json.dataSchema({"items": result}));
  //     }
  //   });

  // } else {
  //   shortmail.getMailList(_id, uid, function(err, result){
  //     if (err) {
  //       return res_.send(json.errorSchema(err.code, err.message));
  //     } else {
  //       return res_.send(json.dataSchema({"items": result}));
  //     }
  //   });
  // }
};

exports.getEarlierMails = function(req_, res_){
  var _id = req_.session.user._id
    , _uid = req_.query.uid
    , _date = req_.query.date;

  shortmail.getEarlierMails(_id, _uid, _date, function(err, result){
    if (err) {
      res_.send({msg: 'bad request exception'});
    } else {
      res_.send(json.dataSchema({items: result}));
    }
  });
};

