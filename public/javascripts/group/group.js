
/**
 * 组MVC的初始化。
 */
var group = {

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

  var GroupListView = group.view("grouplist").View;
  var GroupEditorView = group.view("groupeditor").View;
  var GroupView = group.view("group").View;
  var GroupModel = group.model("group").Model;
  var GroupCollection = group.model("group").Collection;

  // 显示一个组的信息
  if (GroupView) {
    var groupId = $("#groupid").val();
    var m = new GroupModel({"_id": groupId});
    var v = new GroupView({model:m});
  }

  // 编辑组信息
  if (GroupEditorView) {
    var groupId = $("#groupid").val();
    var m = new GroupModel({"_id": groupId});
    var v = new GroupEditorView({model:m});
  }

  // 显示组一览
  if (GroupListView) {
    var c = new GroupCollection();
    var v = new GroupListView({collection:c});
  }
});
var jcrop_api;

