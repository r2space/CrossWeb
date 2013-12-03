
(function(Finder) {
  
  // Define a Finder
  Finder.Model = Backbone.Model.extend({
    
    urlRoot: "/search/user.json",
    
    initialize: function(options) {
    },
    
    url: function() {
      return this.urlRoot + "?keywords=" + this.keywords + "&scope=" + this.scope;
    },

    parse: function(response) {
      return response.data.items;
    },

    defaults: {
      keywords: ""
    , scope:""
    }

  });
  
})(smart.model("finder"));
