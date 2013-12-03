
/**
 * 组的Model。负责单个组和组一览数据。
 */
(function(Group) {
  
  // Define a Group
  Group.Model = Backbone.Model.extend({

    idAttribute: "_id",

    /**
     * 访问后台，存取数据
     */
    sync: function(_method, model, options) {

      var method = _.isEmpty(this.id) ? "create" : _method;

      if (method === "read") {
        options.url = "/group/get.json" + "?_id=" + this.id;
      } else if(method ==="create"){
        options.url = "/group/create.json";
      } else {
        options.url = "/group/update.json";
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
      // 直接访问API
      if (response.data) {
        return response.data;
      }

      // 处理Collection的数据
      return response;
    }

  });
  
  // Define a group list
  Group.Collection = Backbone.Collection.extend({

    model: Group.Model,

    start: 0,
    count: 20,
    firstLetter: "",
    type: "",

    urlRoot: "/group/list.json",

    /**
     * 整合获取组一览信息用的URL
     */
    url: function() {
      var result = this.urlRoot + "?start=" + this.start 
        + "&limit=" + this.count;

      if (this.firstLetter.length > 0) {
        result += "&firstLetter=" + this.firstLetter;
      }

      if (this.type.length > 0) {
        result += "&type=" + this.type;
      }

      return result;
    },

    /**
     * 将后台应答数据格式转换成Model的格式
     */
    parse: function(response) {
      return response.data.items;
    }
  });
  
})(group.model("group"));
