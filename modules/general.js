var mongo = smart.util.mongoose
  , conn = smart.framework.connection
  , log = smart.framework.log
  , tools = smart.framework.util
  , schema = mongo.Schema;

function model(code) {
  return conn.model(code, 'General', {});
}

exports.select = function(table, field, success) {

  // 创建检索对象
  // target = {uname: 1, email: 1, editby: 1, editat: 1};
  var target = {};
  for (var i = 0; i < field.length; i++) {
    var key = field[i].split('.')[0];
    target[key] = 1;
  }

  log.out("debug", target);
  conn.db.collection(table, function(err, collection){

    collection.find(
        {uid : { $exists : true }}
      , target
      , {limit: 10}
    ).toArray(function(err, result){

      var rows = [], row = {};
      for (var i = 0; i < result.length; i++) {
        tools.unindentJson(null, result[i], row);
        rows.push( row );
      }

      success(rows);
    });
  });

};



