var user = require('../modules/mod_user')
  , group = require('../modules/mod_group')
  , message = require('../modules/mod_message')
  , solr = require('../core/solr')
  , async = require("async");


async.waterfall([

  // delete old index
  function(callback) {
  	solr.batchDelete(function(result){
  		callback();
  	});
  },

  // reindex user
  function(callback) {
  	console.log("reindex user");
  	user.find({},function(err,users){
  		async.forEach(users, function(user, cb) {
	      solr.update(user, "user", "insert", function(data){cb(data);});
	    }, function(err) {
	      callback();
	    });
  	});
  },

  // reindex group
  function(callback) {
  	console.log("reindex group");
  	group.find({},function(err,users){
  		async.forEach(users, function(user, cb) {
	      solr.update(user, "group", "insert", function(data){cb(data);});
	    }, function(err) {
	      callback();
	    });
  	});
  },

  // reindex message
  function(callback) {
  	console.log("reindex message");
  	message.find({},function(err,users){
  		async.forEach(users, function(user, cb) {
	      solr.update(user, "message", "insert", function(data){cb(data);});
	    }, function(err) {
	      callback();
	    });
  	});
  }

], function(err) {
});