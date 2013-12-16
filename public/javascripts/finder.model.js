
(function(Finder) {
  
  // Define a Finder
  Finder.Model = Backbone.Model.extend({
    
    urlRoot: "/search/user.json",
    
    initialize: function(options) {
    },
    
    url: function() {
      var url = this.urlRoot + "?keywords=" + this.keywords + "&scope=" + this.scope;
      url += "&limit" + (this.keywords ? Number.MAX_VALUE : 20);
      return url;
    },

    parse: function(response) {
      return response.data.items;
    },

    defaults: {
      keywords: ""
    , scope:""
    , date:""
    }

  });
  
})(smart.model("finder"));
