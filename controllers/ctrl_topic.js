
var topic = require('../modules/mod_topic');
var util = lib.core.util;
var error = lib.core.errors;
var check = require("validator").check;
var underscore = require("underscore");

exports.getTopic = function(tid_, callback_){
  var date = Date.now();

  if(!tid_){
    return callback_(new error.BadRequest("话题id不能为空"));
  }
  //get one topic by topic id
  topic.at(tid_, function(err, t){
    err = err ? new error.InternalServer(err) : null;
    return callback_(err, t);
  });
};

exports.getTopicList = function(uid_, firstLetter_, start_, count_, callback_){
  start_ = start_ ? start_ : 1;
  count_ = count_ ? count_ : 20;

  if(isNaN(start_)){
    return callback_(new error.BadRequest("开始位置不是数字"));
  }

  if(isNaN(count_)){
    return callback_(new error.BadRequest("获取数量不是数字"));
  }
  //get a topic list, uid_ is the creator id of this topic
  topic.list(uid_, firstLetter_, start_, count_, function(err, t){
    err = err ? new error.InternalServer(err) : null;
    return callback_(err, t);
  })
};

exports.createTopic = function(title_, abstract_, content_, keyword_, category_, status_, creator_, callback_){
  var date = Date.now();

  if(!creator_){
    return callback_(new error.BadRequest("无效的用户"));
  }

  if(!title_){
    return callback_(new error.BadRequest("标题不能为空"));
  }
  //member contains the creator
  var member = [creator_];
  keyword_ = keyword_ ? keyword_.split(",") : [];

  topic.create({
      "title": title_
    , "abstract": abstract_
    , "content": content_
    , "keyword": keyword_
    , "category": category_
    , "status": status_
    , "createby": creator_
    , "createat": date
    , "editby": creator_
    , "editat": date
    , "member": member
  }, function(err, t){
    err = err ? new error.InternalServer(err) : null;
    return callback_(err, t);
  });
};

exports.deleteTopic = function(tid_, callback_){
  if(!tid_){
    return callback_(new error.BadRequest("话题ID不能为空"));
  }

  topic.delete(tid_, function(err, t){
    err = err ? new error.InternalServer(err) : null;
    return callback_(err, t);
  });
};

exports.updateTopic = function(tobj_, callback_){
  var tid = tobj_ ? tobj_._id : "";

  if(!tid){
    return callback_(new error.BadRequest("话题ID不能为空"));
  }

  var updateObj = {}; //contain all the property of tobj_ except _id
  for(var i in tobj_){
    if(i.toString() !== "_id"){
      updateObj[i] = tobj_[i];
    }
  }

  topic.update(tid, updateObj, function(err, t){
    err = err ? new error.InternalServer(err) : null;
    return callback_(err, t);
  });
};

exports.addMember = function(tid_, uids_, userid_, callback_){
	if(!userid_){
    return callback_(new error.BadRequest("无效的用户"));
  }
  if(!tid_){
    return callback_(new error.BadRequest("组织ID不能为空"));
  }

  topic.at(tid_, function(err, t){
    if(err){
      return callback_(new error.InternalServer(err));
    }else{
      if(uids_ === undefined){ //login user want to join this topic
        if(userid_ == t.createby){
          return callback_(new error.BadRequest("当前用户为创建者，请添加其他用户"));
        }else if(underscore.contains(t.member, userid_)){
          return callback_(new error.BadRequest("已经在该组织中了"));
        }else{
          t.member.push(userid_);
          t.save(function(err, result){
            err = err ? new error.InternalServer(err) : null;
            return callback_(err, result);
          });
        }
      }else{ //login user want to add some members to this topic
        uids_ = uids_.split(",");
        if(uids_){
          for(var i = 0; i < uids_.length; i++){
            if(!underscore.contains(t.member, uids_[i])){
              t.member.push(uids_[i]);
            }
          }
          t.save(function(err, result){
            err = err ? new error.InternalServer(err) : null;
            return callback_(err, result);
          });
        }
      }
    }
  });
};

exports.removeMember = function(tid_, uids_, userid_, callback_){
  if(!userid_){
    return callback_(new error.BadRequest("无效的用户"));
  }
  if(!tid_){
    return callback_(new error.BadRequest("组织ID不能为空"));
  }

  topic.at(tid_, function(err, t){
    if(err){
      return callback_(new error.InternalServer(err));
    }else{
      if(uids_ === undefined){ //login user want to leave this topic
        if(userid_ == t.createby){
          return callback_(new error.BadRequest("当前用户为创建者，只能删除组织不能退出组织"));
        }else if(!underscore.contains(t.member, userid_)){
          return callback_(new error.BadRequest("当前用户并未在该组织中"));
        }else{
          t.member = removeOneMember(t.member, userid_, t.createby);
          t.save(function(err, result){
            err = err ? new error.InternalServer(err) : null;
            return callback_(err, result);
          });
        }
      }else{ //login user want to remove some members from this topic
        uids_ = uids_.split(",");
        if(uids_){
          for(var i = 0; i < uids_.length; i++){
            t.member = removeOneMember(t.member, uids_[i], t.createby);
          }

          t.save(function(err, result){
            err = err ? new error.InternalServer(err) : null;
            return callback_(err, result);
          });
        }
      }
    }
  });
};

//***************************private function*********************
//remove one member from topic but can not be the topic creator
function removeOneMember(member, id, creator){ 
  for(var i = 0; i < member.length; i++){
    if(member[i] == id && id != creator){
      member.splice(i, 1);
    }
  }
  return member;
}