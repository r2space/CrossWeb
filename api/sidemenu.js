/**
 * API Document
 * Copyright (c) 2012 Author Name jg_wang
 */

var util = require('util')
  , i18n = require('i18n')
  , log  = lib.core.log
  , json = lib.core.json
  , sidemenu = require("../controllers/ctrl_sidemenu");

/**
 * 侧边栏
 */
exports.list = function(req_, res_) {

  var name = req_.query.name
    , uid  = req_.session.user._id;

console.log(name);
  if (name === "user") {
    sidemenu.user(uid, function(err, result){
      return json.send(res_, err, result);
    });
  }

  if (name === "group") {
    sidemenu.group(uid, function(err, result){
      return json.send(res_, err, result);
    });
  }

  if (name === "messages" || name === "home") {
    sidemenu.message(uid, function(err, result){
      return json.send(res_, err, result);
    });
  }

  if (name === "shortmail") {
    sidemenu.shortmail(uid, function(err, result){
      return json.send(res_, err, result);
    });
  }

  if (name == "files") {
    sidemenu.files(uid, function(err, result){
      return json.send(res_, err, result);
    });
  }

  if (name == "topic") {
    return json.send(res_, null, {items: sidemenus[req_.query.name]});
  }

  if (name == "fulltextsearch") {
    sidemenu.fulltextsearch(uid, function(err, result){
      return json.send(res_, err, result);
    });
  }
}

// TODO move these to DB or other place
var sidemenus = {
  fulltextsearch: [
    {
      id:"",
      title:"Filter",
      submenus:[
      {
        id: "",
        title: "user"
      },
      {
        id: "",
        title: "group"
      },
      {
        id: "",
        title: "message"
      },
      {
        id: "",
        title: "file"
      },
      {
        id: "",
        title: "document"
      }
      ]
    }
  ],
  files : [
    {
      id:"allfiles",
      title:"All Files"
    },
    {
      id:"official",
      title:"Official Files"
    },
    {
      id:"templates",
      title:"Templates"
    },
    {
      id:"myfiles",
      title:"My Files",
      submenus:[
      {
        id:"recent",
        title:"最近被修改的"
      },
      {
        id:"following",
        title:"关注的"
      },
      {
        id:"modified",
        title:"由我编辑的"
      },
      {
        id:"attome",
        title:"发送给我的"
      }
      ]
    },
    {
      id:"",
      title:"My Groups",
      submenus:[
      {
        id:"",
        title:"All Company"
      },
      {
        id:"",
        title:"Affiliation"
      }
      ]
    },
    {
      id:"",
      title:"Category",
      submenus:[
      {
        id:"",
        title:"Vacation"
      },
      {
        id:"",
        title:"Expense"
      }
      ]
    }
  ],
  topic : [
    {
      id:"",
      title:"您最近活跃的话题",
      submenus:[
      {
        id:"",
        title:"Topic1"
      },
      {
        id:"",
        title:"Topic2"
      },
      {
        id:"",
        title:"Topic3"
      },
      {
        id:"",
        title:"Topic4"
      },
      {
        id:"",
        title:"Topic5"
      }
      ]
    }
  ]
};

sidemenus.home = sidemenus.messages;

