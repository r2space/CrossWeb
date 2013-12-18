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
      var self = this;

      _.bindAll(this, "render", "joinGroup"
        , "fetchUser", "fetchMember", "fetchGroup", "fetchAllUser"
        , "showMessage", "showFiles", "showMessage", "forward"
        , "reply", "fetchReply", "deleteMessage");

      messageSelector.initializeForwardBox(this.showMessage);

      var joinFunc = this.joinGroup;
      // 加入组，退出组的按钮事件
      $("#join-btn, #leave-btn").bind('click', function() {
        joinFunc($(this));
      });

      $("#showMember").bind("click", this.fetchMember);
      $("#showAllUser").bind("click", this.fetchAllUser);
      $("#showFiles").bind("click", this.showFiles);
      $("#showMessage").bind("click", this.showMessage);

      $("#searchBtn").click(this.fetchUser);
      $("#searchInput").keypress(function(event) {
        if(event.which === 13) {
          self.fetchUser();
        }
      });

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
        , groupOwners = this.model.get("owner")
        , groupImage = this.model.get("photo")
        , groupSecure = this.model.get("secure")
        , type = this.model.get("type")
        , loginId = $("#userid").val();

      var mainOwner = this.model.get("mainOwner");
      $("#brief").html(_.template($("#groupbreif-template").html(), {
          "name": groupName
        , "visibility": (groupSecure == 1 ? i18n["group.groupview.secure.1"] : i18n["group.groupview.secure.2"])
        , "ownerId": (mainOwner ? mainOwner._id : "" )
        , "ownerName": (mainOwner ? mainOwner.name.name_zh : "" )
      }));

      var image = (groupImage && groupImage.big) ? "/picture/" + groupImage.big : "/images/group.png";
      $("#groupImage img").attr("src", image);
      $("#target-photo").attr("src", image);

      $("#memberCount").html(groupMembers.length);

      // 组的操作按钮
      $("#editGroup").addClass("hide");
      $("#join-btn").addClass("hide");
      $("#leave-btn").addClass("hide");

      if (type == 1) {

        // 已经属于改组，只要不是管理员，不管私密还是公开，能退出
        if (_.contains(groupMembers, loginId)) {
          if(!_.contains(groupOwners, loginId)) {
            $("#leave-btn").removeClass("hide");
          }
        } else {
          // 公开组，可以参加
          if (groupSecure == 2) {
            $("#join-btn").removeClass("hide");
          }
        }

        // 是组的管理者，能编辑
        if (_.contains(groupOwners, loginId)) {
          $("#editGroup").removeClass("hide");
        }

        if(groupSecure === "1" && !_.contains(groupOwners, loginId)) {
          $("#showAllUser").hide();
        }
      }

      if (type == 2) {
        $("#showAllUser").hide();
        // 是组的管理者，能编辑
        if (_.contains(groupOwners, loginId)) {
          $("#editGroup").removeClass("hide");
        }
      }
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
      $("#searchArea").show();
      $("#searchInput").val("");
      this.kind = "2";
      this.fetchUser();
    },

    fetchMember: function() {
      $("#searchArea").show();
      $("#searchInput").val("");
      this.kind = "1";
      this.fetchUser();
    },

    fetchUser: function(pagenum) {
      pagenum = pagenum || 1;

      var keyword = $("#searchInput").val();
      var self = this
        , url = self.kind == 2 ? "/user/list.json?needDept=false"
            : "/group/members.json?";
      if(keyword) {
        url += "&keywords=" + keyword;
      }
      url += "&start=" + (pagenum - 1)*smart.defaultPageSize;
      url += "&limit=" + smart.defaultPageSize;
      url += "&gid=" + self.model.id;

      smart.doget(url, function(err, result){

        var currentuser = $("#userid").val()
          , container = self.kind == 2 ? $("#allUser") : $("#groupMember")
          , members = self.model.get("member")
          , owners = self.model.get("owner")
          , loginUserIsOwner = _.contains(owners, currentuser)
          , secure = self.model.get("secure");

        container.html("");

        if(result.totalItems > 0) {
          _.each(result.items, function(user) {
            var name = user.name
              , photo = user.photo
              , isMember = _.contains(members, user._id);

            // 邀请页里如果已经是成员的话，就不显示该用户
            // TODO: 获取数据时，就应该把他去掉
            if ( self.kind==1 || (self.kind==2 && !isMember) ) {
              container.append(_.template($('#user-template').html(), {
                "id": user._id
                , "name": name.name_zh
                , "photo": (photo && photo.small) ? "/picture/" + photo.small : "/images/user.png"
                , "mail": user.email.email1
                , "isMember": isMember
                , "isOwner": _.contains(owners, user._id)
                , "isSelf": (currentuser == user._id)
                , "groupType": self.model.get("type")
                , "loginUserIsOwner": loginUserIsOwner
                , "isPublic": secure === "2"
              }));
            }
          });

          smart.pagination(result.totalItems, smart.defaultPageSize, pagenum, "pagination", function(pagenum){
            self.fetchUser(pagenum);
          });
        } else {
          $("#pagination").html("");
          smart.appendNoResultRow(container);
        }

        $("#groupMember a, #allUser a").on("click", function(){
          var name = $(this).attr("name");
          if (name) {
            self.joinGroup($(this)); return false;
          }
        });

      });
    },

    /**
     * 参加到组，或从组退出。对象用户是当前登陆的用户
     */
    joinGroup: function(btn){
      var self = this
        , name = btn.attr("name");

      if (!name) {
        return;
      }

      var uid = btn.attr("uid")
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
      $("#searchArea").hide();
      $("#searchInput").val("");
      $("#pagination").html("");

      var self = this
        , curpage = (typeof curpage === "object" || typeof curpage === "undefined") ? 1 : curpage
        , limit = smart.defaultPageSize
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
              rangeGroup = " <a href='/group/" + range._id + "' id=" + range._id + " class='userLink'>(" + range.name.name_zh + ")</a>";
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
              , "likeNums": msg.likers ? msg.likers.length : 0
              , "content": smart.mutiLineHTML(msg["content"])
              , "range": range ? range.id : "1"
              , "rangeGroup": rangeGroup
              , "atAccounts": at
              , "praised": _.contains(msg.likers || [], $("#userid").val())
            }));

            var attaches = msg["attach"];
            if(contentType == "documentBox"){
              attaches = msg["part"].documents;
            }
            self.renderAttach(contentType, msg["_id"], attaches);

            $("#praise_" + msg["_id"]).on("click", self.praise);
            $("#forwardMsg_" + msg["_id"]).on("click", self.forward);
            $("#replyButton_" + msg["_id"]).on("click", self.reply);
            $("#fetchreply_" + msg["_id"]).on("click", self.fetchReply);
            $("#delete_" + msg["_id"]).on("click", self.deleteMessage);

            smart.pagination(result.total, limit, curpage, "messagelist-group", function(pagenum){
              self.showMessage(pagenum);
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
     * 赞
     */
    praise: function(event) {

      var self = this
        , obj = $(event.target)
        , mid = obj.attr("id").split("_")[1]
        , praised = obj.hasClass("praised")
        , url = praised ? "/message/unlike.json" : "/message/like.json";

      smart.doput(url, {mid: mid}, function(err, result){
        if(err) {
          console.error(err);
          return;
        }

        var likeNum = result.likers ? result.likers.length : 0;
        obj.html(" " + likeNum);
        if(praised) {
          obj.removeClass("praised");
        } else {
          obj.addClass("praised");
        }
      });
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
    reply: function(event, mid) {
      var self = this
        , url = "/message/create.json"
        , mid = mid ? mid : $(event.target).attr("id").split("_")[1]
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
        self.fetchReply(null, mid, true);
        text.val("");
        //alert("reply");
      });
    },

    /**
     * 检索回复消息
     */
    fetchReply: function(event, mid, show) {

      var self = this
        , mid = mid ? mid : $(event.target).attr("id").split("_")[1];

      if(!show && !$("#replyBox_" + mid).is(":hidden")) {
        $("#replyBox_" + mid).addClass("hidden");
        return;
      }

      var url = "/message/list/reply.json?mid=" + mid + "&start=0&count=10";
      smart.doget(url, function(error, result){
        var self = this
          , tmpl = $('#reply-template').html()
          , container = $("#replyarea_" + mid);

        // 清除原来的内容
        container.html("");

        $("#fetchreply_" + mid).html(" " + result.total);

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
        if(result.total > 10) {
          $("#reply-more_" + mid).css("display","block");
        }
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

