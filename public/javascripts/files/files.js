
// namespace
var files = {
    
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
  
  var FilesView = files.view("files").View;
  var FileDetailView = files.view("filedetail").View;

  var FilesModel = files.model("files").Model;
  var FilesCollection = files.model("files").Collection;

  if(FilesView){
    var c = new FilesCollection();
    var v = new FilesView({collection: c});
  }

  if(FileDetailView){
    var fileId = $("#fileid").val();
    var m = new FilesModel({"_id": fileId});
    var v = new FileDetailView({model:m});
  }

});

