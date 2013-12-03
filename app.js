/**
 * Module dependencies.
 */

"use strict";

GLOBAL.smart = require("smartcore");
GLOBAL.lib = require("../SmartCore"); // TODO 暂时引用外层的smartcore

var http        = smart.lang.http
  , express     = smart.util.express
  , middleware  = smart.framework.middleware
  , loader      = smart.framework.loader
  , log         = smart.framework.log
  , routes      = require("./routes");

var app = express();

/**
 * 初始化smartcore模块
 */
loader.initialize();

/**
 * 初始化express模块
 */
loader.express(app);

app.use(middleware.lang);         // 设定语言
app.use(middleware.authenticate); // 认证
app.use(middleware.csrftoken);    // 生成CsrfToken
app.use(middleware.timeout);      // 设定超时

routes.guidingApi( app );
routes.guidingWebsite( app );

app.use(middleware.parseError);

/**
 * 启动服务
 */
var server = http.createServer(app).listen(app.get("port"), function(){
  log.info("Express server listening on port " + app.get("port"));
});
