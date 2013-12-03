(function(Topic) {
  
  // Dependencies
  // var Finder = app.model("finder").Model;
  // console.log(new Finder().hello());
  
  // Define a component
  Topic.Model = Backbone.Model.extend({

    idAttribute: "_id",
    sync: function(_method, model, options) {

      var tid = this.id;
      var method = _.isEmpty(tid) ? "create" : _method;

      if (method === "read") {
        
        // read
        options.url = "/topic/get.json" + "?_id=" + tid;

      } else if(method ==="create"){
        
        options.url = "/topic/create.json";

      } else {
        
        // update
        options.url = "/topic/update.json";
      }
      
      Backbone.sync(method, model, options);
    },

    initialize: function() {
      this.set("_csrf", $("#_csrf").val());
    },
    
  });
  
  // Define a component list
  Topic.Collection = Backbone.Collection.extend({

    model: Topic.Model,

    urlRoot: "/topic/list.json",

    //uid:"505c092e54f35e414c000008",
    uid:"",

    firstLetter: "",

    start: 1,

    count: 20,

    url: function() {
      return this.urlRoot + "?_csrf=" + $("#_csrf").val() + "&uid=" + this.uid + "&firstLetter=" + this.firstLetter + "&start=" + this.start  + "&count=" + (this.count + 1);
    },

  });
  
})(topic.model("topic"));
