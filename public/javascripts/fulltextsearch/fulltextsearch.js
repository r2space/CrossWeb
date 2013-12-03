
/**
 * 组MVC的初始化。
 */
var fulltextsearch = {

  init: function() {
    
    _.templateSettings = {
      interpolate : /\{\{(.+?)\}\}/gim,
      evaluate: /\<\$(.+?)\$\>/gim
    };
  }(),
  
  // Create this closure to contain the cached models
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
  
  // Create this closure to contain the cached views
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

  var FulltextSearchView = fulltextsearch.view("fulltextsearch").View;
  var FulltextSearchModel = fulltextsearch.model("fulltextsearch").Model;

  var m = new FulltextSearchModel();
  var v = new FulltextSearchView({model:m});

});


