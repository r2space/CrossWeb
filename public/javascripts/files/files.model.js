// Dialog to select the documents

(function(Files) {
  
  // Define a files
  Files.Model = Backbone.Model.extend({

    idAttribute: "_id",

    sync: function(method, model, options){
      options.url = "/file/get.json?fid=" + this.id;
      Backbone.sync(method, model, options);
    },

    initialize: function(options) {
    },
    
    // 
    parse: function(response) {
      return response.data? response.data.items :response;
    }
  });
  
  // Define a files list
  Files.Collection = Backbone.Collection.extend({

    model: Files.Model,
    urlRoot: "/file/list.json",
    uid: "",
    page: 1,
    limit: 20,
    type: "application",

    /**
     * 整合获取组一览信息用的URL
     */
    url: function() {

      var result = this.urlRoot + "?start=" + (this.page-1)*this.limit + "&count=" + this.limit + "&type=" + this.type;

      if (this.uid.length > 0) {
        result += "&uid=" + this.uid;
      }

      return result;
    },

    /**
     * 将后台应答数据格式转换成Model的格式
     */
    parse: function(response) {
      this.total = response.data.total;
      return response.data.items;
    }

  });
  
})(files.model("files"));