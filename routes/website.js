
var context  = smart.framework.context
  , ctrlGroup = require("../controllers/ctrl_group")
  , ctrlMessage = require("../controllers/ctrl_message");

/**
 * GuidingWebsite:
 *  Routing requests to the Web site page.
 * @param {app} app
 */
exports.guiding = function(app){
  
  app.get('/', function(req, res){
    if (req.session.user) {
      res.render('message', {
          title: __("navbar.menu.message")
        , user: req.session.user
        , bright: "home"
      });
      
    } else {
      res.render("login", {"title": "login"});
    }
  });



  // 显示Login画面
  app.get('/login', function(req, res){
    res.render("login", {"title": "login"});
  });

  // 注册
  app.get('/register', function(req, res){
    res.render('register', {title: '注册'});
  });

  // 确认注册
  app.get("/register/complete", function(req, res){

    var email = req.query.email
      , emailtoken = req.query.emailtoken;

    res.render('registercomplete', {
        "title": '确认注册'
      , "email": email
      , "emailtoken": emailtoken
    });
  });


  // 文书一览
  app.get('/files', function(req, res){
    res.render('files', {
        title: __("navbar.menu.file")
      , user: req.session.user
      , bright: "files"
    });
  });
  app.get('/file/:id', function(req, res){
    res.render('filedetail', {
        title: __("window.title.fileDetail")
      , user: req.session.user
      , fileid: req.params.id
      , bright: "files"
    });
  });

  app.get('/notice/:type', function(req, res){
    res.render('messageList', { 
        title: __("navbar.menu.notification")
      , user: req.session.user
      , bright: "notice"
      , type:req.params.type
    });
  });

  // 资料库
  app.get('/library', function(req, res){
    res.render('library', {
        title: '资料库'
      , user: req.session.user
      , bright: "library"
    });
  });

  // 笔记
  app.get('/note', function(req, res){
    res.render('note', {
        title: '笔记'
      , user: req.session.user
      , bright: "note"
    });
  });

  // 消息一览
  app.get('/message', function(req, res){
    res.render('message', {
        title: __("navbar.menu.message")
      , user: req.session.user
      , bright: "home"
    });
  });
  app.get('/message/:id', function(req, res){
    res.render('messagedetail', {
        title: __("window.title.messageDetail")
      , user: req.session.user
      , bright: "home"
    });
  });

  // 搜索
  app.get('/fulltextsearch/result', function(req, res){

    res.render('fulltextsearch', {
        "title": __("window.title.fulltextsearch")
      , "user": req.session.user
      , "keywords": req.query.keywords
      , "bright": "fulltextsearch"
    });
  });

  // 组
  app.get('/group', function(req, res){
    res.render('grouplist', {
      title: __("window.title.grouplist")
      , user: req.session.user
      , bright: "group"
    });
  });
  app.get('/groupeditor/:id', function(req, res){

    var handler = new context().bind(req, res);

    ctrlGroup.canEdit(handler, function(err, bool){
      if(!bool){
        res.render("error", {
          title: __("error"), 
          user: req.session.user,
          bright: "group", 
          message:__("error.noauthority.group")
        });
      }else{
        res.render('groupeditor', {
            title: __("window.title.groupeditor")
          , user: req.session.user
          , groupid: req.params.id
          , bright: "group"
        });
      }
    });
  });
  app.get('/group/:id', function(req, res){
    var handler = new context().bind(req, res);

    ctrlGroup.canSee(handler, function(err, bool){
      if(!bool){
        res.render("error", {
          title: __("error"), 
          user: req.session.user,
          bright: "group", 
          message:__("error.noauthority.group")
        });
      }else{
        res.render('group', { 
            title: __("window.title.group")
          , user: req.session.user
          , groupid: req.params.id
          , bright: "group"
        });
      }
    });
  });

  // 话题
  app.get('/topiclist', function(req, res){
    res.render('topiclist', { 
        title: '话题一览'
      , user: req.session.user
      , bright: "topic"
    });
  });
  app.get('/topic/:id', function(req, res){
    res.render('topic', { 
        title: '话题主页'
      , user: req.session.user
      , bright: "topic"
    });
  });

  // 人
  app.get('/user', function(req, res){
    res.render('userlist', { 
        title: __("user.label.title")
      , user: req.session.user
      , bright: "user"
    });
  });
  app.get('/user/:id', function(req, res){
    res.render('user', { 
        title: __("window.title.user")
      , user: req.session.user
      , uid: req.params.id
      , bright: "user"
    });
  });

  app.get('/usereditor', function(req, res){
    res.render('usereditor', { 
        title: __("window.title.usereditor")
      , user: req.session.user
      , bright: "user"
    });
  });

  app.get('/shortmail', function(req, res){
    res.render('shortmail', { 
        "title": __("navbar.menu.shortmail")
      , "user": req.session.user
      , "uid": ""
      , "bright": "shortmail"
    });
  });

  // app.get('/shortmail/:id', function(req, res){
  //   res.render('shortmail', { 
  //       title: i18n.__("navbar.menu.shortmail")
  //     , user: req.session.user
  //     , uid: req.params.id
  //     , bright: "shortmail"
  //   });
  // });

  //notice
  app.get('/notice', function(req, res){
    res.redirect('/notice/comment');
  });

  // document
  app.get('/tmpl', function(req, res){
    
    var _docid = "", _tmplid = "";
    
    if (req.query.docid) {
      _docid = req.query.docid;
    }
    
    if (req.query.tmplid) {
      _tmplid = req.query.tmplid;
    }
    
    res.render('tmpl', { title: 'Express', docid: _docid, tmplid: _tmplid });
  });

  app.get('/doc', function(req, res){
    
    var _docid = "", _tmplid = "";
    
    if (req.query.docid) {
      _docid = req.query.docid;
    }
    
    if (req.query.tmplid) {
      _tmplid = req.query.tmplid;
    }
    
    res.render('doc', { title: 'Express', docid: _docid, tmplid: _tmplid });
  });

  app.get('/sample/i18n', function(req, res){
    res.render('sample/i18n', { title: 'Express' });
  });
  app.get('/sample/dnd', function(req, res){
    res.render('sample/dnd', { title: 'Express' });
  });
  app.get('/sample/jcrop', function(req, res){
    res.render('sample/jcrop', { title: 'Express' });
  });

};
