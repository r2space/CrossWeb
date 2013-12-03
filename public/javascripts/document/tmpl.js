
// namespace
var app = {
  
  /**
   * The global setting
   */
  init: function() {
    _.templateSettings = {
      interpolate : /\{\{(.+?)\}\}/gim,
      evaluate: /\<\$(.+?)\$\>/gim
    };
  }(),
  
  /**
   * Get csrf value
   * @returns csrf value
   */
  csrf: function() {
    return $("#_csrf").val();
  },
  
  /**
   * Create this closure to contain the cached models
   */
  model: function() {
    
    // Internal model cache.
    var models = {};
    
    // Create a new model reference scaffold or load an existing model.
    return function(name) {
      
      // If this model has already been created, return it.
      if (models[name]) {
        return models[name];
      }

      // Create a model and save it under this name
      return models[name] = {};
    };
  }(),
  
  /**
   * Create this closure to contain the cached views
   */
  view: function() {
	  
    var views = {};
    
    return function(name) {
      if (views[name]) {
        return views[name];
      }
      return views[name] = {};
    };
  }()
  
};

jQuery(function($) {

  var m, v;
	
  // 1. initialize side component panel.
  var PanelView = app.view("panel").View;
  var PanelModel = app.model("panel").Model;
  m = new PanelModel({_csrf: app.csrf()});
  v = new PanelView({model: m});
  window.panel = v;
  
  // 2. initialize toolbar.
  var ToolbarView = app.view("toolbar").View;
  v = new ToolbarView({model: {}});
  window.toolbar = {model:{}, view:v};
  
  // 3. initialize component board.
  var BoardView = app.view("board").View;
  var BoardModel = app.model("board").Model;
  m = new BoardModel({_csrf: app.csrf(), mode: "template"});
  v = new BoardView({model: m});
  window.board = {model:m, view:v, active:{}};

  // 4. initialize property setting.
  var SettingView = app.view("setting").View;
  var SettingModel = app.model("setting").Model;
  m = new SettingModel({_csrf: app.csrf()});
  v = new SettingView({model: m});
  window.setting = {model:m, view:v};

  //v.onMoreClick();
  
  // Initialize your application here.
  
  // -----------------------------------------
  // initResizableTableCell
  
  // $( "#debugmodel" ).accordion({ autoHeight: false });
  
  var pressed = false;
  var start = undefined;
  var startX, startWidth;
  
  $("table th").mousedown(function(e) {
    start = $(this);
    pressed = true;
    startX = e.pageX;
    startWidth = $(this).width();
    $(start).addClass("resizing");
  });
  
  $(document).mousemove(function(e) {
    if(pressed) {
      $(start).width(startWidth+(e.pageX-startX));
    }
  });
  
  $(document).mouseup(function() {
    if(pressed) {
      $(start).removeClass("resizing");
      pressed = false;
    }
  });
  
});
