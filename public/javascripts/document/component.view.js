
/**
 * 画面上的一个组件的View，
 *  负责实际的添加控件任务，
 *  各种事件的处理（值的变更，拖动，属性变更等）
 */
(function(Component) {
  
  Component.View = Backbone.View.extend({
    
    el: "#accordion",
    
    initialize: function(options) {
      
      _.bindAll(this, "render", "setDraggable", "onClick", "onValueChange");
      this.model.on("change", this.render);
      
      var id = this.model.id
        , src = $("#" + id)
        , type = this.model.get("type");

      // 创建组件
      if (src.length <= 0) {
        
        var tmpl, tmpldata, item;
        if (type === "label") {
          this.label = new Label(this.model);
          this.label.create();
        }

        if (type === "text") {
          this.text = new Text(this.model);
          this.text.create();
          this.text.onchange(this.onValueChange);
        }

        if (type === "grid") {
          this.grid = new Grid(this.model);
          this.grid.create();

          // 获取Grid的数据
          if (window.board.model.isDocument()) {

            // Grid绑定的Collection名称
            var collection = this.model.get("source").document
              , id = this.model.id
              , cols = ["editat", "editby", "active", "uname.first", "email.email1", "address.country"];

            // 泛用检索
            // TODO: 添加给后台的参数，给定选择的项目
            jQuery.ajax(
                "/api/collections"
              , {async: false, data: {table: collection, field: cols}}).done(function(rows){

              var template = $("#grid_value_template").html()
                , tbl = $("#" + id + " tbody")

              tbl.append(_.template(template, {_rows: rows, _cols: cols}));
            });
          }
        }

        if (type === "graph") {
          this.graph = new Graph(this.model);
          this.graph.create();
        }

        if (type === "video") {
          this.video = new Video(this.model);
          this.video.create();
        }

        if (type === "image") {
          this.image = new Image(this.model);
          this.image.create();
        }

      }
      
      // 只有在文书设计模式下，才可以移动控件位置，设定控件的属性等
      if (window.board.model.isTemplate()) {
        src = $("#" + id);
        // src.bind("click", this.onClick);
        src.bind("mousedown", this.onClick);
        
        if (type !== "gridcell") {
          this.setDraggable(src);
          this.setResizable(src);
        }
      }
      
      this.render();
      
    },
    
    /**
     * 根据属性，调整组件的显示。如，位置和大小还有颜色等。
     */
    render: function() {
      var type = this.model.get("type");

      if (type === "label") {
        this.label.draw();
      }
      if (type == "text") {
        this.text.draw();
      }
      if (type == "grid") {
        this.grid.draw();
      }
      if (type == "gridcell") {
        new GridCell(this.model.attributes).draw();
      }
      if (type == "graph") {
        this.graph.draw();
      }
      
      // font.color
      return this; // This is conventional
    },
    
    /**
     * 组件的值发生变化时，将变更保存到Model中
     */
    onValueChange: function() {
      var id = event.target.id
        , val = event.target.value
        , board = window.board.model
        , vals = board.get("value")
        , changedItemData;

      vals = vals || {};
      vals.items = vals.items || [];

      // 找出发生变化的对象数据
      _.each(vals.items, function(item){
        if (item.itemid === id) {
          changedItemData = item;
        }
      });

      // 修改内容
      if (changedItemData) {
        changedItemData.value = val;
      } else {
        vals.items.push({itemid: id, value: val, at: new Date()});
      }

      board.set("value", vals, {silent: true});
    },

    /**
     * 选中控件，显示工具栏
     */
    onClick: function() {
      
      var item = $(event.target), pos = item.offset();

      // show toolbar
      window.toolbar.view.show(pos.left, pos.top, item.width(), item.height());
      
      // set active component
      window.board.active = this.model;

      // set selected
      if (item.attr("id")) {
        window.board.view.setSelectedItems(item);
      }
      
      // stop DOM event tree
      event.target.focus();
      event.stopPropagation();

      return false;
    },
    
    setResizable: function(item) {
      item.resizable({
          autoHide: true
        , ghost: true
        , grid: [5, 5]
        , handles: "n, e, s, w"
      });
    },
    
    offsetBy: {top: 0, left: 0},
    setDraggable: function(item) {
      item.draggable({
        snap: true, containment: '#board', grid: [5, 5]
      });

      // 以下为了实现复数个组件，一起移动的操作。由于与选择事件冲突，先注释掉
      // var self = this;
      // item.draggable({
      //   snap: true, containment: '#board', grid: [5, 5],

      //   // 记录被选中组件的        
      //   start: function(e, ui) {
      //     self.offsetBy = $(this).offset();
      //   },
        
      //   // 移动，按被移动的组件，移动所有其他项目
      //   drag: function(e, ui) {
      //     var pos = $(this).offset();
      //     var dt = pos.top - self.offsetBy.top, dl = pos.left - self.offsetBy.left;

      //     var selected = $(window.board.view.getSelectedItems());
      //     selected.not(this).each(function() {
      //       var el = $(this).offset();
      //       $(this).offset({top: el.top + dt, left: el.left + dl});
      //     });
      //     self.offsetBy = pos;
      //   },

      //   // 移动组件后，保存组件的坐标
      //   stop: function(e, ui) {
      //     self.offsetBy = {top:0, left:0};
          
      //     var design = self.model.get("design");
      //     design.position.x = $(this).offset().left;
      //     design.position.y = $(this).offset().top;
      //     self.model.set("design", design);
      //   }
      // });
      
    }
    
  });
  
})(app.view("component"));

