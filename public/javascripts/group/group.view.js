/**
 * 单个组的View。负责组界面的显示，处理界面事件。
 *  显示组信息，显示在组内发布的信息
 *  主要有组信息的更新
 *  主要有组头像的更新
 */

(function(Group) {
  
  Group.View = Backbone.View.extend({

    /**
     * 初始化View
     */
    initialize: function() {

      _.bindAll(this, "render", "joinGroup"
        , "fetchUser", "fetchMember", "fetchGroup", "fetchAllUser"
        , "showMessage", "showFiles", "showMessage", "forward"
        , "reply", "fetchReply", "deleteMessage");

      messageSelector.initializeForwardBox(this.showMessage);

      // 加入组，退出组的按钮事件
      $("#join-btn, #leave-btn").bind('click', this.joinGroup);

      $("#showMember").bind("click", this.fetchMember);
      $("#showAllUser").bind("click", this.fetchAllUser);
      $("#showFiles").bind("click", this.showFiles);
      $("#showMessage").bind("click", this.showMessage);

      this.kind = "3";
      this.fetchGroup();
      this.showMessage();

      window.sidemenu.view.onSideMenuClicked = this.sideMenuClicked;
    },

    /**
     * 渲染画面
     */
    render: function() {

      var self = this
        , category = this.model.get("category")
        , groupName =  _.isObject(this.model.get("name"))?this.model.get("name")["name_zh"]:this.model.get("name")
        , groupDescription = this.model.get("description")
        , groupAdmin = this.model.get("createby")
        , groupMembers = this.model.get("member")
        , groupImage = this.model.get("photo")
        , groupSecure = this.model.get("secure")
        , type = this.model.get("type")
        , loginId = $("#userid").val();

      $("#group-public").text(groupSecure == 1 ? i18n["group.groupview.secure.1"] : i18n["group.groupview.secure.2"]);
      $("#group-name").text(groupName);
      $("#group-description").text(groupDescription);

      var image = groupImage ? "/picture/" + groupImage.big : "/images/user.png";
      $("#groupImage img").attr("src", image);
      $("#target-photo").attr("src", image);

      // 组的操作按钮
      $("#editGroup").addClass("hide");
      $("#join-btn").addClass("hide");
      $("#leave-btn").addClass("hide");

      if (type == 1) {

        // 已经属于改组，不管私密还是公开，都能编辑能退出
        if (_.contains(groupMembers, loginId)) {
          $("#editGroup").removeClass("hide");
          $("#leave-btn").removeClass("hide");
        } else {

          // 公开组，可以参加
          if (groupSecure == 2) {
            $("#join-btn").removeClass("hide");
          }
        }
      }

      if (type == 2) {
        $("#showAllUser").hide();
        $("#editGroup").removeClass("hide");
      }

      $("#1 a.btn").bind("click", function(){
        self.kind = 1;
        self.fetchUser($(event.target).html());
      });

      $("#2 a.btn").bind("click", function(){
        self.kind = 2;
        self.fetchUser($(event.target).html());
      });
      
      
    },

    sideMenuClicked: function(item, type) {
      
      // 部门的消息
      if (type == "group") {
        window.location = "/group/" + item;
      }
      return false;
    },

    /**
     * 获取组情报
     */
    fetchGroup: function() {
      var self = this;

      self.model.fetch({
        error: function(){
          Alertify.log.error('error');
        }, 
        success: function() {
          self.render();
        }
      });
    },

    /**
     * 获取组成员情报
     */
    fetchAllUser: function() {
      this.kind = "2";
      this.fetchUser();
    },

    fetchMember: function() {
      this.kind = "1";
      this.fetchUser();
    },

    fetchUser: function(firstletter) {

      var self = this
        , url = self.kind == 2 ? "/user/list.json"
            : "/group/members.json?gid=" + self.model.id;

      if(firstletter){
        firstletter = firstletter.toUpperCase() == "ALL" ? "" : firstletter;
        url = self.kind == 2 ? "/user/list.json?firstLetter=" + firstletter
            : "/group/members.json?gid=" + self.model.id + "&firstLetter=" + firstletter;
      }

      smart.doget(url, function(err, result){

        var currentuser = $("#userid").val()
          , container = self.kind == 2 ? $("#allUser") : $("#groupMember")
          , members = self.model.get("member")
          , isOwner = (currentuser == self.model.get("createby"));

        container.html("");

        _.each(result.items, function(user) {
          var name = user.name
            , photo = user.photo
            , isMember = _.contains(members, user._id)
            , isSelf = (currentuser == user._id);

          // 邀请页里如果已经是成员的话，就不显示该用户
          // TODO: 获取数据时，就应该把他去掉
          if ( self.kind==1 || (self.kind==2 && !isMember) ) {
            container.append(_.template($('#user-template').html(), {
                "id": user._id
              , "name": name.name_zh
              , "photo": photo ? "/picture/" + photo.big : "/images/user.png"
              , "title": user.title
              , "mail": user.uid
              , "owner": isOwner
              , "member": isMember
              , "self": isSelf
              , "groupType":self.model.get("type")
            }));
          }
        });

        $("#groupMember a, #allUser a").on("click", function(){
          var name = $(event.target).attr("name");
          if (name) {
            self.joinGroup(); return false;
          }
        });

      });
    },

    /**
     * 参加到组，或从组退出。对象用户是当前登陆的用户
     */
    joinGroup: function(){
      var self = this
        , name = $(event.target).attr("name");

      if (!name) {
        return;
      }

      var uid = $(event.target).attr("uid")
        , gid = $("#groupid").val()
        , url = name == "remove" ? "/group/leave.json" : "/group/join.json"
        , msg = name == "remove" ? i18n["group.groupview.message.leave"] : i18n["group.groupview.message.join"];
        // console.log({"gid": gid, "uid": uid});
      smart.doput(url, {"gid": gid, "uid": uid}, function(err, result){
        self.fetchGroup();
        self.fetchUser();
        smart.show("success", i18n["success"], msg, 3);
      });
    },


    // ----------------------------- message ------------------------------------------------

    /**
     * 显示用户的消息
     */
    showMessage: function(curpage) {

      var self = this
        , curpage = (typeof curpage === "object" || typeof curpage === "undefined") ? 1 : curpage
        , limit = 20
        , tmpl = $('#message-template').html()
        , container = $("#messages-container");

      var url = "/message/list/group.json?gid=" + this.model.get("_id");
      url += "&start=" + (curpage-1)*limit;
      url += "&count=" + limit;
      smart.doget(url, function(error,result){
        // 清除原来的内容
        container.html("");
        if(parseInt(result.total) != 0){
          _.each(result.items, function(msg){

            var uinfo = msg["part"].createby
              , photo = uinfo.photo
              , range = msg["part"].range
              , atusers = msg["part"].atusers
              , atgroups = msg["part"].atgroups
              , contentType = msg["contentType"];

            photo = photo && photo.big ? "/picture/" + photo.big : "/images/user.png";

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

            $("#forwardMsg_" + msg["_id"]).on("click", self.forward);
            $("#replyButton_" + msg["_id"]).on("click", self.reply);
            $("#fetchreply_" + msg["_id"]).on("click", self.fetchReply);
            $("#delete_" + msg["_id"]).on("click", self.deleteMessage);

            smart.pagination(result.total, limit, curpage, "messagelist-group", function(){
              var pagenum = $(event.target).attr("id").split("_")[1];
              if(pagenum > 0){
                self.showMessage(pagenum);
              }
              return false;
            });

          });
        } else {
          container.html(i18n["message.list.lable.nothing"]);
        }
      });
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
      smart.imageLoader();
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
    forward: function(mid) {
      var self = this
        , mid = (typeof mid === "object") ? $(event.target).attr("id").split("_")[1] : mid;
        
      messageSelector.fetchMessageData(mid);
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
     * 检索回复消息
     */
    fetchReply: function(mid, show) {

      var self = this
        , mid = (typeof mid === "object") ? $(event.target).attr("id").split("_")[1] : mid;

      if(!show && !$("#replyBox_" + mid).is(":hidden")) {
        $("#replyBox_" + mid).addClass("hidden");
        return;
      }

      var url = "/message/list/reply.json?mid=" + mid;
      smart.doget(url, function(error, result){
        var self = this
          , tmpl = $('#reply-template').html()
          , container = $("#replyarea_" + mid);

        // 清除原来的内容
        container.html("");

        $("#fetchreply_" + mid).html(i18n["message.list.button.reply"] + "(" + result.total + ")");

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


    /**
     * 显示用户的文件
     */
    showFiles: function() {
      this.kind = "4";
      smart.doget("/user/files.json?start=0&count=20", function(err, result){

        var tmpl = $("#files-template").html()
          , container = $("#file-container");

        // 清除原来的内容
        container.html("");

        _.each(result.items, function(file) {
          container.append(_.template(tmpl, {
             _id: file._id
            , type: file.contentType
            , title: file.filename
            , group: ""
            , at: file.uploadDate
          }));
        });

      });
    }

  });

})(group.view("group"));

