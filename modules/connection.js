
/**
 *
 */
var mongo = require('mongoose')
  , util = require('util')
  , log = lib.core.log
  , dbconf = process.env['TEST'] ? require('config').testdb : require('config').db;

/**
 * Mongodb连接实例
 */
var __connection;


module.exports = function() {

  // 无连接
  if (!__connection) {
    log.out('info', 'Create a connection');
    return createConnection();
  }

  // 连接被断开
  if (__connection.readyState == 0) {
    log.out('info', 'Re-new the connection');
    return createConnection();
  }

  return __connection;
};

/**
 * 创建一个新的连接
 */
function createConnection() {
  __connection = mongo.createConnection(
    util.format('mongodb://%s:%d/%s', dbconf.host, dbconf.port, dbconf.dbname), {server: {poolSize: dbconf.pool}}
  );

  log.out('info', 'The connection pool size of ' + dbconf.pool);
  return __connection;
}
