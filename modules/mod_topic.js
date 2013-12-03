
var mongo = require('mongoose')
  , util = require('util')
  , conn = require('./connection')
  , schema = mongo.Schema
  , ObjectId = schema.ObjectId;

var Topic = new schema({
    title: {type: String}
  , abstract: {type: String}
  , content: {type: String}
  , attach: {
      file: {type: []}
    , document: {type: String}
    , message: {type: String}
    , poll: {type: String}
    , event: {type: String}
    , question: {type: String}
    , link: {type: String}
  }
  , member: [String]
  , keyword: [String]
  , status: {type: Number}
  , category: {type: Number}
  , createby: {type: String}
  , createat: {type: Date}
  , editby: {type: String}
  , editat: {type: Date}
});

function model() {
  return conn().model('Topic', Topic);
}


exports.create = function(topicObj_, callback_){
  var topic = model();
  var t = new topic(topicObj_);

  t.save(function(err, ret){
    callback_(err, ret);
  });
};

exports.at = function(tid_, callback_){
  var topic = model();

  topic.findById(tid_, function(err, ret){
    callback_(err, ret);
  });
};

exports.find = function(options_, callback_){
  var topic = model();

  topic.find(options_, function(err, ret){
    callback_(err, ret);
  });
};

exports.delete = function(tid_, callback_){
  var topic = model();

  topic.findByIdAndRemove(tid_, function(err, ret){
    callback_(err, ret);
  });
};

exports.update = function(tid_, updateObj_, callback_){
  var topic = model();

  topic.findByIdAndUpdate(tid_, updateObj_, function(err, ret){
    callback_(err, ret);
  });
};

exports.list = function(uid_, firstLetter_, start_, count_, callback_){
  var topic = model();
  start_ = start_ > 0 ? start_ : 1;  //default value is 0
  firstLetter_ = firstLetter_ ? firstLetter_ : "";
  var reg = new RegExp("^" + firstLetter_.toLowerCase() + ".*$", "i");

  var fieldObj = {"title": reg};
  var optionObj = {"sort": {"title": "asc"}, "skip": start_-1};

  if(uid_){
    fieldObj["createby"] = uid_;
  }
  if(count_){
    optionObj["limit"] = count_;
  }

  topic.find(fieldObj).setOptions(optionObj).exec(function(err, topicList){
    callback_(err, topicList);
  });
};