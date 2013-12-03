/**
 *
 *
 */
(function(MessageList) {

  MessageList.Model = Backbone.Model.extend({

    idAttribute: "_id",
    total: " ",
    items : [],
    start:0,
    limit:10,
    type:"at",
    curpage : 1,
    /**
     * 访问后台，存取数据
     */
    url: function() {
      if (this.type == "box"){
        return "/message/list/box.json?start="+this.start+"&&count="+this.limit;
      }
      return "/notification/list.json?type="+this.type+"&start="+this.start+"&limit="+this.limit;
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
        this.total = response.data.total;
        this.items = response.data.items;
        return response.data;
      }

      // 处理Collection的数据
      return response;
    }

  });
  
  // Define a content list
  MessageList.List = Backbone.Collection.extend({
    model: MessageList.Model
  });
})(messagelist.model("messagelist"));
