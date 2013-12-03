
// namespace
var topic = {
  
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

  var TopicView = topic.view("topic").View;
  var TopicModel = topic.model("topic").Model;
  var TopicCollection = topic.model("topic").Collection;
  
  var c1 = new TopicCollection();
  var c2 = new TopicCollection();
  var m = new TopicModel({"_id": window.location.href.split("/")[4]});
  var v = new TopicView({model:m, allCollection:c1, myCollection:c2});

  window.topic = {model:m, view:v, allCollection:c1, myCollection:c2};

});
