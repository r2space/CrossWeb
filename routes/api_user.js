
var log = lib.core.log
  , user = lib.api.user;

/**
 * GuidingUserApi:
 *  Routing requests to the API functions.
 * @param {app} app
 */
exports.guiding = function(app){

  // 登陆（/login与登陆画面的URL重叠，所以API使用/simplelogin）
  app.get('/simplelogin', function(req, res){
    user.login(req, res);
  });

  // 注销
  app.get("/simplelogout", function(req, res){
    user.logout(req, res);
  });

  // 注册
  app.post("/register", function(req, res){
    user.register(req, res);
  });

  // 确认注册
  app.post("/register/confirm", function(req, res){
    user.registerConfirm(req, res);
  });

  //获取用户基础信息
  app.get('/user/get.json', function(req, res){
    user.getUser(req, res);
  });

  //更新用户
  app.put('/user/update.json', function(req, res){
    user.updateUser(req, res);
  });

  //得到所有用户列表
  app.get("/user/list.json", function(req, res){
    console.log(__dirname);
    user.getUserList(req, res);
  });

  //关注某用户
  app.put("/user/follow.json", function(req, res){
    user.follow(req, res);
  });

  //取消关注某用户
  app.put("/user/unfollow.json", function(req, res){
    user.unfollow(req, res);
  });

};

