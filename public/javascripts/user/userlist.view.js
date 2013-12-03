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

      // 首字母过滤
      $("#allFilter").bind("click", function(){
        self.fetchUsers(self.kind, $(event.target).html());
      });

      self.fetchUsers("all");
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
          , "photo": photo ? "/picture/" + photo.big : "/images/user.png"
          , "title": user.get("title")
          , "mail": user.get("uid")
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
    fetchUsers: function(kind, firstLetter) {

      var self = this;

      self.kind = kind;
      self.firstLetter = firstLetter

      self.collection.kind = kind;
      self.collection.uid = $("#userid").val();
      self.collection.firstLetter = (firstLetter && firstLetter != "All") ? firstLetter : "";

      self.collection.fetch({
        success: function() {
          self.render();
        },
      });
    },


    /**
     * 添加关注
     */
    follow: function(uid, type){
      var self = this
        , url = "/user/" + type + ".json";
      

      smart.doput(url, {"uid": uid}, function(err, result){
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
