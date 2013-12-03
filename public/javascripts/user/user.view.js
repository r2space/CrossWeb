(function(User) {
  
  User.View = Backbone.View.extend({

    initialize: function(options) {
      var self = this;

      var uid = window.location.href.split("/")[4];
      if (uid != $("#userid").val()) {
        self.model.set("_id", uid);
      } else {
        self.model.set("_id", $("#userid").val());
      }

      this.model.fetch({
        success: function(){
          self.render();
        }
      });

      self.showMessage();

      _.bindAll(this, "showUsers", "showGroups", "showFiles", "follow", "showMessage", "forward", "reply", "fetchReply", "deleteMessage");

      messageSelector.initializeForwardBox(this.showMessage);

      $(document).bind("click", function(){
        $("#fileHistory").hide();
      });

      $("#showMessage").bind("click", self.showMessage);
      $("#showFiles").bind("click", function(){
        self.showFiles(1);
      });
      $("#showFollower").bind("click", function(){
        self.showUsers("follower","");
      });
      $("#showFollowing").bind("click", function(){
        self.showUsers("following","");
      });
      $("#showGroups").bind("click", function(){
        self.showGroups(uid,"");
      });

      $("#followerFilter a.btn").bind("click", function(){
        self.showUsers("follower",$(event.target).html());
      });

      $("#followingFilter a.btn").bind("click", function(){
        self.showUsers("following",$(event.target).html());
      });

      $("#groupFilter a.btn").bind("click", function(){
        self.showGroups(uid,$(event.target).html());
      });

      window.sidemenu.view.onSideMenuClicked = this.sideMenuClicked;
    },

    /**
     * 渲染画面
     */
    render: function() {

      var self = this
        , userPhoto = this.model.get("photo")
        , photo = userPhoto ? "/picture/" + userPhoto.big : "/images/user.png"
        , name = this.model.get("name").name_zh
        , address = this.model.get("address")
        , tel = this.model.get("tel")
        , email = this.model.get("email")
        , custom = this.model.get("custom");

      $("#user_image img").attr("src", photo);
      $("#user_name").html(smart.cutString(name, 10));
      $("#user_title").html(this.model.get("title"));
      $("#followingCount").html(this.model.get("following").length);
      $("#followerCount").html(this.model.get("follower").length);

      // 如果是自己，显示编辑按钮
      if (this.model.id === $("#userid").val()) {
        $("#edit_btn").removeClass("hide");
        $("#edit_btn").bind("click", function(){
          window.location.href = "/usereditor";
          return false;
        });
      } else {
        if(_.contains(this.model.get("follower"),$("#userid").val())){
          $("#unfollow_btn").removeClass("hide");
          $("#follow_btn").addClass("hide");
        } else {
          $("#follow_btn").removeClass("hide");
          $("#unfollow_btn").addClass("hide");
        }

        $("#follow_btn").bind("click", function(){
          self.follow(self.model.id, "follow", "card", {});
          $("#unfollow_btn").removeClass("hide");
          $("#follow_btn").addClass("hide");
        });
        $("#unfollow_btn").bind("click", function(){
          self.follow(self.model.id, "unfollow", "card", {});
          $("#follow_btn").removeClass("hide");
          $("#unfollow_btn").addClass("hide");
        });

        $("#send_message_btn").removeClass("hide");
        $("#send_message_btn").bind("click", function(){
          smart.sendPrivateMessage(self.model.id);
          return false;
        });
      };

      // 基本信息
      $("#basic_user_name").text(name);
      $("#basic_user_birthday").text(this.model.get("birthday"));

      $("#basic_user_address").text(address ? address.country : "");
      $("#basic_user_bio").text(custom ? custom.memo : "");

      // 联系方式
      $("#basic_user_mobile").text(tel ? tel.mobile : "");
      $("#basic_user_email").text(email ? email.email1 : email);
      $("#basic_user_qq").text(this.model.get("qq"));
      $("#basic_user_skype").text(this.model.get("skype"));
      $("#basic_user_microblog").text(custom ? custom.url : "");
    },

    sideMenuClicked: function(item, type) {
      
      // 部门的消息
      if (type == "user") {
        window.location = "/user/" + item;
      }
      return false;
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

      var url = "/message/list/user.json?uid=" + this.model.get("_id");
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

            smart.pagination(result.total, limit, curpage, "messagelist-user", function(){
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
            , "id": attach.fileid
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

        $("#fetchreply_" + mid).html(i18n["message.list.button.reply"]+"(" + result.total + ")");

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

    showUsers: function(kind, fLetter) {
      var self = this;
      fLetter = fLetter.toUpperCase() == "ALL" ? "" : fLetter;
      var url = "/user/list.json?kind=" + kind 
        + "&uid=" + self.model.id + "&firstLetter=" + fLetter;

      var followingOfLoginUser = [];
      smart.doget("/user/get.json?_id="+$("#userid").val(), function(err, result){
        if (err) {
          console.log("error" + result); return;
        }

        followingOfLoginUser = result.following;

        smart.doget(url, function(err, result){
          if (err) {
            console.log("error" + result); return;
          }

          var tmpl = $("#user-template").html()
            , container = $("#"+kind+"list");

          container.html("");

          _.each(result.items, function(user){
            
            var isSelf = ($("#userid").val() == user._id)
              , uid = user._id
              , followed = _.contains(followingOfLoginUser, user._id);
            var photo = user.photo;

            photo = photo ? "/picture/" + photo.big : "/images/user.png"

            container.append(_.template(tmpl, {
                "id": user._id
              , "photo": photo
              , "name": user.name.name_zh
              , "title": user.title
              , "mail": user.uid
              , "kind":kind
            }));

            if(!isSelf){
              $("#"+kind+"_privatemsg_"+uid).removeClass("hidden");
              if(followed){
                $("#"+kind+"_unfollow_"+uid).removeClass("hidden");
              }else{
                $("#"+kind+"_follow_"+uid).removeClass("hidden");
              }
            }
          });

          $("#"+kind+"Count").html(result.items.length);

          $("#followinglist a.btn, #followerlist a.btn").on("click",function(){
            var target = $(event.target)
              , uid = target.attr("uid")
              , func = target.attr("name");
            if (func == "follow" || func == "unfollow"){
              self.follow(uid, func, "list", {"kind":kind, "firstLetter":fLetter});
            } else if (func == "privatemsg") {
              smart.sendPrivateMessage(uid);
              return false;
            }
          });

        });
      });
    },

    showGroups: function(uid, fLetter){
      fLetter = fLetter.toUpperCase() == "ALL" ? "" : fLetter;

      var url = "/group/list.json?joined=true&start=0&count=20&uid=" + uid
        + "&firstLetter=" + fLetter;

      var self = this;

      smart.doget(url, function(err, result){
        if (err) {
          console.log("error" + result); return;
        }

        var tmpl = $("#group-template").html()
          , container = $("#grouplist");

        container.html("");

        _.each(result.items, function(group){

          container.append(_.template(tmpl, {
              "id": group._id
            , "groupName": group.name.name_zh
            , "secure":group.secure
            , "groupMembers": group.member.length
            , "type": group.type
            , "lastModify": smart.date(group.editat)
            , "joined": _.contains(group.member, $("#userid").val())
          }));

          $("#groupbtn_"+group._id).bind("click",function(){
            var gid = $(event.target).attr("gid");
            var url = _.contains(group.member, $("#userid").val()) ? "/group/leave.json" : "/group/join.json";
            smart.doput(url, {"gid": gid}, function(err, result){
              self.showGroups(uid,"");
            });
          });
        });

      });

    },

    /**
     * 显示用户的文件
     */
    showFiles: function(page) {
      var self = this
        , page = page || 1
        , limit = 20;

      var url = "/file/list.json?start=" + (page-1)*limit + "&count=" + limit + "&type=all&uid=" + self.model.id;

      smart.doget(url, function(err, result){

        var tmpl = $("#files-template").html()
          , container = $("#filelist");

        // 清除原来的内容
        container.html("");
        var total = result.total;
        smart.pagination(total, limit, page, "file_page_container", function(){
          var pagenum = $(event.target).attr("id").split("_")[1];
          if(pagenum > 0){
            self.showFiles(pagenum);
          }
          return false;
        });

        _.each(result.items, function(file) {
          container.append(_.template(tmpl, {
              fid: file._id
            , downloadId: file.downloadId
            , extension: file.extension
            , title: file.filename
            , at: smart.date(file.uploadDate)
            , isowner: file.owner == $("#userid").val()
            , followed: _.contains(file.follower, $("#userid").val())
          }));
        });

        $("#filelist a.btn").on("click", function(){
          var target = $(event.target)
            , func = target.attr("name");
            if(func == "download"){
              self.downloadFile(target.attr("downloadId"));
            } else if (func == "update") {
              $("#uploadfile").trigger('click');
              $("#uploadfile").attr("fid", target.attr("fid"));
            } else if (func == "history") {
              self.fileHistory(event.target);
            } else if (func == "follow" || func == "unfollow") {
              self.followFile(target.attr("fid"), func);
            }
        });

        $("#uploadfile").bind("change", function(e){
          var target = e.target;
          self.updateFile($(target).attr("fid"),e.target.files);
        });

      });
    },

    followFile: function(fid, kind){
      var url = "/file/" + kind + ".json";
      smart.doput(url, {"fid": fid}, function(err, result){
        if(result.error){
          console.log(result); return;
        }

        $("#file_fl_"+fid).toggle();
        $("#file_unfl_"+fid).toggle();

      });
    },

    fileHistory: function(target){
      var self = this
        , fid = $(target).attr("fid")
        , url ="/file/history.json?fid=" + fid;

        smart.doget(url, function(err, result){
          

          var tmpl = $("#files-history-template").html()
            , container = $("#historylist");

          container.html("");
          _.each(result.items, function(file) {
            container.append(_.template(tmpl, {
                downloadId: file._id
              , extension: file.extension
              , title: file.filename
              , author: file.user.name.name_zh
              , at: smart.date(file.uploadDate)
            }));
          });

          var div = $("#fileHistory");
          div.show();
          console.log($(target).position());
          var position = $(target).position();
          position.top += 25;
          position.left -= 50;
          div.offset(position);
        });
    },

    updateFile: function(fid, file){
      var self = this;

      if (!file || file.length <= 0) {
        return false;
      }

      var fd = new FormData();
      fd.append("fid", fid);
      fd.append("files", file[0]);
      smart.dopostData("/file/upload.json", fd, function(err, result){
        if(err){
          console.log(result); return;
        }
        self.showFiles(1);
      });
    },

    downloadFile: function(downloadId){
      var self = this;
      var url = "/file/download.json?_id=" + downloadId;
      window.location.href = url;
      // var fileURL=window.open (url,"_blank","height=0,width=0,toolbar=no,menubar=no,scrollbars=no,resizable=on,location=no,status=no");
      // fileURL.document.execCommand("SaveAs");
      // fileURL.window.close();
      // fileURL.close();
    },



    previousAllPage: function() {
      this.allCollection.start -= this.allCollection.count;
      $(".all-users-pagination li").addClass("disabled");
      this.updateAllUsers();
      $(".all-users-pagination .next-page-btn").css("display", "inline-block");
    },
    
    nextAllPage: function() {
      this.allCollection.start += this.allCollection.count;
      $(".all-users-pagination li").addClass("disabled");
      this.updateAllUsers();
      $(".all-users-pagination .previous-page-btn").css("display", "inline-block");
    },

    previousMyPage: function() {
      this.myCollection.start -= this.myCollection.count;
      $(".following-users-pagination li").addClass("disabled");
      this.updateMyUsers();
      $(".following-users-pagination .next-page-btn").css("display", "inline-block");
    },
    
    nextMyPage: function() {
      this.myCollection.start += this.myCollection.count;
      $(".following-users-pagination li").addClass("disabled");
      this.updateMyUsers();
      $(".following-users-pagination .previous-page-btn").css("display", "inline-block");
    },

    updatePager: function(users, kind) {
      if (kind == "following") {
        kind = "following";
      } else{
        kind = "all";
      };
      if (users.start == 1) $("." +kind +"-users-pagination .previous-page-btn").css("display", "none");
      if (users.length == 0) alert("没有下一页了");
      if (users.length != users.count + 1) {
        $("." +kind +"-users-pagination .next-page-btn").css("display", "none");
      }else{
        users.pop();
      }
      $("." +kind +"-users-pagination li").removeClass("disabled");
    },

    updateValueToListHtml: function() {
      var self = this;
      var kind;

      this.allCollection.fetch({
        success: function() {
          kind = "allUser";
          self.updatePager(self.allCollection, kind);
          self.putData(self.allCollection, kind);
        },
      });


      this.myCollection.uids = this.model.get("follower");
      this.myCollection.fetch({
        success: function() {
          kind = "following";
          self.updatePager(self.myCollection, kind);
          self.putData(self.myCollection, kind);
        },
      });


    },

    changeIntoUnfollowBtn: function(){
      $(this).addClass("btn-danger");
      $(this).text("取消关注");
    },

    changeIntoFollowedBtn: function(){
      $(this).removeClass("btn-danger");
      $(this).text("已关注");
    },

    followUser: function(){
      var self = this;
      var uid = window.location.href.split("/")[4] ? window.location.href.split("/")[4] : $(this).parent().parent().attr("id").split("-")[1];
      
      $.post("/user/follow.json?_csrf=" + $("#_csrf").val()
            , {"uid": uid}
            , function(result){
              if (result.code === 200) {
                $(self).removeClass("btn-primary btn-tofollow");
                $(self).text("已关注");
                $(self).addClass("btn-followed");
              }else{
                alert("1111");
              };
        });
    },
    
    unfollowUser: function(){
      var self = this;
      var uid = window.location.href.split("/")[4] ? window.location.href.split("/")[4] : $(this).parent().parent().attr("id");
      $.post("/user/unfollow.json?_csrf=" + $("#_csrf").val()
            , {"uid": uid}
            , function(result){
              if (result.code === 200) {
                $(self).removeClass("btn-danger btn-followed");
                $(self).text("关注");
                $(self).addClass("btn-tofollow");
              }else{
                alert("111111");
              };
      });
    },

    follow: function(uid, func, from, option){
      var self = this
        , url = "/user/" + func + ".json"
        , isOwnHPage = ($("#userid").val() == self.model.get("_id"));

      smart.doput(url, {"uid": uid}, function(err, result){
        if(result.error){
          console.log(result); return;
        }

        if(from == "card"){

        } else if (from == "list") {
          if(func == "follow"){
            $("#"+option.kind+"_unfollow_"+uid).removeClass("hidden");
            $("#"+option.kind+"_follow_"+uid).addClass("hidden");
          }else{
            $("#"+option.kind+"_follow_"+uid).removeClass("hidden");
            $("#"+option.kind+"_unfollow_"+uid).addClass("hidden");
            if(isOwnHPage){
              $("#"+option.kind+"_follow_"+uid).parent().parent().remove();
            }
          }
          //self.showUsers(option.kind, option.firstLetter);
        }

      });

    },

    updateAllUsers: function(){
      var kind;
      var collection = window.user.allCollection;
      var view = window.user.view;
      if (this.innerText === "All") {
        collection.firstLetter = "";
      }else if (_.isEmpty(this.innerText)) {
        // do nothing
      }else{
        collection.firstLetter = this.innerText;
      };
      collection.uid = "";

      collection.fetch({
        success: function() {
          kind = "allUser";
          $("#all-users-container").html("");
          view.updatePager(collection, kind);
          view.putData(collection, kind);
        },
      });

    },

    updateMyUsers: function(){
      var kind;
      var collection = window.user.myCollection;
      var view = window.user.view;

      if (this.innerText === "All") {
        collection.firstLetter = "";
      }else if (_.isEmpty(this.innerText)) {
        // do nothing
      }else{
        collection.firstLetter = this.innerText;
      };
      collection.uid = $("#userid").val();

      collection.fetch({
        success: function() {
          kind = "following";
          $("#following-users-container").html("");
          view.updatePager(collection, kind);
          view.putData(collection, kind);
        },
      });

    },

    putData: function(collection, kind){
      var userId
        , userName
        , userPhoto
        , userLastestMessage
        , userTitle
        , tmpl
        , tmpldata;
      var myFollower =  this.model.get("follower");
      _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

      collection.each(function (user) {
        userId = user.get("_id");
        userName = user.get("uname").first;
        userPhoto = user.get("photo").small;
        userTitle = user.get("title");

        userLastestMessage = "shortmail";

        tmpl = $('#user-template').html();
        tmpldata = {id: userId
                  , uname: userName
                  , u_photo: userPhoto
                  , u_title: userTitle
                  , u_lastest_msg: userLastestMessage
                  };
        if (kind === "allUser") {
          $("#all-users-container").append(_.template(tmpl, tmpldata));
        } else{
          $("#following-users-container").append(_.template(tmpl, tmpldata));
        };

        if (userId === $("#userid").val()) {
          $("#user-" + userId + " .user-action a").addClass("disabled");
        }
        if (_.contains(myFollower, userId)) {
          $("#user-" + userId + " .user-action a:eq(1)").text("已关注");
          $("#user-" + userId + " .user-action a:eq(1)").removeClass("btn-tofollow");
          $("#user-" + userId + " .user-action a:eq(1)").addClass("btn-followed");
        };
      });

          
    },

    updateValueToUserHtml : function (){
      var self = this;
      var userid = window.location.href.split("/")[4];
      var loginid = $("#userid").val();

      $("#photo-btn-save").bind("click", this.savePhoto);
      if ($("title").text() === "个人主页") {
        if (_.isEmpty(userid) || userid === loginid) {
          $("#edit-btn").removeClass("hide");
        }else{
          $("#follow-btn").removeClass("hide");
          $("#send-message-btn").removeClass("hide");
        };

        // this.model.set("_id", loginid);
        self.model.fetch({
          success: function() {
            self.putDataIntoNavbar();
          },
        });

        if (userid) {
          self.model.set("_id", userid);
        }else{
          self.model.set("_id", loginid);
        }
        self.model.fetch({
          success: function() {
            var user = self.model.attributes;
            self.putDataIntoDetailPage(user);
          },
        });
      }else{
        $("#btn-save").bind("click", this.saveBasicInfo);
        $("#photo-upload").bind("change", function () {
            var files = this.files;
            self.uploadPhoto(files);
          });
        self.model.fetch({
          success: function() {
            var user = self.model.attributes;
            self.putDataIntoNavbar();
            self.putDataIntoEdtingPage(user);
          },
        });
      };
    },

    putDataIntoNavbar: function(){
      var photo = this.model.get("photo");
      if (photo) {
        $("#user-navbar-photo").attr("src","/picture/" + photo.small);
      }
    },

  	putDataIntoDetailPage: function (user){
      var self = this;
      //put data into html
      $(".user-name").text(user.uname.name_zh);
      $("#user-title").text(user.title);
      $(".user-telephone").text(user.tel.telephone);
      $("#user-email").text(user.email.email1);
      $("#user-microblog").text(user.custom.url);

      if (!_.isEmpty(user.photo)) {
        $(".user-photo").attr("src", "/picture/" + user.photo.big);
      }

      this.model.id = $("#userid").val();
      this.model.fetch({
        success: function() {
          var userId= window.location.href.split("/")[4];
          var myFollower =  self.model.get("follower");
          if (_.contains(myFollower, userId)) {
            $("#follow-btn").text("已关注");
            $("#follow-btn").removeClass("btn-tofollow");
            $("#follow-btn").addClass("btn-followed");
          };
        },
      });
      //添加言论
      window.message.api.updateValueToHtml(window.location.href.split("/")[4], null, null);
  	},

    putDataIntoEdtingPage: function (user){
      //put data into html

      $("#user-name").val(user.uname.name_zh);
      $("#user-title").val(user.title);
      $("#user-telephone").val(user.tel.telephone);
      $("#user-email").val(user.email.email1);

      //user-photo
      if (user.photo) {
      $("#big-photo").attr("src", "/picture/"+user.photo.big);
      $("#middle-photo").attr("src", "/picture/"+user.photo.middle);
      $("#small-photo").attr("src", "/picture/"+user.photo.small);
      };
    },

    saveBasicInfo: function(){
      var user = window.user.model.attributes;
      user.uname.name_zh = $("#user-name").val();
      user.title = $("#user-title").val();
      user.tel.telephone = $("#user-telephone").val();
      user.email.email1 = $("#user-email").val();
      window.user.model.save("","",{
        success: function() {
          $("#message-success").removeClass("hide");
        },
      });
    },

    uploadPhoto: function (files){
      var self = this;
      var fd = new FormData();

      for (var i = 0; i < files.length; i++) {
        fd.append("files", files[i]);
      }
      //再次上传时，Jcrop载入新图片
      if (jcrop_api) {
        jcrop_api.destroy();
      };
      $.ajax({
        url: "/user/upload_photo.json" + "?_csrf=" + $("#_csrf").val()
        , type: "POST"
        , async: false
        , data: fd
        , processData: false
        , contentType: false
      }).done(function(result) {
        pid = result.fid;

        $("#target-photo").attr("src", "/picture/"+pid);
        $("#big-photo").attr("src", "/picture/"+pid);
        $("#middle-photo").attr("src", "/picture/"+pid);
        $("#small-photo").attr("src", "/picture/"+pid);

      $("#target-photo").Jcrop({
        aspectRatio: 1,
        onSelect: self.changePreview,
        onChange: self.changePreview,
        bgColor:     'black',
        bgOpacity:   .6,
        setSelect:   [ 100, 100, 50, 50 ],
        },function(){
          // Use the API to get the real image size
          // Store the API in the jcrop_api variable
          jcrop_api = this;
          self.changePreview;
        });

      });
        //return res;

    },

    changePreview: function (c){
      if (jcrop_api) {
        var bounds = jcrop_api.getBounds();
          boundx = bounds[0];
          boundy = bounds[1];
      if (parseInt(c.w) > 0){
        //big-photo
        var rx = 180 / c.w;
        var ry = 180 / c.h;

        $('#big-photo').css({
          "max-width": "none",
          width: Math.round(rx * boundx) + 'px',
          height: Math.round(ry * boundy) + 'px',
          marginLeft: '-' + Math.round(rx * c.x) + 'px',
          marginTop: '-' + Math.round(ry * c.y) + 'px'
        });
        //middle-photo
        var rx = 50 / c.w;
        var ry = 50 / c.h;

        $('#middle-photo').css({
          "max-width": "none",
          width: Math.round(rx * boundx) + 'px',
          height: Math.round(ry * boundy) + 'px',
          marginLeft: '-' + Math.round(rx * c.x) + 'px',
          marginTop: '-' + Math.round(ry * c.y) + 'px'
        });
        //small-photo
        var rx = 30 / c.w;
        var ry = 30 / c.h;

        $('#small-photo').css({
          "max-width": "none",
          width: Math.round(rx * boundx) + 'px',
          height: Math.round(ry * boundy) + 'px',
          marginLeft: '-' + Math.round(rx * c.x) + 'px',
          marginTop: '-' + Math.round(ry * c.y) + 'px'
        });
      }
      };
      
    },

    savePhoto: function(){
      var select = jcrop_api.tellSelect();
      //我们看到的尺寸
      var width = $("#target-photo").width()
      //真实尺寸
      var img = $("#target-photo"); // Get my img elem
      var pic_real_width, pic_real_height;
      $(img).attr("src", $(img).attr("src")).load(
        function() {
          pic_real_width = this.width;
          var r = pic_real_width / width;
          $.post("/user/set_photo.json"+ "?_csrf=" + $("#_csrf").val()
            , { "fid": pid
                , "uid": "Sloan"
                , "x": select.x * r
                , "y": select.y * r
                , "width": select.w * r},
          function(result){
            alert("111");
          });
          });
      
    },
  });

})(user.view("user"));