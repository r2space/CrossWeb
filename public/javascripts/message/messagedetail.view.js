
/**
 * 消息详细
 */
(function(MessageDetail) {

  MessageDetail.View = Backbone.View.extend({

    
    /**
     * 初始化
     */
    initialize: function(options) {

      _.bindAll(this, "render", "follow", "showMessage", "fetchForward", "forward", "reply", "fetchReply", "deleteMessage", "initializeScopeArea");

      var mid = window.location.href.split("/")[4]
        , self = this;

      smart.doget("/message/get.json?mid=" + mid, function(err, message){
        if(err){
          alert(err);
        }else{
          self.message = message;
          self.render();
          self.replyRead(message);
        }
      });

      window.sidemenu.view.onSideMenuClicked = this.sideMenuClicked;
    },

    sideMenuClicked: function(item, type) {

      // 提到我的
      if (type == "notification") {
        window.location = "/notice/" + item;
      }

      // 部门的消息
      if (type == "group") {
        //self.render();
        window.location = "/group/" + item;
      }
      return false;
    },

    replyRead:function(message){

        // $.ajax({url: "/notification/list/unread.json",
        //   success: function(result) {
        //     if(parseInt(result.data.total) == 0)
        //     $("#_notice").html(result.data.total);
        // });

    },

    /**
     * 渲染画面
     */
    render: function() {
      
      var self = this
        , user = self.message.part.createby
        , userPhoto = user.photo
        , photo = userPhoto && userPhoto.big? "/picture/" + userPhoto.big : "/images/user.png"
        , name = user.name.name_zh
        , title = user.title;

      // message
      self.showMessage();

      $("#user_image img").attr("src", photo);
      $("#user_name").html(smart.cutString(name, 10));
      $("#user_title").html(title);
    
      // 如果是自己，显示编辑按钮
      if (user.id === $("#userid").val()) {
        $("#edit_btn").removeClass("hide");
        $("#edit_btn").bind("click", function(){
          window.location.href = "/usereditor";
          return false;
        });
      } else {
        if(_.contains(user.follower, $("#userid").val())){
          $("#unfollow_btn").removeClass("hide");
          $("#follow_btn").addClass("hide");
        } else {
          $("#follow_btn").removeClass("hide");
          $("#unfollow_btn").addClass("hide");
        }

        $("#follow_btn").bind("click", function(){
          self.follow(user.id, "follow", "card", {});
          $("#unfollow_btn").removeClass("hide");
          $("#follow_btn").addClass("hide");
        });
        $("#unfollow_btn").bind("click", function(){
          self.follow(user.id, "unfollow", "card", {});
          $("#follow_btn").removeClass("hide");
          $("#unfollow_btn").addClass("hide");
        });

        $("#send_message_btn").removeClass("hide");
        $("#send_message_btn").bind("click", function(){
          smart.sendPrivateMessage(user.id);
          return false;
        });
      };
    },

    follow: function(uid, func, from, option){
      var self = this
        , url = "/user/" + func + ".json";

      smart.doput(url, {"uid": uid}, function(err, result){
        if(result.error){
          console.log(result); return;
        }
      });
    },

    // ----------------------------- message ------------------------------------------------

    /**
     * 显示用户的消息
     */
    showMessage: function() {

      var self = this
        , msg = self.message
        , tmpl = $('#message-template').html()
        , container = $("#messages-container")
        , uinfo = msg["part"].createby
        , photo = uinfo.photo
        , range = msg["part"].range
        , atusers = msg["part"].atusers
        , atgroups = msg["part"].atgroups
        , contentType = msg["contentType"];

      container.html("");

      photo = photo && photo.big ? "/picture/" + photo.big : "/images/user.png";

      var rangeGroup = i18n["message.list.selector.scope"];
      if(range){
        rangeGroup = " <a href='/group/" + range.id + "' id=" + range.id + " class='userLink'>" + range.name.name_zh + "</a>";
      }

      var at = "";
      if(atusers){
        _.each(atusers,function(user){
          at = at + " <a href='/user/" + user.id + "' id=" + user.id + " class='userLink'>@" + user.name.name_zh + "</a>";
        });
      }
      if(atgroups){
        _.each(atgroups,function(group){
          at = at + " <a href='/group/" + group.id + "' id=" + group.id + " class='userLink'>@" + group.name.name_zh + "</a>";
        });
      }
      if(at.length == 0){
        at = i18n["message.detail.label.nothing"];
      }

      container.append(_.template(tmpl, {
          "mid": msg["_id"]
        , "uid": uinfo.id
        , "uname": uinfo.name.name_zh
        , "time": smart.date(msg["createat"])
        , "uphoto": photo
        , "replyNums": msg["part"].replyNums
        , "forwardNums": msg["part"].forwardNums
        , "content": smart.mutiLineHTML(msg["content"])
        , "range": range ? range.id : "1"
        , "rangeGroup": rangeGroup
        , "atAccounts": at
      }));

      var attaches = msg["attach"];
      if(contentType == "documentBox"){
        attaches = msg["part"].documents;
      }
      self.renderAttach(contentType, msg["_id"], attaches);

      $("#forwardMsg_" + msg["_id"]).on("click", self.fetchForward);
      $("#forwardButton_" + msg["_id"]).on("click", self.forward);
      $("#replyButton_" + msg["_id"]).on("click", self.reply);
      $("#fetchreply_" + msg["_id"]).on("click", self.fetchReply);
      $("#delete_" + msg["_id"]).on("click", self.deleteMessage);
      
      self.fetchReply(msg["_id"]);
    },

    renderAttach: function(contentType, mid, attaches) {
      var self = this;
      var container = $("#attach_container_" + mid);
      // 清除原来的内容
      container.html("");
      
      if(contentType == "imageBox"){
        var tmpl = $('#image-template').html();
        _.each(attaches, function(attach) {
          container.append(_.template(tmpl, {
              "id": attach.fileid
            , "image": "/picture/" + attach.fileid
          }));
        });
      } else if(contentType == "fileBox"){
        var tmpl = $('#doc-template').html();
        _.each(attaches, function(attach) {
          container.append(_.template(tmpl, {
              "id": attach.fileid
            , "name": attach.filename
            , "image": "/images/filetype/"+self.contenttype2extension("",attach.filename)+".png"
          }));
        });
      } else if(contentType == "documentBox"){
        container.html(i18n["navbar.menu.file"]);
        var tmpl = $('#document-template').html();
        _.each(attaches, function(attach) {
          var fid = attach._id
            , isowner = attach.owner == smart.uid()
            , isfollower = _.any(attach.follower, function(uid){ return uid === smart.uid()})

          container.append(_.template(tmpl, {
              "id": fid
            , "downloadId": attach.downloadId
            , "name": attach.filename
            , "image": "/images/filetype/"+attach.extension+".png"
          }));

          $("#file_fl_" + fid).on("click", function(){
            self.followFile(fid, "follow");
            return false;
          });
          $("#file_unfl_" + fid).on("click", function(){
            self.followFile(fid, "unfollow");
            return false;
          });

          if(isowner){
            $("#file_fl_" + fid).hide();
            $("#file_unfl_" + fid).hide();
          } else {
            if (isfollower){
              $("#file_fl_" + fid).hide();
              $("#file_unfl_" + fid).show();
            } else {
              $("#file_fl_" + fid).show();
              $("#file_unfl_" + fid).hide();
            }
          }
        });
      } else if(contentType == "videoBox"){
        var tmpl = $('#video-template').html();
        _.each(attaches, function(attach) {
          container.append(_.template(tmpl, {
              "id": attach.fileid
            , "image": "/picture/" + attach.fileid
            , "name": attach.filename
          }));
        });
      }
      smart.datailImageLoader();
    },

    /**
     * 文件的mime转换成文件后缀
     */
    contenttype2extension: function(contenttype, filename) {

      var mime = {
          "application/msword": "doc"
        , "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx"
        , "application/vnd.ms-excel": "xls"
        , "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx"
        , "application/vnd.ms-powerpoint": "ppt"
        , "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx"
        , "application/vnd.openxmlformats-officedocument.presentationml.slideshow": "ppsx"
        , "application/pdf": "pdf"
        , "application/rtf": "rtf"
        , "application/zip": "zip"
        , "image/bmp": "bmp"
        , "image/gif": "gif"
        , "image/jpeg": "jpeg"
        , "image/png": "png"
        , "image/tiff": "tiff"
        , "text/plain": "txt"
        , "video/msvideo": "avi"
        , "video/quicktime": "mov"
      };

      var extension = mime[contenttype];
      if (extension) {
        return extension;
      }

      filename.match(/.*[.]([^.]*)$/); // 文件后缀
      return RegExp.$1 || "default";
    },

    /**
     * 转发消息
     */
    fetchForward: function(mid,curpage) {
      var self = this
        , curpage = curpage || 1
        , limit = 20
        , mid = (typeof mid === "object") ? $(event.target).attr("id").split("_")[1] : mid;
        
      var url = "/message/list/forward.json?mid=" + mid;
      url += "&start=" + (curpage-1)*limit;
      url += "&count=" + limit;
      smart.doget(url, function(error, result){
        var tmpl = $('#forward-template').html()
          , container = $("#forwardarea_" + mid);

        // 清除原来的内容
        container.html("");

        $("#forwardMsg_" + mid).html(i18n["message.list.button.forward"]+"("+result.total+")");
        smart.pagination(result.total, limit, curpage, "page_forward_"+mid, function(){
          var pagenum = $(event.target).attr("id").split("_")[1];
          if(pagenum > 0){
            self.fetchForward(mid, pagenum);
          }
          return false;
        });

        _.each(result.items, function(msg){
          var uinfo = msg["part"].createby
            , range =  msg["part"].range
            , atusers =  msg["part"].atusers
            , atgroups =  msg["part"].atgroups
            , photo = uinfo.photo;

          photo = photo && photo.small? "/picture/" + photo.small : "/images/user.png";

          var rangeGroup = "";
          if(range){
            rangeGroup = " <a href='/group/" + range.id + "' id=" + range.id + " class='userLink'>(" + range.name.name_zh + ")</a>";
          }

          var at = "";
          if(atusers){
            _.each(atusers,function(user){
              at = at + " <a href='/user/" + user.id + "' id=" + user.id + " class='userLink'>@" + user.name.name_zh + "</a>";
            });
          }
          if(atgroups){
            _.each(atgroups,function(group){
              at = at + " <a href='/group/" + group.id + "' id=" + group.id + " class='userLink'>@" + group.name.name_zh + "</a>";
            });
          }

          container.append(_.template(tmpl, {
              "mid": msg["_id"]
            , "uid": uinfo.id
            , "uname": uinfo.name.name_zh
            , "time": smart.date(msg["createat"])
            , "uphoto": photo
            , "rangeGroup": rangeGroup
            , "at":at
            , "content": smart.mutiLineHTML(msg["content"].split("<br>【原消息】")[0])
          }));
        });

        $("#replyBox_" + mid).addClass("hidden");
        $("#forwardBox_" + mid).removeClass("hidden");
      });

      self.initializeScopeArea(mid);
      self.initializeFinder(mid);
    },

    forward: function(mid) {

      var self = this
        , mid = (typeof mid === "object") ? $(event.target).attr("id").split("_")[1] : mid
        , range = $("#selectedscope-selector-"+mid).attr("uid")
        , content = _.escape($("#textBoxMsg-selector-"+mid).val())
        , tousers = []
        , togroups = [];
     
      _.each($("#textBoxNotice-selector-"+mid+" li"), function(u) {
        var type = $(u).attr("type");
        if(type == "user") {
          tousers.push($(u).attr("uid"));
        } else {
          togroups.push($(u).attr("uid"));
        }
      });

      var url = "/message/forward.json"
        , fd = new FormData();

      // fd.append("content", content);
      // fd.append("target", mid);
      // fd.append("range", range);
      // fd.append("tousers", tousers);
      // fd.append("togroups", togroups);
      var at = {
        "users": tousers,
        "groups": togroups
      };
      var msg = {};
      msg["content"] = content;
      msg["target"] = mid;
      msg["range"] = range;

      msg["at"] = at;

      smart.dopost(url, msg, function(err, result){
        //alert("信息成功转发");
        //$("#message-selector").modal('hide');
        //$("#textBoxMsg-selector-"+mid).val("");
        self.fetchForward(mid);
        $("#textBoxMsg-selector-"+mid).val("");
        $("#keywordsText-selector-"+mid).val("");
        $("#textBoxNotice-selector-"+mid).find("ol").remove();
        $("#selectedscope-selector-"+mid).attr("uid", "1");
        $("#selectedscope-selector-"+mid).html(i18n["message.list.selector.scope"]);
      });

      return false;
    },

    /**
     * 回复消息
     */
    reply: function(mid) {
      var self = this
        , url = "/message/create.json"
        , mid = (typeof mid === "object") ? $(event.target).attr("id").split("_")[1] : mid
        , text = $("#reply_" + mid)
        , fd = new FormData();

      if(text.val().trim().length == 0){
        alert(i18n["message.list.message.noreply"]);
        text.val("");
        text.focus();
        return false;
      }

      fd.append("type", "2");
      fd.append("target", mid);
      fd.append("range", text.attr("range"));
      fd.append("contentType", "textBox");
      fd.append("content", _.escape(text.val()));

      smart.dopostData(url, fd, function(err, result){
        self.fetchReply(mid);
        text.val("");
        //alert("reply");
      });
    },

    /**
     * 检索回复消息
     */
    fetchReply: function(mid, curpage) {

      var self = this
        , curpage = curpage || 1
        , limit = 20
        , mid = (typeof mid === "object") ? $(event.target).attr("id").split("_")[1] : mid;

      var url = "/message/list/reply.json?mid=" + mid;
      url += "&start=" + (curpage-1)*limit;
      url += "&count=" + limit;
      smart.doget(url, function(error, result){
        var tmpl = $('#reply-template').html()
          , container = $("#replyarea_" + mid);

        // 清除原来的内容
        container.html("");

        var total = result.total;
        $("#fetchreply_" + mid).html(i18n["message.list.button.reply"]+"("+total+")");

        smart.pagination(total, limit, curpage, "page_container_"+mid, function(){
          var pagenum = $(event.target).attr("id").split("_")[1];
          if(pagenum > 0){
            self.fetchReply(mid, pagenum);
          }
          return false;
        });

        _.each(result.items, function(msg){
          var uinfo = msg["part"].createby
            , photo = uinfo.photo;

          photo = photo && photo.small? "/picture/" + photo.small : "/images/user.png";

          container.append(_.template(tmpl, {
              "mid": msg["_id"]
            , "uid": uinfo.id
            , "uname": uinfo.name.name_zh
            , "time": smart.date(msg["createat"])
            , "uphoto": photo
            , "content": smart.mutiLineHTML(msg["content"])
          }));
        });
        $("#replyBox_" + mid).removeClass("hidden");
        $("#forwardBox_" + mid).addClass("hidden");
      });
    },

    deleteMessage: function(mid) {

      var self = this
        , url = "/message/delete.json"
        , mid = (typeof mid === "object") ? $(event.target).attr("id").split("_")[1] : mid
        , fd = new FormData();

      fd.append("mid", mid); 
      smart.dopostData(url, fd, function(err, result){
        self.showMessage();
        //alert("delete");
      });
    },

    // ---------------------------- message -------------------------------------------------

    initializeScopeArea : function (mid) {
      if(this.scopeAreainitialized){
        return false;
      }

      // 获取部门/组
      var url = "/group/list.json?joined=true&uid=" + smart.uid();
      smart.doget(url, function(err, result){
        var scope = $("#scope-selector-"+mid)
          , tmpl = $("#message-scope-template").html();

        _.each(result.items, function(g) {
          scope.append(_.template(tmpl, {"name": g.name.name_zh, "id": g._id}));
        });

        // 选择发布消息的范围
        $("#scope-selector-"+mid+" a").on("click", function() {

          var uid =$(event.target).attr("uid");
          if(uid != "1"){
            $("#_findresult").hide();
            $("#keywordsText-selector-"+mid).val("");
            $("#keywordsText-selector-"+mid).attr("scope",uid);
            $("#textBoxNotice-selector-"+mid).find("ol").remove();
          }   

          $("#selectedscope-selector-"+mid).attr("uid", $(event.target).attr("uid"));
          $("#selectedscope-selector-"+mid).html($(event.target).html());
          $("#scope-selector-"+mid).hide();
          return false;
        });
      });

      // 显示设定消息的下拉框
      $("#scopesetter-selector-"+mid).bind("click", function() {
        var anchor = $(event.target)
          , scope = $("#scope-selector-"+mid);

        scope.css("top", anchor.offset().top  + 25);
        scope.css("left", anchor.offset().left - 85);
        scope.show();

        return false;
      });

      // 关闭消息范围指定菜单
      $(document).bind("click", function() {
        $("#scope-selector-"+mid).hide();
      });

      this.scopeAreainitialized = true;
    },

    initializeFinder : function (mid) {
      finder.view.onUserSelected = this.onUserSelectedCallback;
      finder.view.bindSearchBox($("#keywordsText-selector-"+mid));
    },

    onUserSelectedCallback: function(uid, uname, type, src){

      var tmpl = $("#selected-user-template").html()
        , container = src.parent()
        , item = _.template(tmpl, {"uid": uid, "uname": uname, "type": type});

      item = item.replace(/\n/g, "").replace(/^[ ]*/, "");
      $(item).insertBefore(src);

      // 设定光标
      src.val("").focus();

      // 删除用户按钮的事件绑定
      $(".users a").on("click", function(){
        $(event.target).parent().parent().remove(); return false;
      });
    }

  });

})(message.view("messagedetail"));