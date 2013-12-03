/**
 * 用户的Model。负责单个用户和用户一览数据。
 */
(function(User) {

  // Define a user
  User.Model = Backbone.Model.extend({

  	idAttribute: "_id",
    
    sync: function(_method, model, options) {

      var method = _method;

      if (method === "read") {
        
        // read
        options.url = "/user/get.json" + "?_id=" + this.id;

      } else {
        
        // update
        options.url = "/user/update.json";
      }
      
      Backbone.sync(method, model, options);
    },

    initialize: function() {
      this.set("_csrf", $("#_csrf").val());
    },

    /**
     * 将后台应答数据格式转换成Model的格式
     */
    parse: function(response) {
    	return response.data? response.data :response;
    }

  });

  // Define a user list
  User.Collection = Backbone.Collection.extend({

    model: User.Model,
    uid: "",
    firstLetter: "",
    start: 0,
    count: 20,
    kind: "all",
    urlRoot: "/user/list.json",

    /**
     * 整合获取组一览信息用的URL
     */
    url: function() {

      var result = this.urlRoot + "?start=" + this.start + "&count=" + this.count;

      if (this.uid.length > 0) {
        result += "&uid=" + this.uid;
      }

      if (this.firstLetter.length > 0) {
        result += "&firstLetter=" + this.firstLetter;
      }

      result += "&kind=" + this.kind;
      return result;
    },

    /**
     * 将后台应答数据格式转换成Model的格式
     */
    parse: function(response) {
      return response.data.items;
    }

  });
})(user.model("user"));
