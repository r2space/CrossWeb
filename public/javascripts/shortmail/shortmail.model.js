/**
 * shortmail的Model。负责私信user一览的数据。
 */
(function(ShortMail) {

  ShortMail.Model = Backbone.Model.extend({

    url: function() {
      return "/shortmail/users.json";
    },
    
    initialize: function() {
       this.set("_csrf", $("#_csrf").val());
    },
    
    // model attributes
    defaults: {}

  });
  
  // Define a content list
  ShortMail.List = Backbone.Collection.extend({
    model: ShortMail.Model
  });
})(shortmail.model("shortmail"));
