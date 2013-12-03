
var message = require('../api/message');

/**
 * GuidingMessageApi:
 *  Routing requests to the API functions.
 * @param {app} app
 */
exports.guiding = function(app){


  //message
  app.post('/message/create.json', function(req, res){
    message.createMessage(req, res);
  });

  //copy
  app.post('/message/forward.json', function(req, res){
    message.copyMessage(req, res);
  });

  app.get("/message/get.json", function(req, res){
    message.getMessage(req, res);
  });

  app.get('/message/list/box.json', function(req, res){
    message.getMessageBoxList(req, res);
  });

  // topPage.json
  app.get('/message/list/home.json', function(req, res){
    message.getTopPageMessageList(req, res);
  });

  app.get('/message/list/user.json', function(req, res){
    message.getUserHomePageMessageList(req, res);
  });

  app.get('/message/list/group.json', function(req, res){
    message.getGroupHomePageMessageList(req, res);
  });

  // app.delete('/message/delete.json', function(req, res){
  //   message.deleteMessage(req, res);
  // });

  app.get("/message/list/reply.json", function(req, res){
    message.getReplyList(req, res);
  });

  app.get("/message/list/at.json", function(req, res){
    message.getMsgAtList(req, res);
  });

  app.get("/message/list/comment.json", function(req, res){
    message.getMsgCommentList(req, res);
  });

  app.get("/message/list/forward.json", function(req, res){
    message.getForwardList(req, res);
  });

  app.get("/message/list/unread.json", function(req, res){
    message.getMsgUnRead(req, res);
  });

  app.put("/message/like.json", function(req, res){
    message.like(req, res);
  });

  app.put("/message/unlike.json", function(req, res){
    message.unlike(req, res);
  });

};