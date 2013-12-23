
(function(Sidemenu) {

  Sidemenu.View = Backbone.View.extend({
    
    el: $('#docmenu'),
    
    initialize: function() {
      _.bindAll(this, "render", "onMenuClick", "fetchAll");
      this.model.on("change", this.render);
      
      // 设定缺省的菜单项
      this.activeMenu = $("#allfiles");
      this.activeMenu.parent().addClass("active");
    },
    
    render: function () {
      var template = _.template($('#sidemenu-template').html());

      var sidemenu = this.model.attributes;
      // console.log("sidemenu：" + sidemenu);
      $("#sidemenu").html(template({"menus":sidemenu.items}));

      // 
      $("#sidemenu a").bind("click", this.onMenuClick);
      $("a[fetchAll]").unbind("click");
      $("a[fetchAll]").click(this.fetchAll);
    },

    onMenuClick: function() {
      var src = $(event.target);
        var item = src.attr("item")
        , type = src.attr("type");

      if (this.onSideMenuClicked) {
        this.onSideMenuClicked(item, type);
      }

      this.activeMenu.parent().removeClass("active");
      this.activeMenu = src;
      this.activeMenu.parent().addClass("active");

      return false;
    },

    fetchAll: function(event) {
      var src = $(event.target);
      var type = src.attr("type");
      if(type === 'user') {
        this.model.fetch({"name": 'user', "fetchAll": true});
      }
    },

    activeMenu: {}
    
  });

})(smart.view("sidemenu"));

