/**
 * API Search
 * Copyright (c) 2012 Author Name l_li
 */

var context  = smart.framework.context
  , response = smart.framework.response
  , search   = require("../controllers/ctrl_search");

// /api/search/user.json
exports.user = function(req, res) {

  var handler = new context().bind(req, res);

  search.user(handler, function(err, result){
    if (err) {
      return response.send(res, err);
    } else {
      return response.send(res, err, result);
    }
  });
}

