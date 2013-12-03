
/**
 * 用户MVC的初始化
 */
var user = {
  
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

  var UserListView = user.view("userlist").View;
  var UserEditView = user.view("useredit").View;
  var UserView = user.view("user").View;
  var UserModel = user.model("user").Model;
  var UserCollection = user.model("user").Collection;
  
  // 用户详细画面
  if (UserView) {
    var userid = $("#userid").val();
    var m  = new UserModel({"_id": userid});
    var v = new UserView({model:m});
  }

  // 用户编辑画面
  if (UserEditView) {
    var userid = $("#userid").val();
    var m  = new UserModel({"_id": userid});
    var v = new UserEditView({model:m});
  }

  // 用户一览画面
  if (UserListView) {
    var c = new UserCollection();
    var v = new UserListView({collection: c});
  }
});
var jcrop_api;
