/**
 * 消息MVC的初始化。
 */
var message = {
  
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

  var MessageView = message.view("message").View;
  var MessageDetailView = message.view("messagedetail").View;
  var MessageModel = message.model("message").Model;
  var MessageCollection = message.model("message").Collection;

  if (MessageView) {
    var m = new MessageModel();
    var c = new MessageCollection();
    var v = new MessageView({model:m, collection:c});
  }

  if (MessageDetailView) {
    var v = new MessageDetailView();
  }


});
