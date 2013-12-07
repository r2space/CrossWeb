
var sidemenu      = require('../api/sidemenu')
  , file          = require('../api/file')
  , notification  = require('../api/notification')
  , apn           = require('../api/apn')
  , shortmail     = require('../api/shortmail');

var groupapi      = require('./api_group')  
  , fileapi       = require('./api_file')  
  , userapi       = require('./api_user')
  , messageapi    = require('./api_message');

/**
 * GuidingApi:
 *  Routing requests to the API functions.
 * @param {app} app
 */
exports.guiding = function(app){

  userapi.guiding(app);
  groupapi.guiding(app);
  messageapi.guiding(app);
  fileapi.guiding(app);

  // sidemenu
  app.get('/sidemenu.json', function(req, res){
    sidemenu.list(req, res);
  });

  // 获取图片  
  app.get('/picture/:id', function(req, res){
    file.image(req, res);
  });
  
//  // ---- search ----
//  app.get('/search/quick.json', function(req, res){
//    smartapi.search.quick(req, res);
//  });
//
//  app.get('/search/full.json', function(req, res){
//    smartapi.search.full(req, res);
//  });
//
//  app.get('/search/user.json', function(req, res){
//    smartapi.search.user(req, res);
//  });

  // ---- 私信 ----
  // 发送私信
  app.post("/shortmail/creat.json", function(req, res){
    shortmail.sendPrivateMessage(req, res);
  });

  // 未读私信一览
  app.get("/shortmail/list/unread.json", function(req, res){
    shortmail.getUnreadList(req, res);
  });

  // 私信用户一览
  app.get("/shortmail/users.json", function(req, res){
    shortmail.getMailUser(req, res);
  });

  // 私信一览
  app.get("/shortmail/story.json", function(req, res){
    shortmail.getMailList(req, res);
  });

  // 私信联络人一览
  app.get("/shortmail/list/contact.json", function(req, res){
    shortmail.getContacts(req, res);
  });

  // ---- 通知 ----
  // 通知一览
  app.get("/notification/list/unread.json", function(req, res){
    notification.getUnreadList(req, res);
  });

  // 通知一览
  app.get("/notification/list.json", function(req, res){
    notification.getList(req, res);
  });

  // 更新已读状态
  app.put("/notification/read.json", function(req, res){
    notification.read(req, res);
  });
  
    // 更新APNs的设备号
  app.put("/notification/addtoken.json", function(req, res){
    apn.update(req, res);
  });
  
  app.get("/notification/gettoken.json", function(req, res){
    apn.find(req, res);
  });

  app.put("/notification/cleartoken.json", function(req, res){
    apn.clear(req, res);
  });

};

