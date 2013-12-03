// Dialog to select the documents

(function(Menu) {
  
  // Define a content
  Menu.Model = Backbone.Model.extend({
    
    urlRoot: "/api/menu",
    url: function() {
      return this.urlRoot + "?_csrf=" + this.get("_csrf");
    },
    
    initialize: function(options) {
    },
    
    // model attributes
    defaults: {}

  });
  
  // Define a content list
  Menu.List = Backbone.Collection.extend({
    model: Menu.Model
  });
  
})(smart.model("menu"));