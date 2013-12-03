
/**
 * 
 */
(function(Component) {
  
  Component.Model = Backbone.Model.extend({
    
    idAttribute: "_id",
    
    /**
     * 用指定的值，初始化组件的Model。同时，将组件的值保存到Model的value中
     */
    initialize: function(attrs, options) {
      this.attributes = options.define;
      this.set("value", options.data);
    },
    
    urlRoot: "/document/deflist.json",
    url: function() {
      return this.urlRoot + "?_csrf=" + this.get("_csrf");
    },
    
    /**
     * 
     */
    parse: function(response) {
      if (response.type == "docs") {
        this.set({docs: response});
      } else {
        this.set({cols: response});
      }
    },
    
    /**
     * set x and y.
     */
    setPosition: function(_pos) {
      
      var design = this.get("design");
      
      var newpos = new Object();
      newpos.width = design.position.width;
      newpos.height = design.position.height;
      newpos.x =_pos.x;
      newpos.y =_pos.y;
      
      // TODO: ? clone ?
      design.position = newpos;
      this.set("design", _.clone(design));
    },
    
    /**
     * set width and height.
     */
    setSize: function(_size) {
        var design = this.get("design");
        design.position.width =_size.width;
        design.position.height =_size.height;
        
        // TODO: ? clone ?
        this.set("design", _.clone(design));
    }
  
    // model attributes    
  });
  
  /**
   * 生成组件的空数据结构
   */
  Component.structure = function(_x, _y, _type) {
    return {
        type: _type
      , text: ""
      , index: 1
      , owner: ""
      , design: {
          position: {x: _x, y: _y, z: 1, width: 100, height: 30}
        , font: {name: "Lucida Grande", size: "12px", color: "#000000"}
        , bgcolor: "#fffdfd"
      }
      , source: {
          document: ""
        , item: ""
        , join: [
          {
              srcDoc: ""
            , srcItem: ""
            , targetDoc: ""
            , targetItem: ""
            , condition: "="
          }
        ]
      }
      , filter: [
        {
            source: {document: "", item: ""}
          , join: {}
          , condition: {}
          , compute: {}
        }
      ]
      , validater: [
        {
            type: "require"
          , scope: ">10"
          , content: "String"
          , format: "yyyy/mm/dd"
        }
      ]
      , default: ""
    } 
  };

  // Define a component list
  Component.List = Backbone.Collection.extend({
    model: Component.Model
  });
    
})(app.model("component"));
