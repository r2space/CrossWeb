
(function(Board) {

  Board.View = Backbone.View.extend({
    
    el: $('#board'),
    
    initialize: function() {
      
      // bind this object
      _.bindAll(this, "render", "onSave", "onPublish"
        , "setSelectable"
        , "onTitleChange"
        , "addComponent"
        , "addGrid");

      $(window).bind("keydown", this.onKeydown);
      this.setSelectable($('#board'));

      $("#publish").bind("click", this.onPublish);
      $("#print").bind("click", this.onPrint);
      $("#save").bind("click", this.onSave);
      $("#close").bind("click", function() {
        window.location.href = "/files";
        return false;
      });
      $("#title").bind("change", this.onTitleChange);
      
      // get template
      var self = this;
      if ( !_.isEmpty(this.model.tmplid()) || !_.isEmpty(this.model.docid()) ) {
        this.model.fetch({
          error: function(){
            Alertify.log.error('error');
          }, 
          success: function() {
            self.render();
          }
        });
      }
      
      // set accordion
      $( "#accordion" ).accordion({ autoHeight: false });
    
    },

    render: function () {

      var self = this;
      $("#title").val(this.model.get("title"));
      
      _.each(this.model.get("item"), function(item){
        
        // 
        if (item.type === "label" || item.type === "text") {
          self.addComponent(item, self.model.itemvalue(item._id));
        }
        
        // 表格
        if (item.type === "grid") {
          self.addGrid(item);
        }

      });
    },
    
    addComponent: function(info, value) {

      var m, v, CompModel, CompView;

      // create component model
      CompModel = app.model("component").Model;
      m = new CompModel({_csrf: app.csrf(), _id: info._id}, {define: info, data: value});

      // create component view
      CompView = app.view("component").View;
      v = new CompView({model: m});
      
    },

    addGrid: function(info) {

      var m, v, CompModel, CompView;
      
      var self = this, m, v, CompModel, CompView, cellm = [];
      var cells = self.model.gridcell(info._id);
      
      CompModel = app.model("component").Model;
      CompView = app.view("component").View;

      // create cell M (Model生成以后，才能绘制Table，所以先生成Cell的Model)
      _.each(cells, function(cell){
        m = new CompModel({_csrf: app.csrf(), _id: cell._id}, {define: cell});
        cellm.push(m);
      });

      // create table MV (通过ComponentView将，Table和Cell加到Board上。然后在下面对Cell的View进行初始化)
      self.addComponent(info);
      
      // create cell V (Cell的HTML片段加到画面上以后，才能初始化View所以将Model的初始化分开)
      _.each(cellm, function(m){
        v = new CompView({model: m});
      });
    },
        
    /**
     * 出版
     */
    onPublish: function() {

      this.model.set("status", "Publish");

      try {
        this.model.save(this.model.toJSON(), {
          success: function () {
            Alertify.dialog.alert('success');
            window.location.href = "/files";
          },
          error: function () {
            Alertify.log.error('error');
          }
        });
      } catch(err) {
        console.log(err);
      }

      return false;
    },
    
    onPrint: function() {
      return false;
    },
    
    onSave: function() {
      
      var vals = [];
      var items = this.model.get("item");

      _.each(items, function(item) {
        vals.push({
          itemid: item._id,
          value: $("#" + item._id).val()
        });
      });
      
      this.model.set("value", vals);
      this.model.save();
      return false;
    },
    
    selectedItem: [],
    getSelectedItems: function() {
      return this.selectedItem;
    },
    setSelectedItems: function(item) {
      _.each(this.selectedItem, function(item) {
        item.removeClass("ui-selected");
      });
      item.addClass("ui-selected");

      this.selectedItem = [];
      return this.selectedItem.push(item);
    },
    setSelectable: function(item) {
      var self = this;

      item.selectable({
          filter: "div"
        , selected: function(e, ui) {
            var src = $(ui.selected);
            if (src.attr('id')) {
              self.selectedItem.push(src);
            }
        },
        unselected: function(e, ui) {
          self.selectedItem.splice( $.inArray(self.selectedItem, $(ui.unselected)), 1 );
        }
      });
    },
    
    onKeydown: function(e) {
      var c = e.keyCode
        , selected = window.board.active;

      if (!selected || _.isEmpty(selected)) {
        return;
      }

      if (selected.get("type") === "gridcell") {
        return;
      }

      if (c >= 37 && c <= 40) {
        var x = 0, y = 0;
        if (c == 38) { x = 0, y = -1; } // left
        if (c == 37) { x = -1, y = 0; } // up
        if (c == 39) { x = 1, y = 0; } // right
        if (c == 40) { x = 0, y = 1; } // down

        var item = $('#' + selected.id);
        var el = item.offset();

        item.offset({top: el.top + y, left: el.left + x});
        return false;
      }
    },
    
    onTitleChange: function() {
      if (this.model.isTemplate()) {
        this.model.set("title", event.target.value);
      }
      if (this.model.isDocument()) {
        var value = this.model.get("value") || {};
        value.title = event.target.value;
        this.model.set("value", value);
      }
    }
    
  });
  
})(app.view("board"));