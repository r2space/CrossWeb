
/**
 * 回复消息的Model
 */
(function(Reply) {

  // Define a Reply Message
	Reply.Model = Backbone.Model.extend({

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

  // Define a Reply Message list
	Reply.Collection = Backbone.Collection.extend({

		model: Reply.Model,
		mid: "",
    start: 0, 
    count: 10,
    total:"",

    urlRoot: "/message/list/reply.json",

    /**
     * 整合获取回复消息一览信息用的URL
     */
    url: function() {
      var result = this.urlRoot + "?start=" + this.start + "&count=" + this.count;

      if (this.mid.length > 0) {
        result += "&mid=" + this.mid;
      }

      return result;
    },

    /**
     * 初始化
     */
    initialize: function(models, options) {
      this.mid = options.mid;
		},

    /**
     * 将后台应答数据格式转换成Model的格式
     */
    parse: function(response) {
      this.total = response.data.total;
      return response.data.items;
    }

	});

})(message.model("reply"));