
(function(Toolbar) {

  Toolbar.View = Backbone.View.extend({
    
    el: $('#toolbar'),
    
    initialize: function() {
      _.bindAll(this, "render", "onItemClick");
      $('#toolbar a').bind("click", this.onItemClick);
    },

    render: function () {
    },
    
    onItemClick: function() {
      var item = $(event.target)
        , id = item.attr("id");

      // 字体设定用面板
      if (id === "textExpander") {
        var setting = window.setting.view;
        if (setting.visible()) {
          setting.hide();
        } else {
          setting.show();
        }
        return false;
      }

      // 删除
      if (id === "delete") {
console.log(window.board.model);
        var items = window.board.model.get("item")
          , active = window.board.active

        var res = _.reject(items, function(item){
          return item._id === active.id;
        });
        
        window.board.model.set("item", res);
        $("#" + active.id).remove();
      }

      // 调整前后顺序
      if (id === "arrangeExpander") {
        var isVisible = $("#arrangeList").css("display") == "block";
        if (isVisible) {
          $("#arrangeList").hide();
        } else {
          $("#arrangeList").show();
        }
        return false;
      }

      if (id === "arrangeForwards" || id === "arrangeBackwards") {

        var items = window.board.model.get("item")
          , active = window.board.active
          , zindex, max_zindex = 1, min_zindex = -1;

        _.each(items, function(item){
          zindex = parseInt(item.design.position.z, 10);
          zindex = _.isNaN(zindex) ? 1 : zindex;
          max_zindex = (zindex && (zindex > max_zindex)) ? zindex : max_zindex;
          min_zindex = (zindex && (zindex < min_zindex)) ? zindex : min_zindex;
        });

        var design = active.get("design");
        design.position.z = id === "arrangeBackwards" ? min_zindex - 1 : max_zindex + 1;
        active.set("design", design);
        active.trigger('change');

        return false;
      }

      // 对齐
      if (id === "alignmentExpander") {

        //$("#alignmentExpander").parent().css("display", "none");

        var isVisible = $("#alignmentList").css("display") == "block";
        if (isVisible) {
          $("#alignmentList").hide();
        } else {
          $("#alignmentList").show();
        }
        return false;
      }

      if (id === "alignLeft") {
        var items = window.board.view.getSelectedItems();
        if (items.length > 1) {

          var top, left = items[0].offset().left;
          _.each(items, function(item){
            top = item.offset().top;
            item.offset({"left": left, "top": top});
          });
        }
      }
      if (id === "alignRight") {
        var items = window.board.view.getSelectedItems();
        if (items.length > 1) {

          var first = items[0]
            , basic = {"left": first.offset().left, "width": first.width()}
            , top, left;
          _.each(items, function(item){
            top = item.offset().top;
            left = basic.left + basic.width - item.width();
            item.offset({"left": left, "top": top});
          });
        }
      }

      if (id === "alignCenter") {
        var items = window.board.view.getSelectedItems();
        if (items.length > 1) {

          var first = items[0]
            , basic = {"left": first.offset().left, "width": first.width()}
            , top, left;
          _.each(items, function(item){
            top = item.offset().top;
            left = basic.left + (basic.width / 2) - (item.width() / 2);
            item.offset({"left": left, "top": top});
          });
        }
      }

      return false;
    },

    // setting: {},
    
    show: function(l, t, w, h) {
      window.setting.view.hide();
      $('#toolbar').offset({left: l + w + 10, top: t});
      $('#toolbar').show();
    },
    
    hide: function() {
      $('#toolbar').offset({left: 0, top: 0});
      $('#toolbar').hide();
    }
    
  });
  
})(app.view("toolbar"));