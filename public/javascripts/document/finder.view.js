
/**
 * Dialog to select the documents
 */
(function(Finder) {
  
  // Define a finder
  Finder.View = Backbone.View.extend({
    
    el: $('#dialog'),
    
    initialize: function() {
      
      _.bindAll(this, "render", "rendercol", "renderdoc", "tocol", "todoc", "selectCol", "onCloseFinder");
      
      // render document list, column list.
      this.model.on("change:docs", this.renderdoc);
      this.model.on("change:cols", this.rendercol);
      
      // init jquery dialog
      $('#dialog').dialog({
        autoOpen: false, hide: "explode", minWidth: 400, modal: true//, height: 200
      });
      
      this.model.fetch({data: {type: "docs"}});
      
    },

    render: function () {
    },
    
    renderdoc: function () {
      
      var template = _.template($('#document-template').html());
      var json = this.model.get("docs");
      
      $('#doclist').append(template({
        data: json.result[0].doc,
        title: "Master relevant documents"
        }));
      $('#doclist').append(template({
        data: json.result[1].doc,
        title: "Imported from the external"
        }));
      $('#doclist').append(template({
        data: json.result[2].doc,
        title: "Ordinary documents"
        }));
      
      // 
      $('#doclist td').bind("click", this.tocol);
      
      $("#dialog").dialog("open");
    },
    
    rendercol: function() {
      
      var active = window.board.active;
      
      var items = this.model.get("cols").result;
      var template = _.template($('#column-template').html());
      
      $('#collist').empty();
      $('#collist').append(template(
        {
          title: active.get("source").document, 
          data: items
        }
      ));
      
      $('#collist td').bind("click", this.selectCol);
      $('#back').bind("click", this.todoc);
      $("#closefinder").bind("clikc", this.onCloseFinder);
      
      $("#dialog").dialog("open");
    },
    
    /**
     * Select a binding column
     */
    selectCol: function() {
      
      // get selected column (Not good)
      var selectedcol = event.target.parentElement.cells[2].innerText;

      // update model
      var active = window.board.active
        , source = active.get("source")
        , type = active.get("type");
      
      // 当对象控件为表格时，选中操作即改变表格的列
      if (type === "grid") {
        
        // 
        var column = app.model("component").structure(0, 0, "gridcell");
        var idx = window.board.model.get("item").length + 1;
        column._id = "_" + idx;
        column.title = selectedcol;
        column.owner = active.id;
        
        // create component model
        CompModel = app.model("component").Model;
        m = new CompModel({_csrf: app.csrf(), _id: column._id}, column);

        // create component view
        CompView = app.view("component").View;
        v = new CompView({model: m});
        
        window.board.model.add(m);

        // redraw grid
      }

      // 
      if (type === "label" || type === "text" || type === "gridcell") {
        source.item = selectedcol;
        active.trigger("change");
        $("#selectedColumn").html(selectedcol);
        
        this.onCloseFinder();
      }
      
    },
    
    onCloseFinder: function() {
      // close yourself.
      $("#dialog").dialog("close");
    },
    
    todoc: function() {
      $("#collist").hide("slide", { direction: "right" }, 100, function() {
        $("#doclist").show("slide", { direction: "left" }, 100, function() {
        });
      });
    },
    
    tocol: function() {
      
      // get selected document (Not good)
      var selecteddoc = event.target.parentElement.cells[2].innerText
        , docid = event.target.parentElement.id;
      
      // update selected document
      var active = window.board.active
        , source = active.get("source");
      source.document = selecteddoc;
      active.set("source", source);
      $("#selectedDocument").html(selecteddoc);
      
      // sow column list
      var model = this.model;
      $("#doclist").hide("slide", {}, 100, function() {
        $("#collist").show("slide", { direction: "right" }, 100, function() {
          model.fetch({data: {type: "cols", table: "document", id: docid}});
        });
      });
    },
    
    /**
     * show dialogbox
     */
    show: function() {
      $("#dialog").dialog("open");
    }

  });
  
  // Define a finder list
  Finder.List = Backbone.Collection.extend({
    view: Finder.View
  });
  
})(app.view("finder"));