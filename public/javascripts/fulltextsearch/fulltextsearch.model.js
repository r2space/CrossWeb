
/**
 * 组的Model。负责单个组和组一览数据。
 */
(function(FulltextSearch) {
  
  // Define a Search
  FulltextSearch.Model = Backbone.Model.extend({

    idAttribute: "_id",

    initialize: function() {
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
  
  // Define a search list
  FulltextSearch.Collection = Backbone.Collection.extend({

    model: FulltextSearch.Model,

    /**
     * 将后台应答数据格式转换成Model的格式
     */
    parse: function(response) {
      return response.data.items;
    }
  });
  
})(fulltextsearch.model("fulltextsearch"));
