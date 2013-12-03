
/**
 * 
 */
(function(Finder) {

	Finder.Model = Backbone.Model.extend({
    
    initialize: function() {
    },
    
    urlRoot: "/api/template/list.json",
    url: function() {
      return this.urlRoot + "?_csrf=" + this.get("_csrf");
    },
    
    parse: function(response) {
      if (response.type == "docs") {
        this.set({docs: response});
      } else {
        this.set({cols: response});
      }
    }
    
    
  });
  
})(app.model("finder"));
