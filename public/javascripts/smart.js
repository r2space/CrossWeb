
// namespace
var smart = {
  
  // The global setting
  init: function() {
    _.templateSettings = {
      interpolate : /\{\{(.+?)\}\}/gim,
      evaluate: /\<\$(.+?)\$\>/gim
    };
  }(),
  datailImageLoader:function (){
      var imgs = $("[data-img]");
      var urlArray = [];
      var countImg = 0;
      imgs.each(function(i,img){
        urlArray.push($(img).attr("data-img"));
      });
      $.imageloader({
          urls: urlArray,

          smoothing: true,

          onComplete: function(images){
              $('#complete-icon').animate({opacity:1}, 600);
          },

          onUpdate: function(ratio, image){
              if(image){
                  
                  $("[data-img='"+image+"']").delay(countImg * 50).animate({opacity: 1}, 1000);
                  $("[data-img='"+image+"']").attr("src", image );

                  countImg++;
              }
          },

          onError: function(err){
              console.log(err);
          }
      });
  },
  imageLoader:function (){
      var imgs = $("[data-img]");
      var urlArray = [];
      var countImg = 0;
      imgs.each(function(i,img){
        urlArray.push($(img).attr("data-img"));
      });
      $.imageloader({
          urls: urlArray,

          smoothing: true,

          onComplete: function(images){
              $('#complete-icon').animate({opacity:1}, 600);
          },

          onUpdate: function(ratio, image){
              if(image){
                  
                  $("[data-img='"+image+"']").delay(countImg * 50).animate({opacity: 1}, 1000);
                  $("[data-img='"+image+"']").css("width","155px");
                  //$("[data-img='"+image+"']").css("height","155px");  
                  $("[data-img='"+image+"']").attr("src", image );

                  countImg++;
              }
          },

          onError: function(err){
              console.log(err);
          }
      });
  },
  /**
   * Create this closure to contain the cached models
   */
  model: function() {
    
    // Internal model cache.
    var models = {};
    
    // Create a new model reference scaffold or load an existing model.
    return function(name) {
      
      // If this model has already been created, return it.
      if (models[name]) {
        return models[name];
      }

      // Create a model and save it under this name
      return models[name] = {};
    };
  }(),
  
  /**
   * Create this closure to contain the cached views
   */
  view: function() {

    var views = {};
    
    return function(name) {
      if (views[name]) {
        return views[name];
      }
      return views[name] = {};
    };
  }(),
  
  /**
   * 获取CSRF Token
   */
  csrf: function() {
    return encodeURIComponent($("#_csrf").val());
  },

  uid: function() {
    return $("#userid").val();
  },

  /**
   * 转换换行符为HTML的<br />
   */
  mutiLineHTML: function(src) {
    // if (src) {
    //   return src.split(/\r\n|\r|\n/).join("<br />");
    // }
    return src;
  },

  date: function(date) {
    var timezone = $("#timezone").val();
    var time = Date.parse(date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    time += new Date().getTimezoneOffset() * 60 * 1000;
    time += timezone.substring(3,6) * 3600 * 1000;
    // 2013/04/18 08:00(+0800)
    return new Date(time).Format("yyyy/MM/dd hh:mm") + "(" + timezone.substring(3,9) + ")";
    //return new Date(time).toLocaleString() + $.datepicker.formatDate('yy/mm/dd h:mm', new Date(time)) 
  },

  /**
   * 显示发送私信的框
   */
  sendPrivateMessage: function(uid, success) {

    var msgbox = $("#_privatemsg")
      , sendbutton = $("#_privatemsg_send");
    if (msgbox) {

      sendbutton.bind("click", function(){
		    var u = uid
          , m = $('#_privatemsg_txt').val();
        smart.send(u, m, function() {
          msgbox.modal('hide');
          sendbutton.unbind('click');
          if(success){success();}
        });
      });

      msgbox.modal('show');
    }
  },

  /**
   * 发送私信
   */
  send: function(userid, message, callback) {
    if (!userid || !message) {
      return false;
    }

    var self = this;
    $.ajax({
        url: "/shortmail/creat.json?_csrf=" + self.csrf()
      , async: false
      , type: "POST"
      , data: {
        "_id": userid, "message": message
      }
      , success: function(data, type) {
        if (callback) { callback(null, data); }
      }
      , error: function(jqXHR, textStatus, errorThrown) {
        if (callback) { callback(errorThrown); }
      }
    });
  },


  sendNotification: function(userid, content, type) {
    if (!userid || !content) {
      return false;
    }

    var self = this;
    $.ajax({
        url: "/message/notification.json?_csrf=" + self.csrf()
      , async: false
      , type: "POST"
      , data: {
        "_id": userid, "content": content, "type": type
      }
    });
  },

  /*
  ******************************
  *      注意
  ******************************
  * html中的...缩略显示推荐使用text-overflow属性实现
  */
  cutString: function(str, len) {
    //length属性读出来的汉字长度为1
    if(str.length*2 <= len) {
      return str;
    }
    var strlen = 0;
    var s = "";
    for(var i = 0;i < str.length; i++) {
      s = s + str.charAt(i);
      if (str.charCodeAt(i) > 128) {
        strlen = strlen + 2;
        if(strlen > len){
          return s.substring(0,s.length-1) + "...";
        }
      } else {
        strlen = strlen + 1;
        if(strlen > len){
          return s.substring(0,s.length-2) + "...";
        }
      }
    }
    return s;
  },

  dopostData: function(url_, data_, callback_) {

    data_.append("uid", this.uid());

    var self = this;
    $.ajax({
        url: url_ + "?_csrf=" + self.csrf()
      , type: "POST"
      , async: false
      , data: data_
      , dataType: "json"
      , contentType: false
      , processData: false
      , success: function(result) {
          if (result.error) {
            callback_(1, result.error);
          } else {
            callback_(0, result);
          }
        }
      , error: function(err) {
          callback_(1, err);
        }
    });
  },

  dopost: function(url_, obj_, callback_) {
    obj_["uid"] = this.uid();
    var self = this;
    $.ajax({
        url: url_ + "?_csrf=" + self.csrf()
      , type: "POST"
      , async: false
      , data: JSON.stringify(obj_)
      , dataType: "json"
      , contentType: "application/json"
      , processData: false
      , success: function(result) {
          if (result.error) {
            callback_(1, result.error);
          } else {
            callback_(0, result);
          }
        }
      , error: function(err) {
          callback_(1, err);
        }
    });
  },

  doput: function(url_, data_, callback_) {
    var self = this;
    $.ajax({
        url: url_ + "?_csrf=" + self.csrf()
      , type: "PUT"
      , async: false
      , data: data_
      , success: function(result) {
          callback_(result.error, result.data);
        }
      , error: function(err) {
        callback_(err);
      }
    });
  },

  dodelete: function(url_, data_, callback_) {
    var self = this;
    $.ajax({
        url: url_ + "?_csrf=" + self.csrf()
      , type: "DELETE"
      , async: false
      , data: data_
      , dataType: "json"
      , contentType: false
      , processData: false
      , success: function(result) {
          callback_(result.error, result.data);
        }
      , error: function(err) { 
        callback_(err);
      }
    });
  },

  doget: function(url_, callback_) {
    $.ajax({
        type: "GET"
      , url: url_
      , dataType: "json"
      , success: function(result) {
          callback_(result.error, result.data);
        }
      , error: function(err) {
        callback_(err);
      }
    });
  },

  /**
   * 通过HTML5的FileAPI，实现本地照片文件的预览
   */
  localPreview: function(file, img, callback_) {
    if (!file.type.match("image.*")) {
      return;
    }

    var reader = new FileReader();
    reader.onload = function (event) {
      img.attr("src", event.target.result);
      if(callback_)
        callback_();
    };
    reader.readAsDataURL(file);
  },

  pagination: function(total, limit, curpage, containerid, pagefunc) {
    if(total > limit){
      var pageContainer = $("#"+containerid)
        , pageTmpl = $('#page-template').html();

      pageContainer.show();
      pageContainer.html("<ul></ul>");
      pageContainer = pageContainer.children();

      pageContainer.append(_.template(pageTmpl, {
          "classname": curpage == 1 ? "prev disabled" : "prev"
        , "page": curpage - 1
        , "content":i18n["fulltextsearch.html.label.uppage"]
        , "dis":"block"
      }));
      
      var i;
      var pageSizee = 0;
      for(i = 1; i * limit < total + limit; i++){
        pageSizee = i;
      }
      i = 1;
      for(i = 1; i * limit < total + limit; i++){
        // console.log("i:"+i+"pageSizee:"+pageSizee+"curpage:"+curpage);
        if(i==1
          || i == pageSizee
          || i == parseInt(curpage)
          || i == (parseInt(curpage) + 3)
          || i == (parseInt(curpage) + 2)
          || i == (parseInt(curpage) + 1)
          || i == (parseInt(curpage) - 1)
          || i == (parseInt(curpage) - 2)
          || i == (parseInt(curpage) - 3)
          ){
              if(i==1 || i == parseInt(curpage) || i == pageSizee
                || i == (parseInt(curpage) + 2)
                || i == (parseInt(curpage) + 1)
                || i == (parseInt(curpage) - 1)
                || i == (parseInt(curpage) - 2)
                ) {
                    pageContainer.append(_.template(pageTmpl, {
                      "classname": curpage == i ? "active" : ""
                    , "page": i
                    , "content":i
                    , "dis":"block"
                    }));
                  } else {
                    pageContainer.append(_.template(pageTmpl, {
                      "classname": curpage == i ? "active" : ""
                    , "page": i
                    , "content":"..."
                    , "dis":"block"
                    }));
                  }
          
        } else {
          pageContainer.append(_.template(pageTmpl, {
            "classname": curpage == i ? "active" : ""
          , "page": i
          , "content":i
          , "dis":"none"
          }));
        }

      }
      i-=1;

      pageContainer.append(_.template(pageTmpl, {
          "classname": curpage == i ? "next disabled" : "next"
        , "page": curpage == i ? 0 : parseInt(curpage) + 1
        , "content":i18n["fulltextsearch.html.label.downpage"]
        , "dis":"block"
      }));

      $("#"+containerid+" a").on("click", function(){
        var pagenum = $(event.target).attr("id").split("_")[1];
        if(pagenum > 0){
          pagefunc(pagenum);
        }
      });
    } else {
      $("#"+containerid).html("");
    }
    $(document).scrollTop(1);
  },

  /**
   * 显示消息框
   *  type: 消息类型 error, warning, success, information
   *  destory: 自动销毁的时间, 单位为秒, 指定的值<=0则不自动销毁
   *  position: 消息框出现的位置, 没设定则显示在画面中间
   */
  show: function(type, title, message, destroy, position) {
    Alertify.log.success(message);
    
    var tmpl = $("#alert-template").html();

    // // 显示消息框
    // $(document.body).append(_.template(tmpl, {
    //     "type": type
    //   , "title": title
    //   , "message": message
    // }));

    // // 确定位置
    // var msgbody = $("#_alert")
    //   , x = position ? position.x : ($(document).width() - msgbody.width()) / 2
    //   , y = position ? position.y : 5;
    // msgbody.css("top", y);
    // msgbody.css("left", x);

    // // 绑定
    // $("#_alert button").on("click", function(){
    //   msgbody.remove();
    // });

    // // 自动销毁
    // if (destroy > 0) {
    //   setTimeout(function(){ if (msgbody) { msgbody.remove(); } }, destroy * 1000);
    // }
  },

  // 尝试使用浏览器的通知功能
  notify: function(title, message) {
    var nc = window.webkitNotifications;
    if (!nc) {
      console.log("Notifications are not supported for this Browser/OS version yet.");
      return;
    }

    if (nc.checkPermission() == 1) {// 1 = Not Allowed, 2 = Denied, 0 = Allowed
      nc.requestPermission(function() {
        //得到授权之后的回调方法
        smart.showNotify(title, options);
      });

    } else if(nc.checkPermission() == 0) {
       // Parameters: string URL_TO_IMAGE, string Title, string Body
      var notif = nc.createNotification(null, title, message);
      notif.show();

    } else if(nc.checkPermission() == 2) {
      console.log('denied notification');
      return;
    }
  }

};

jQuery(function($) {
  var m, v;

  // 导航栏
  var MenuView, MenuModel;
  MenuView = smart.view("menu").View;
  MenuModel = smart.model("menu").Model;
  if (MenuView && MenuModel) {
    m = new MenuModel({_csrf: $("#_csrf").val()});
    v = new MenuView({model: m});
  }

  // 检索
  var SearcherView, SearcherModel;
  SearcherView = smart.view("searcher").View;
  SearcherModel = smart.model("searcher").Model;
  if (SearcherView && SearcherModel) {
    m = new SearcherModel({_csrf: $("#_csrf").val()});
    v = new SearcherView({model: m});
  }

  // 侧菜单
  var SidemenuView, SidemenuModel;
  SidemenuView = smart.view("sidemenu").View;
  SidemenuModel = smart.model("sidemenu").Model;
  if (SidemenuView && SidemenuModel) {
    m = new SidemenuModel({"_csrf": smart.csrf()});
    v = new SidemenuView({"model": m});
    m.fetch({"name": $("#bright").val()});
    window.sidemenu = {"model":m, "view":v};
  }

  // 用户选择
  var FinderView, FinderModel;
  FinderView = smart.view("finder").View;
  FinderModel = smart.model("finder").Model;
  if (FinderView && FinderModel) {
    m = new FinderModel();
    v = new FinderView({model: m});
    window.finder = {model:m, view:v};
  }
  
});

Date.prototype.Format = function (fmt) { //author: meizz 
  var o = {
      "M+": this.getMonth() + 1, //月份 
      "d+": this.getDate(), //日 
      "h+": this.getHours(), //小时 
      "m+": this.getMinutes(), //分 
      "s+": this.getSeconds(), //秒 
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
      "S": this.getMilliseconds() //毫秒 
  };
    
  if (/(y+)/.test(fmt)) 
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) 
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  
  return fmt;
}

