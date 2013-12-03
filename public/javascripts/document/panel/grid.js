
/**
 * 构造函数
 */
function Grid(model) {

  this.id = model.get("_id");
  this.model = model;
  this.tmplate = $("#grid_template").html();

  // cell 从Board里取？
  this.cells = window.board.model.gridcell(this.id);
};


Grid.prototype.create = function() {
  $("#board").append(_.template(this.tmplate, {_id: this.id, _cols: this.cells}));
};


/**
 * 设置表格属性
 */
Grid.prototype.draw = function() {

  var tbl = $("#" + this.id)
    , design = this.model.get("design")
    , pos = design.position;

  tbl.offset({top: pos.y, left: pos.x});
  tbl.width(pos.width);
  tbl.height(pos.height);

  var self = this;
  _.each(this.cells, function(obj){
    // self.drawcell(obj);
    new GridCell(obj).draw();
  });
};

/**
 * 表格里的单元格
 */
function GridCell(model) {
  this.model = model;
};

/**
 * 设置表单元格属性
 */
GridCell.prototype.draw = function() {

  var cell = $("#" + this.model._id)
    , cellspan = $("#" + this.model._id + " span")
    , design = this.model.design
    , text = this.model.text;

  if (cell.length > 0) {
    cellspan.html(text);
    cellspan.css("font-family", design.font.name);
    cellspan.css("font-size", design.font.size);
    cellspan.css("color", design.font.color);
    cell.css("background-color", design.bgcolor);
  }
};

