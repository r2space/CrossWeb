
/**
 * 控件的详细设定画面.
 */
(function(Setting) {

  Setting.View = Backbone.View.extend({
    
    el: '#setting',
    
    initialize: function() {
      
      _.bindAll(this, "render", "show", "initColorPanel", "onMoreClick"
        , "onColorClick"
        , "onTextChange"
        , "onFontChange"
        , "onFontSizeChange"
        , "onBgColorClick"
        , "onHeightChange"
        , "onWidthChange"
        , "onBorderChange"
        , "onDocChange"
        );

      this.initColorPanel($("#color"), $("#setting_color"), this.setColor);
      this.initColorPanel($("#bgcolor"), $("#setting_bgcolor"), this.setBgColor);
      
      $("#setting_color").bind("click", this.onColorClick);
      $("#setting_text").bind("change", this.onTextChange);
      $("#setting_font").bind("change", this.onFontChange);
      $("#setting_font_size").bind("change", this.onFontSizeChange);
      $("#setting_bgcolor").bind("click", this.onBgColorClick);
      $("#setting_height").bind("change", this.onHeightChange);
      $("#setting_width").bind("change", this.onWidthChange);
      $("#setting_border").bind("change", this.onBorderChange);
      $("#setting_doc").bind("change", this.onDocChange);

      
      $("#modelmore").bind("click", this.onMoreClick);
      this.model.on("change", this.render);
    },
    
    render: function () {
      
      var active = window.board.active
        , text = active.get("text")
        , source = active.get("source")
        , design = active.get("design");
      
      $("#setting_text").val(text);
      $("#setting_font").val(design.font.name);
      $("#setting_color").val(design.font.color);
      $("#setting_font_size").val(design.font.size);
      $("#setting_bgcolor").val(design.bgcolor);
      $("#setting_height").val(design.position.height);
      $("#setting_width").val(design.position.width);
      $("#setting_doc").val(source.document);
      
      $("#selectedDocument").html(source.document);
      $("#selectedColumn").html(source.item);
    },
    
    show: function() {
      
      this.render();
      
      var p = $('#toolbar').offset();
      $(this.el).css({left: p.left + 20, top: p.top + 50});
      $(this.el).show();
    },
    
    hide: function() {
      $(this.el).hide();
    },
    
    visible: function() {
      return $(this.el).is(":visible")
    },
    
    onMoreClick: function() {

      if (window.finder) {
        window.finder.view.show();
        return false;
      }

      var m, v, FinderModel, FinderView;
      
      // Find a document to be trying to concatenate
      FinderModel = app.model("finder").Model;
      FinderView = app.view("finder").View;
      m = new FinderModel();
      v = new FinderView({model: m});
      
      window.finder = {model:m, view:v};
      window.finder.view.show();
      
      // fetch document list & show
      // m.fetch({data: {type: "docs"}});
      // v.show();
      return false;
    },
    
    onColorClick: function() {
      
      var item = $(this.el), pos = item.offset(), w = item.width()
        , bgcolor = $("#bgcolor"), color = $("#color");

      if (color.is(":visible")) {
        color.hide();
      } else {
        bgcolor.hide();
        color.css({top: pos.top + 60, left: pos.left + w + 10});
        color.show();
      }
    },

    setColor: function(color) {

      var active = window.board.active;
      if (_.isEmpty(active)) { return }
      
      var design = active.get("design");
      design.font.color = color;
      active.design = design;
      active.trigger('change');
    },
    
    onTextChange: function() {
      
      var active = window.board.active;
      if (_.isEmpty(active)) { return }
      
      active.set("text", event.target.value);
      active.trigger('change');
    },

    onFontChange: function() {

      var design, active = window.board.active;
      if (_.isEmpty(active)) { return }

      design = active.get("design");
      design.font.name = event.target.value;
      
      active.design = design;
      active.trigger('change');
    },
    
    onFontSizeChange: function() {

      var design, active = window.board.active;
      if (_.isEmpty(active)) { return }

      design = active.get("design");
      design.font.size = event.target.value;
      
      active.design = design;
      active.trigger('change');
    },
    
    onBgColorClick: function() {
      var item = $(this.el), pos = item.offset(), w = item.width()
        , bgcolor = $("#bgcolor"), color = $("#color");

      if (bgcolor.is(":visible")) {
        bgcolor.hide();
      } else {
        color.hide();
        bgcolor.css({top: pos.top + 160, left: pos.left + w + 10});
        bgcolor.show();
      }
    },
    setBgColor: function(color) {
      var active = window.board.active;
      if (_.isEmpty(active)) { return }
      
      var design = active.get("design");
      design.bgcolor = color;
      active.design = design;
      active.trigger('change');
    },

    onHeightChange: function() {
    },
    
    onWidthChange: function() {
    },
    
    onBorderChange: function() {
    },

    onDocChange: function() {
      var active = window.board.active;
      if (_.isEmpty(active)) { return }
      
      var source = active.get("source");
      source.document = $(event.target).val();
      active.set("source", source);
    },
    
    initColorPanel: function(picker, pickertext, collback) {
      
      pickertext.css("background-color", "#00CC00");
      picker.wColorPicker({

        initColor: '#00CC00',
        onSelect:function(color){
          collback(color);
          pickertext.css("background-color", color);
        },
        mode: 'flat',
        effect: 'fade',
        color: 'blue'
      });
    }
    
    
  });
  
})(app.view("setting"));

