
var sync    = smart.util.async
  , _       = smart.util.underscore
  , user    = smart.ctrl.user
  , group   = require("../controllers/ctrl_group");

/**
 * 检索用户
 */
exports.user = function(handler, callback) {

  var params = handler.params;

  var keywords = params.keywords
    , uid      = handler.uid
    , scope    = params.scope || "1";

  sync.parallel({
      user: function(done) {
        var condition = {};
        if(keywords) {
          condition.$or = [
              {"extend.name_zh": new RegExp(keywords.toLowerCase(), "i")}
            , {"extend.letter_zh": new RegExp(keywords.toLowerCase(), "i")}
            ];
        }
        if(scope !== "1") {
          if(_.isEmpty(condition)) {
            condition = {"groups": scope};
          } else {
            condition = {$and: [
              condition,
              {"groups": scope}
            ]};
          }
        }

        handler.addParams("condition", condition);
        handler.addParams("condition", condition);
        handler.addParams("skip", params.start);
        handler.addParams("limit", params.limit);
        handler.addParams("order", "extend.name_zh");

        user.getList(handler, function(err, result) {
          if(err) {
            return callback(err);
          }
          done(null, transUserResult(result).items);
        });
      },
      group: function(done) {
        handler.addParams("uid", uid);
        handler.addParams("keywords", keywords);
        handler.addParams("skip", params.start);
        handler.addParams("limit", params.limit);
        handler.addParams("order", "type name");

        group.getGroupList(handler, function(err, result) {
          if(err) {
            return callback(err);
          }
          done(null, result.items);
        });
      }
    },
    function(err, results){
      callback(err, {items: results});
    });
};

function transUserResult(result) {
  var newResult;

  if(result) {
    if(_.isArray(result)) {
      newResult = [];
      _.each(result, function(el) {
        newResult.push(transUserResult(el));
      });
    } else if(result.items) {
      newResult = [];
      _.each(result.items, function(el) {
        newResult.push(transUserResult(el));
      });
      result.items = newResult;
      newResult = result;
    } else {
      newResult = {};
      newResult._id = result._id.toString();
      newResult.name = {
        name_zh: result.extend.name_zh
        , letter_zh: result.extend.letter_zh
      };
      newResult.photo = result.extend.photo;
    }
  } else {
    newResult = result;
  }

  return newResult;
}
