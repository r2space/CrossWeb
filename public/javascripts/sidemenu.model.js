// Dialog to select the documents

(function(Sidemenu) {
  
  // Define a sidemenu
  Sidemenu.Model = Backbone.Model.extend({
    
    sync: function(method, model, options){
      var name = "name=" + options.name;
      options.url = "/sidemenu.json?" + name;
      if(options.fetchAll) {
        options.url += "&fetchAll=true";
      }
      Backbone.sync(method, model, options);
    },

    initialize: function(options) {
    },
    
    // 
    parse: function(response) {
      // this.set("sidemenu", response.data);
      return response.data;
    }

  });
  
  // Define a sidemenu list
  Sidemenu.List = Backbone.Collection.extend({
    model: Sidemenu.Model
  });
  
})(smart.model("sidemenu"));
