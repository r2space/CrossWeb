
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

  // initialize component board.
  var BoardView = app.view("board").View;
  var BoardModel = app.model("board").Model;
  m = new BoardModel({_csrf: app.csrf(), mode: "document"});
  v = new BoardView({model: m});
  window.board = {model:m, view:v, active:{}};

  // Initialize your application here.

  $("input[name=size]").bind("change", function(){
    var item = $("#board"), w, h;
    w = $(this).attr("w");
    h = $(this).attr("h");

    item.css("width", w);
    item.css("height", h);
  });

  $("#close").bind("click", function(){
    window.location.href = "/files";
    return false;
  });

  $("#undo").bind("click", function(){

    // hrefの値を無視するように
    return false;
  });

});

