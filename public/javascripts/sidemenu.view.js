
(function(Sidemenu) {

  Sidemenu.View = Backbone.View.extend({
    
    el: $('#docmenu'),
    
    initialize: function() {
      _.bindAll(this, "render", "onMenuClick");
      this.model.on("change", this.render);
      
      // 设定缺省的菜单项
      this.activeMenu = $("#allfiles");
      this.activeMenu.parent().addClass("active");
    },
    
    render: function () {
      var template = _.template($('#sidemenu-template').html());

      var sidemenu = this.model.attributes;
      // console.log("sidemenu：" + sidemenu);
      $("#sidemenu").append(template({"menus":sidemenu}));

      // 
      $("#sidemenu a").bind("click", this.onMenuClick);
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

    activeMenu: {}
    
  });

})(smart.view("sidemenu"));

