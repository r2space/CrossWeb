
/**
 * 一个文书的Model。拥有所有组件的定义和值。
 *  文书功能中，非常重要的模块。
 *  模板编辑，文书编辑所用到的值都在这个Model中保持。
 *  负责将值发送到后台进行保存。
 */
(function(Board) {
  
  // Define a board
  Board.Model = Backbone.Model.extend({
    
    idAttribute: "_id",
    urlRoot: "/api/document",

    /**
     * 与后台同期，实现增删改查的前期处理。
     */
    sync: function(_method, model, options) {

      var method = _method
        , docid = this.docid()
        , tmplid = this.tmplid();

      // 检索
      if (method === "read") {
        
        // 获取文书，获取文书内容的同时会将模板的信息一并取来
        if (!_.isEmpty(docid)) {
          options.url = "/api/document/" + docid + "?_csrf=" + this.get("_csrf");
        }

        // 获取模板信息
        if (!_.isEmpty(tmplid)) {
          options.url = "/api/template/" + tmplid + "?_csrf=" + this.get("_csrf");
        }
      } else {

        // 创建文书
        if (this.isDocument() && _.isEmpty(docid)) {

          method = "create";
          options.url = "/api/document?_csrf=" + this.get("_csrf");
        }

        // 创建模板
        if (this.isTemplate() && _.isEmpty(tmplid)) {

          method = "create";
          options.url = "/api/document?_csrf=" + this.get("_csrf");
        }
        
        // 更新和删除
        if (method === "update" || method === "delete") {
          options.url = "/api/document/" + this.id + "?_csrf=" + this.get("_csrf");
        }
        
      }

      Backbone.sync(method, model, options);
    },
    
    initialize: function() {
      _.bindAll(this, "sync", "parse", "add", "parse"); 

      // 保存依赖的模板ID
      this.set("template", this.tmplid(), {silent: true});
    },

    parse: function(response) {
      
      // 组件所表示的值的信息，保存到value变量中
      this.set("value", response.data);
      console.log("--------");
      console.log(response.data);
      console.log(response.template);
      console.log("--------");

      // 通过返回值，设定模板信息
      if (response.method === "read"){
        return response.template;
      }
    },
    
    add: function(component) {
      
      var items = this.get("item");
      items.push(component.attributes);
    },

    /**
     * 获取指定ID的控件的值
     */
    itemvalue: function(itemid) {
      var result = {};

      if (this.get("value")) {
        _.each(this.get("value").items, function(item) {
          if (itemid === item.itemid) {
            result = item;
          }
        });
      }

      return result;
    },
    
    gridcell: function(grid) {

      var result = [];
      _.each(this.get("item"), function(obj){
        
        if (obj.type === "gridcell" && obj.owner === grid) {
          result.push(obj);
        }
      });
      
      return result;
    },
    
    docid: function() {
      return $("#docid").val();
    },

    tmplid: function() {
      return $("#tmplid").val();
    },
    
    isTemplate: function() {
      return this.get("mode") === "template";
    },

    isDocument: function() {
      return this.get("mode") === "document";
    },

    defaults: {
        docid: ""
      , title: ""
      , status: "Draft" // Publish
      , version: 0
      , layout: {
          width: 1024
        , height: 768
      }
      , item: []
      , category: ""
      , official: ""
      , description: ""
      , template: ""
      , mode: "design" // design, edit, view
      , value: {}
    }

  });
  
})(app.model("board"));