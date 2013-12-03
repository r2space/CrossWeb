
(function(Searcher) {
  
  // Define a Searcher
  Searcher.Model = Backbone.Model.extend({
    
    urlRoot: "/search/quick.json",
    
    initialize: function(options) {
    },
    
    url: function() {
      return this.urlRoot + "?_csrf=" + this.get("_csrf") 
        + "&keywords=" + this.keywords
        + "&type=" + this.type;
    },

    parse: function(response) {
      return response.data.items;
    },
    
    defaults: {
        keywords: ""
      , type: "quick"
    }

  });
  
})(smart.model("searcher"));

