
/**
 * 构造函数
 */
function Label(model) {

  this.id = model.get("_id");
  this.model = model;
  this.tmplate = $("#label_template").html();
};


Label.prototype.create = function() {
  $("#board").append(_.template(this.tmplate, {_id: this.id}));
};


/**
 * 设置属性
 */
Label.prototype.draw = function() {

  var text = $("#" + this.id)
    , textspan = $("#" + this.id + " span")
    , design = this.model.get("design")
    , pos = design.position;

  text.offset({top: parseInt(pos.y) + 70, left: parseInt(pos.x) + 270});
  // text.offset({top: pos.y, left: pos.x});
  text.width(pos.width);
  text.height(pos.height);
  // text.css("background-color", design.bgcolor);
  text.css("z-index", pos.z);
  text.css("position", "absolute");

  textspan.html(this.model.get("text"));
  textspan.css("font-family", design.font.name);
  textspan.css("font-size", design.font.size);
  textspan.css("color", design.font.color);

};
