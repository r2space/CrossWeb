
/**
 * 构造函数
 */
function Text(model) {

  this.id = model.get("_id");
  this.value = window.board.model.itemvalue(this.id).value;
  this.model = model;
  this.tmplate = window.board.model.isTemplate() 
    ? $("#text_template").html() 
    : $("#editable_text_template").html();
};


Text.prototype.create = function() {
  $("#board").append(_.template(this.tmplate, {_id: this.id, _val: this.value}));
};

Text.prototype.onchange = function(callback) {
  $("#" + this.id).bind("change", callback);
};

/**
 * 设置属性
 */
Text.prototype.draw = function() {

  var text = $("#" + this.id)
    , textspan = $("#" + this.id + " span")
    , design = this.model.get("design")
    , pos = design.position;

  text.offset({top: parseInt(pos.y) + 70, left: parseInt(pos.x) + 265});
  text.width(pos.width) ;
  text.height(pos.height);
  text.css("background-color", design.bgcolor);
  text.css("z-index", pos.z);
  text.css("position", "absolute");

  textspan.html(this.model.get("text"));
  textspan.css("font-family", design.font.name);
  textspan.css("font-size", design.font.size);
  textspan.css("color", design.font.color);

};
