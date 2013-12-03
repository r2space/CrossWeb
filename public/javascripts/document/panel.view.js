
/**
 * 侧面的组件选择面板，支持拖拽方式将组件添加到画面上。
 *  并创建组件关联的Model及View。
 */
(function(Panel) {

  Panel.View = Backbone.View.extend({
    
    el: $('#panel'),
    
    initialize: function() {
      
      _.bindAll(this, "render", "onDrop", "createComponent", "createGrid");
      
      // Use in jQuery, Drag and Drop API and the File API of HTML5
      jQuery.event.props.push('dataTransfer');
      
      // html5 native d&d attribute and events.
      $("#panel li").attr('draggable', true);
      $('#panel li').bind("dragstart", this.onDragstart);
      $('#board').bind("drop", this.onDrop);
      $('#board').bind("dragover", this.onDragover);
    },

    /**
     * Render
     */
    render: function () {
    },
    
    /**
     * HTML5 drag start event.
     */
    onDragstart: function() {
      var id = event.target.tagName == "IMG" ? event.target.parentNode.id : event.target.id;
      event.dataTransfer.setData("type", id);
      event.dataTransfer.effectAllowed = "copy";

      var img = $("#" + id + " img");
      event.dataTransfer.setDragImage(img[0], 24, 10);
    },
    
    /**
     * HTML5 drop event.
     */
    onDrop: function() {
      this.create(event);
      event.preventDefault();
    },
    
    /**
     * HTML5 drag over event.
     */
    onDragover: function() {
      event.preventDefault();
    },

    /**
     * 设定组件的缺省值，并创建组件
     * @param e
     * @param t
     */
    create: function(e) {
      var t = e.dataTransfer.getData("type")
        , info = app.model("component").structure(e.pageX, e.pageY, t);

      // 创建Model，并根据类型设定初期值
      if (t === "label") {
        info.design.bgcolor = "transparent";
        info.text = "Label";
        window.board.model.add(this.createComponent(info));
      }
      if (t === "text") {
        window.board.model.add(this.createComponent(info));
      }
      if (t === "graph") {
        info.design.position.width = 300;
        info.design.position.height = 250;
        window.board.model.add(this.createComponent(info));
      }
      if (t === "grid") {
        info.design.position.width = 500;
        info.design.position.height = 50;
        window.board.model.add(this.createGrid(info));
      }
      if (t === "image" || t === "video") {
        info.design.position.width = 300;
        info.design.position.height = 250;
        window.board.model.add(this.createComponent(info));
      }
    },
    
    /**
     * Add component to board model list
     * @param info
     */
    createComponent: function(info) {

      // create new id
      var m, v, CompModel, CompView;
      
      if (_.isUndefined(info._id)) {
        // info._id = "_" + (window.board.model.get("item").length + 1);
        info._id = _.uniqueId("_");
      }
      
      // create component model
      CompModel = app.model("component").Model;
      m = new CompModel({_csrf: app.csrf(), _id: info._id}, {define: info});

console.log(m);
      // create component view
      CompView = app.view("component").View;
      v = new CompView({model: m});
      
      return m;
    },
    
    createGrid: function(info) {
      
      // create new id
      var idx = window.board.model.get("item").length + 1, result = [];
      var self = this, m, v, CompModel, CompView, cellm = [];
      CompModel = app.model("component").Model;
      CompView = app.view("component").View;

      jQuery.ajax("/api/user/structure.json", {async: false}).done(function(data){
        _.each(data, function(column){
          var mod = app.model("component").structure(0, 0, "gridcell");
          mod._id = "_" + (idx++);
          mod.text = column.key;
          mod.validater[0].content = column.type;
          result.push(mod);
        });
      });
      
      // create cell MV
      _.each(result, function(cell){
        cell.owner = idx;
        m = new CompModel({_csrf: app.csrf(), _id: cell._id}, {define: cell});
        
        window.board.model.add(m);
        cellm.push(m);
      });

      // create table MV
      info._id = idx;
      var grid = this.createComponent(info);
      
      _.each(cellm, function(m){
        v = new CompView({model: m});
      });
      
      return grid;
    },
    
    createGraph: function() {
    }
    
  });
  
})(app.view("panel"));