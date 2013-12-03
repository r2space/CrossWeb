
/**
 * 搜索用户，组
 */
(function(Finder) {

  Finder.View = Backbone.View.extend({
    
    /**
     * 初始化
     */
    initialize: function() {
      _.bindAll(this, "render", "onSearch", "onPreSearch");
      this.model.on("change", this.render);
    },

    /**
     * 显示用户一览
     */
    render: function () {
      
      var self = this
        , users = this.model.get("user")
        , groups = this.model.get("group")
        , tmpl = $('#_findresult-template').html()
        , resultlist = $('#_findresult ul')
        , finder = $('#_findresult');
      
      resultlist.empty();
      finder.hide();

      if (users.length <= 0 && groups.length <= 0) {
        return false;
      }

      _.each(users, function(user){
        var name = user.name.name_zh
          , photo = (user.photo && user.photo.small) ? "/picture/" + user.photo.small : "/images/user.png";
        resultlist.append(_.template(tmpl, {
          "id": user._id, "name": name, "photo": photo, "addition": user.title, "type": "user"
        }));
      });

      _.each(groups, function(group){
        var photo = (group.photo && group.photo.small) ? "/picture/" + group.photo.small : "/images/user.png";
        resultlist.append(_.template(tmpl, {
          "id": group._id, "name": group.name.name_zh, "photo": photo, "addition": "组/部门", "type": "group"
        }));
      });

      // 用户一览中选择用户的事件
      $('#_findresult li').bind("click", function(){
        if (self.onUserSelected) {
          var target = $(this).find("a");
          var uid = target.attr("uid")
            , type = target.attr("type")
            , uname = target.attr("uname");
          self.onUserSelected(uid, uname, type, self.src);
        }

        $('#_findresult').hide();
        return false;
      });

      finder.css("top", self.src.offset().top + 31);
      finder.css("left", self.src.offset().left);
      finder.show();
    },

    /**
     * 绑定给定组件的键盘敲击事件
     */
    bindSearchBox: function(items) {
      var self = this;
      _.each(items, function(item) {
        $(item).on("keydown", self.onPreSearch);
        $(item).on("keyup", self.onSearch);
      });
    },
        
    /**
     * 检索用户
     */
    onPreSearch: function() {

      this.src = $(event.target);

      var inputValue = this.src.val()
        , c = event.keyCode;

      if (c == 8 && inputValue.length <= 0 && this.src.prev().is("ol")) {
        this.src.prev().remove();
      }
    },
    onSearch: function() {
      
      if (!this.src) {return;}

      var inputValue = this.src.val()
        , keywords = this.model.keywords
        , scope = this.src.attr("scope");

      // 关键字为空
      if (inputValue.length <= 0) {
        this.model.keywords = "";
        this.model.clear({silent: true});
        $('#_findresult').hide();
        return;
      }
      
      // 关键字发生变化
      if (inputValue !== keywords) {
        this.model.scope = scope;
        this.model.keywords = inputValue;
        this.model.fetch();
      }
    }

  });
  
})(smart.view("finder"));

