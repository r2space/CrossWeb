
/**
 * 消息类型分为:
 *  textBox
 *  imageBox
 *  fileBox
 *  videoBox
 *  documentBox
 * 上下文可以用kind来判断。
 */
(function(Message) {

  Message.View = Backbone.View.extend({

    /**
     * 初始化
     */
    initialize: function(options) {

      var self = this;
      _.bindAll(this,"fetchAlertMessage","sideMenuClicked", "publish", "fetchMessage", "fetchReply",  "renderReply",
       "fileUpload", "uploadFiles", "uploadMsg","setDocument", "forward", "reply","deleteMessage", "cleanMessageBox");

      // 发布消息
      $("#publish").bind("click", this.publish);

      // 上传文件
      $("#uploadfile").bind("change", this.fileUpload);

      //隐藏 alert-msg
      $("#alert-msg").css("display","none");

      $("#alert-msg").bind("click",this.fetchAlertMessage);

      messageSelector.initializeForwardBox(this.fetchMessage);


      this.initializeScopeArea();
      this.initializeMessageTypeArea();
      this.fetchMessage();

      this.kind = "textBox";
      finder.view.onUserSelected = this.onUserSelectedCallback;
      finder.view.bindSearchBox($("#keywordsText, #keywordsImage, #keywordsFile, #keywordsVideo, #keywordsDocument"));

      window.sidemenu.view.onSideMenuClicked = this.sideMenuClicked;
    },

    fetchAlertMessage :function(){
      $("#alert-msg").css("display","none");
      this.fetchMessage();
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

    /**
     * 初始化消息类型选择框
     */
    initializeMessageTypeArea: function() {

      var self = this;

      // 切换消息类型
      $("#msgtype a").bind("click", function(){
        $(".textBox").hide();
        $(".imageBox").hide();
        $(".fileBox").hide();
        $(".videoBox").hide();
        $(".documentBox").hide();

        var id = $(event.target).parent().attr("id");
        $("." + id).show();
        self.kind = id;
      });

      // 选择图片文件
      $("#imageBoxSelector").bind("click", function(){
        var src = $("#uploadfile");
        src.attr("accept", "image/*");
        src.attr("multiple", "multiple");
        src.trigger('click');
      });

      // 选择文件
      $("#fileBoxSelector").bind("click", function(){
        var src = $("#uploadfile");
        src.attr("accept", "");
        src.attr("multiple", "multiple");
        src.trigger('click');
      });

      // 选择视频
      $("#videoBoxSelector").bind("click", function(){
        var src = $("#uploadfile");
        src.attr("accept", "audio/*,video/*");
        src.removeAttr("multiple");
        src.trigger('click');
      });

      // 选择文书
      $("#documentBoxSelector").bind("click", function(){
        var url="/file/list.json?type=all";
        smart.doget(url, function(err,result){
          var tmpl = $("#message-documentlist-template").html()
          , container = $("#message-documentlist");

          container.html("");
          _.each(result.items, function(file) {
            container.append(_.template(tmpl, {
                fid: file._id
              // , downloadId: file.downloadId
              , extension: file.extension
              , filename: file.filename
              , at: file.uploadDate
            }));
          });

          $("#message-documentlist tr").bind("click", function(){
            if(event.target.type == "checkbox")
              return;
            var fid = $(event.target).parents("tr").attr("fid");
            $("#doc_" + fid).trigger('click');
          });
        });
      });

      // 文书选择完了
      $("#setDocument").bind("click", function(){
        self.setDocument();
        $("#document-selector").modal('hide');
      });

    },

    /**
     * 初始化指定消息范围的下拉框
     */
    initializeScopeArea: function() {

      // 获取部门/组
      var url = "/group/list.json?joined=true&uid=" + smart.uid();
      smart.doget(url, function(err, result){
        var scope = $("#scope")
          , tmpl = $("#message-scope-template").html();

        _.each(result.items, function(g) {
          scope.append(_.template(tmpl, {"name": g.name.name_zh, "id": g._id}));
        });

        // 选择发布消息的范围
        $("#scope a").on("click", function() {
          var uid =$(event.target).attr("uid");
          if(uid != "1"){
            $("#_findresult").hide();
            $("#keywordsText").val("");
            $("#keywordsText").attr("scope",uid);
            $("#textBoxNotice").find("ol").remove();
            $("#keywordsImage").val("");
            $("#keywordsImage").attr("scope",uid);
            $("#imageBoxNotice").find("ol").remove();
            $("#keywordsFile").val("");
            $("#keywordsFile").attr("scope",uid);
            $("#fileBoxNotice").find("ol").remove();
            $("#keywordsVideo").val("");
            $("#keywordsVideo").attr("scope",uid);
            $("#videoBoxNotice").find("ol").remove();
            $("#keywordsDocument").val("");
            $("#keywordsDocument").attr("scope",uid);
            $("#documentBoxNotice").find("ol").remove();
          }
         
          $("#selectedscope").attr("uid", uid);
          $("#selectedscope").html($(event.target).html());
          $("#scope").hide();
          return false;
        });
      });

      // 显示设定消息的下拉框
      $("#scopesetter").bind("click", function() {
        var anchor = $(event.target)
          , scope = $("#scope");

        scope.css("top", anchor.offset().top + 25);
        scope.css("left", anchor.offset().left - 45);
        scope.show();

        return false;
      });

      // 关闭消息范围指定菜单
      $(document).bind("click", function() {
        $("#scope").hide();
      });
    },

    /**
     * 选择用户的事件声明
     */
    onUserSelectedCallback: function(uid, uname, type, src){
      var tmpl = $("#user-template").html()
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
    },

    // 文书选择
    setDocument: function(){
      var self = this;
      var files = $("#message-documentlist input:checked");
      var tmpl = $("#message-document-template").html();
      var container = $("#documentBoxerContainer");
      var documents = [];

      container.html("");
      _.each(files, function(file){
        file = $(file);
        var fileid = file.attr("value")
          , filename = file.attr("filename");
        documents.push({"fileid": fileid, "filename": filename});

        var extension = self.contenttype2extension(file.attr("extension"), filename)
            , photo = "/images/filetype/"+ extension +".png";
        container.append(_.template(tmpl, {
            id: fileid
          , src: photo
          , title: filename
        }));
      });

      self.documents = documents;
    },

    /**
     * 文件上传
     */
    fileUpload: function(event) {
      var self = this
        , files = event.target.files;

      // 上传图片
      if (self.kind == "imageBox") {
        var tmpl = $("#message-image-template").html();
        $("#imageBoxerContainer").html("");
        for (var f, i = 0; f = files[i]; i++) {
          var id = _.uniqueId();

          // 创建image框
          var img = _.template(tmpl, {"id": id, "index": i});
          img = img.replace(/\n/g, "").replace(/^[ ]*/, "");
          $("#imageBoxerContainer").append($(img));
          //$(img).insertBefore($("#imageBoxSelector"));

          // 预览图片
          smart.localPreview(f, $("#" + id));
        }
      }

      // 上传照片以外的文件
      if (self.kind == "fileBox") {
        var tmpl = $("#message-file-template").html();
        $("#fileBoxerContainer").html("");
        for (var f, i = 0; f = files[i]; i++) {
          var id = _.uniqueId()
            , extension = self.contenttype2extension(f.type, f.name)
            , photo = "/images/filetype/"+ extension +".png";

          var type = _.template(tmpl, {"id": id, "src": photo, "title": f.name});
          type = type.replace(/\n/g, "").replace(/^[ ]*/, "");

          $("#fileBoxerContainer").append($(type));
          //$(type).insertBefore($("#fileBoxSelector"));
        }
      }

      // 上传视频文件
      if (self.kind == "videoBox") {
        $("#videoBoxSelector span").html(files[0].name);
      }

      this.files = files;
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
     * 渲染画面
     */
    render: function() {
      var self = this
        , imgs = []
        , tmpl = $('#message-template').html()
        , container = $("#messages-container");

      // 清除原来的内容
      container.html("");

      //设置用户上一次刷新页面的时间点
      msg_timeline  = self.collection.timeline;
      

      self.collection.each(function(msg) {
        var uinfo = msg.get("part").createby
          , photo = uinfo.photo
          , range = msg.get("part").range
          , atusers = msg.get("part").atusers
          , atgroups = msg.get("part").atgroups
          , contentType = msg.get("contentType");

        photo = photo && photo.big ? "/picture/" + photo.big : "/images/user.png";

        imgs.push(photo);


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
            "mid": msg.get("_id")
          , "uid": uinfo.id
          , "uname": uinfo.name.name_zh
          , "time": smart.date(msg.get("createat"))
          , "uphoto": photo
          , "replyNums": msg.get("part").replyNums
          , "forwardNums": msg.get("part").forwardNums
          , "content": smart.mutiLineHTML(msg.get("content"))
          , "range": range ? range.id : "1"
          , "rangeGroup": rangeGroup
          , "atAccounts": at
        }));

        var attaches = msg.get("attach");
        if(contentType == "documentBox"){
          attaches = msg.get("part").documents;
        }
        self.renderAttach(contentType, msg.get("_id"), attaches);

        $("#forwardMsg_" + msg.get("_id")).on("click", self.forward);
        $("#replyButton_" + msg.get("_id")).on("click", self.reply);
        $("#fetchreply_" + msg.get("_id")).on("click", self.fetchReply);
        $("#delete_" + msg.get("_id")).on("click", self.deleteMessage);
      });
      smart.imageLoader();
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
              "mid":mid
            ,  "id": attach.fileid
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
    },

    followFile: function(fid, kind){
      var url = "/file/" + kind + ".json";
      smart.doput(url, {"fid": fid}, function(err, result){
        if(result.error){
          console.log(result); return;
        }

        $("#file_fl_" + fid).toggle();
        $("#file_unfl_" + fid).toggle();

      });
    },

    /**
     * 渲染回复消息
     */
    renderReply: function(mid) {
      var self = this
        , tmpl = $('#reply-template').html()
        , container = $("#replyarea_" + mid);

      // 清除原来的内容
      container.html("");

      $("#fetchreply_"+mid).html(i18n["message.list.button.reply"] + "(" + self.replyCollection.total + ")");

      self.replyCollection.each(function(msg) {

        var uinfo = msg.get("part").createby
          , photo = uinfo.photo;

        photo = photo && photo.small? "/picture/" + photo.small : "/images/user.png";

        container.append(_.template(tmpl, {
            "mid": msg.get("_id")
          , "uid": uinfo.id
          , "uname": uinfo.name.name_zh
          , "time": smart.date(msg.get("createat"))
          , "uphoto": photo
          , "content": smart.mutiLineHTML(msg.get("content"))
        }));
      });

      $("#replyBox_" + mid).removeClass("hidden");
      if(self.replyCollection.total > 10)
        $("#reply-more_" + mid).css("display","block");
    },

    cleanMessageBox: function(){
       var self = this
        , msgbox = $("#" + self.kind + "Msg");

      // clean message
      msgbox.val("");

      // clean at
      $("#_findresult").hide();
      $("#keywordsText").val("");
      $("#textBoxNotice").find("ol").remove();
      $("#keywordsImage").val("");
      $("#imageBoxNotice").find("ol").remove();
      $("#keywordsFile").val("");
      $("#fileBoxNotice").find("ol").remove();
      $("#keywordsVideo").val("");
      $("#videoBoxNotice").find("ol").remove();
      $("#keywordsDocument").val("");
      $("#documentBoxNotice").find("ol").remove();

      // clean soap
      
    },

    /**
     * 发布消息
     */
    publish: function() {

      var self = this
        , msgbox = $("#" + self.kind + "Msg")
        , contentType = self.kind
        , range = $("#selectedscope").attr("uid")
        , content = _.escape(msgbox.val());

      var tousers = [];
      var togroups = [];
      _.each($("#" + self.kind + "Notice li"), function(u) {
        var type = $(u).attr("type");
        if(type == "user") {
          tousers.push($(u).attr("uid"));
        } else {
          togroups.push($(u).attr("uid"));
        }
      });
      var at = {
        "users": tousers,
        "groups": togroups
      };
      var param = {
        "content":content,
        "contentType":contentType,
        "range":range,
        "at":at
      };

      if (self.kind == "textBox") {
        if(msgbox.val().trim().length == 0){
          Alertify.dialog.alert(i18n["message.list.message.nomessage"]);
          //alert(i18n["message.list.message.nomessage"]);
          msgbox.val("");
          msgbox.focus();
          return false;
        }
        self.uploadMsg(param);
      }

      if (self.kind == "imageBox" || self.kind == "videoBox" || self.kind == "fileBox") {
        if(!self.files || self.files.length == 0){
           Alertify.dialog.alert(i18n["message.list.message.no"+self.kind]);
           return false;
        }
        self.uploadFiles(self.files, function(err, result) {

          var attach = [];
          _.each(result.data.items, function(item) {
            var data = {};
            data["fileid"] = item._id;
            data["filename"] = item.filename;
            attach.push(data);
          });
          self.uploadMsg(param, attach);
        });
      }

      if (self.kind == "documentBox") {
        if(!self.documents || self.documents.length == 0){
          Alertify.dialog.alert(i18n["message.list.message.no"+self.kind]);
          return false;
        }
        self.uploadMsg(param, self.documents);
      }

      return false;
    },

    /**
     * 上传文件
     */
    uploadFiles: function(files, callback) {

      var self = this;
      if (!files || files.length <= 0) {
        return false;
      }

      var fd = new FormData();
      for (var i = 0; i < files.length; i++) {
        fd.append("files", files[i]);
      }

      smart.dopostData("/gridfs/save.json", fd, function(err, result){
        callback(err, result);
      });
    },

    /**
     * 上传消息
     */
    uploadMsg: function(param, attach) {
      var self = this
        , url = "/message/create.json"
        , fd = new FormData();

      // fd.append("content", param.content);
      // fd.append("contentType", param.contentType);
      // fd.append("range", param.range);
      // fd.append("tousers", param.tousers);
      // fd.append("togroups", param.togroups);
      if (attach) {
        param["attach"] = attach;
      }
      
      smart.dopost(url, param, function(err, result){
        self.fetchMessage();
        self.cleanMessageBox();
        Alertify.dialog.alert(i18n["success"]);
      });
    },

    /**
     * 转发消息
     */
    forward: function(mid) {
      var self = this
        , mid = (typeof mid === "object") ? $(event.target).attr("id").split("_")[1] : mid;
      
      messageSelector.fetchMessageData(mid);
      //this.href = "#message-selector";
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
        Alertify.dialog.alert(i18n["message.list.message.noreply"]);
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
        self.fetchReply(mid, true);
        text.val("");
        //alert("reply");
      });
    },

    /**
     * 检索消息一览
     */
    fetchMessage: function(curpage) {
      $("#alert-msg").css("display","none");
      var self = this
        , total = ""
        , limit = 20
        , curpage = curpage || 1; 

      this.collection.start = (curpage - 1) * limit;
      this.collection.count = limit;

      this.collection.fetch({
        error: function(){
          alert('error');
        }, 
        success: function() {
          smart.pagination(self.collection.total, limit, curpage, "messagelist-home", function(){
            var pagenum = $(event.target).attr("id").split("_")[1];
            if(pagenum > 0){
              self.fetchMessage(pagenum);
            }
            return false;
          });
          self.render();
        }
      });
    },

    deleteMessage: function(mid) {

      var self = this
        , url = "/message/delete.json"
        , mid = (typeof mid === "object") ? $(event.target).attr("id").split("_")[1] : mid
        , fd = new FormData();

      fd.append("mid", mid); 
      smart.dodelete(url, fd, function(err, result){
        self.fetchMessage();
        //alert("delete");
      });
    },

    /**
     * 检索回复消息
     */
    fetchReply: function(mid, show) {

      var self = this
        , mid = (typeof mid === "object") ? $(event.target).attr("id").split("_")[1] : mid;

      if(!show && !$("#replyBox_" + mid).is(":hidden")) {
        $("#replyBox_" + mid).addClass("hidden");
        return;
      }

      ReplyCollection = message.model("reply").Collection;

      var collection = new ReplyCollection(null, {"mid": mid});
      collection.fetch({
        error: function(){
          alert('error');
        }, 
        success: function() {
          self.renderReply(mid);
        }
      });

      self.replyCollection = collection;
    }

  });

})(message.view("message"));