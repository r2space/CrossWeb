/**
 * Routes
 * Copyright (c) 2012 Author Name li
 */

var website = require('./website')
  , api     = require('./api');

exports.guidingApi = function(app){
  api.guiding(app);
}

exports.guidingWebsite = function(app){
  website.guiding(app);
}
