(function(UserList) {
  
  UserList.View = Backbone.View.extend({

    /**
     * 初始化
     */
    initialize: function(options) {
      var self = this;
      
      // Tab切换，显示用户
      $("#all").bind("click", function(){
        self.fetchUsers($(this).attr("id"));
      });

      self.fetchUsers("all");

      $("#searchBtn").click(function() {
        self.fetchUsers("all");
      });

      $("#searchInput").keypress(function(event) {
        if(event.which === 13) {
          self.fetchUsers("all");
        }
      });

      window.sidemenu.view.onSideMenuClicked = this.sideMenuClicked;
    },


    /**
     * 渲染画面
     */
    render: function() {
      var self = this
        , currentuser = $("#userid").val()
        , container = $("#" + this.kind + "Users");

      // 清除所有用户
      $("#allUsers").html("");

      if(self.collection.total > 0) {
        // 添加用户
        self.collection.each(function(user) {
          var uid = user.get("_id")
            , name = user.get("name")
            , photo = user.get("photo")
            , followed = user.get("followed")
            , isSelf = (currentuser == uid);

          container.append(_.template($('#user-template').html(), {
            "id": uid
            , "name": name.name_zh
            , "photo": (photo && photo.small) ? "/picture/" + photo.small : "/images/user.png"
            , "title": user.get("title")
            , "mail": user.get("email").email1
          }));

          if(!isSelf){
            $("#privatemsg_"+uid).removeClass("hidden");
            if(followed){
              $("#unfollow_"+uid).removeClass("hidden");
            }else{
              $("#follow_"+uid).removeClass("hidden");
            }
          }
        });

        var total = self.collection.total;
        var pagenum = self.collection.pagenum;

        smart.pagination(total, smart.defaultPageSize, pagenum, "pagination", function(pagenum){
          self.fetchUsers(self.kind, pagenum);
        });

      } else {
        $("#pagination").html("");
        smart.appendNoResultRow(container);
      }

      // 绑定 发私信，关注 按钮的事件
      $("#allUsers .btn").on("click", function(){
        var type = $(this).attr("name")
          , uid = $(this).attr("uid");

        if (type == "privatemsg") {
          smart.sendPrivateMessage(uid);
        }

        if (type == "follow") {
          self.follow(uid, type);
        }

        if (type == "unfollow") {
          self.follow(uid, type);
        }

        return false;
      });
    },

    sideMenuClicked: function(item, type) {
      
      // 部门的消息
      if (type == "user") {
        window.location = "/user/" + item;
      }
      return false;
    },


    /**
     * 检索组信息
     * kind : all - 全用户, my - 我关注的用户
     */
    fetchUsers: function(kind, pagenum) {

      var self = this;
      self.kind = kind;
      self.collection.kind = kind;
      self.collection.uid = $("#userid").val();
      self.collection.keywords = $("#searchInput").val();
      self.collection.pagenum = pagenum || 1;

      self.collection.fetch({
        success: function() {
          self.render();
        }
      });
    },


    /**
     * 添加关注
     */
    follow: function(uid, type){
      var self = this
        , url = "/user/" + type + ".json";
      

      smart.doput(url, {"_id": uid}, function(err, result){
        if (result.error) {
          console.log(result);
          alert(result);
          return;
        }

        if(type == "follow"){
          $("#unfollow_"+uid).removeClass("hidden");
          $("#follow_"+uid).addClass("hidden");
        }else{
          $("#follow_"+uid).removeClass("hidden");
          $("#unfollow_"+uid).addClass("hidden");
        }
        //self.fetchUsers(self.kind, self.firstLetter);
          //smart.sendNotification(uid, "关注了您", 3);
      });
    }

  });
})(user.view("userlist"));
