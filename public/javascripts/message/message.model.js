
/**
 * 消息的Model。负责单个消息和消息一览数据。
 */
(function(Message) {

  // Define a Message
	Message.Model = Backbone.Model.extend({

    idAttribute: "_id",

    /**
     * 访问后台，存取数据
     */
    sync: function(_method, model, options) {

      var method = _.isEmpty(this.id) ? "create" : _method;

      if (method === "read") {
        options.url = "/message/list/home.json" + "?_id=" + this.id;
      } else if(method ==="create"){
        options.url = "/message/create.json";
      } else {
        options.url = "/message/update.json";
      }
      
      Backbone.sync(method, model, options);
    },

    /**
     * 初始化 Csrf Token
     */
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

  // Define a Message list
	Message.Collection = Backbone.Collection.extend({

		model: Message.Model,
		uid: "",
		gid: "",
		tid: "",
    start: 0, 
    count: 20,
    total:"",
    timeline : 0,

    urlRoot: "/message/list/home.json",

    /**
     * 整合获取消息一览信息用的URL
     */
    url: function() {

      var result = this.urlRoot + "?start=" + this.start + "&count=" + this.count;

      if (this.uid.length > 0) {
        result += "&uid=" + this.uid;
      }

      if (this.uid.length > 0) {
        result += "&uid=" + this.uid;
      }

      if (this.gid.length > 0) {
        result += "&uid=" + this.uid;
      }

      if (this.tid.length > 0) {
        result += "&uid=" + this.uid;
      }

      return result;
    },

    /**
     * 将后台应答数据格式转换成Model的格式
     */
    parse: function(response) {
      this.total = response.data.total;
      this.timeline = response.data.timeline
      return response.data.items;
    }

	});

})(message.model("message"));

