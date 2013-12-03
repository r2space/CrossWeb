
/**
 * 构造函数
 */
function Video(model) {

  this.id = model.get("_id");
  this.model = model;
  this.tmplate = $("#video_template").html();
};


Video.prototype.create = function() {
  $("#board").append(_.template(this.tmplate, {_id: this.id}));
};


/**
 * 设置属性
 */
Video.prototype.draw = function() {

  var text = $("#" + this.id)
    , textspan = $("#" + this.id + " span")
    , design = this.model.get("design")
    , pos = design.position;

  text.offset({top: pos.y, left: pos.x});
  text.width(pos.width);
  text.height(pos.height);
  // text.css("background-color", design.bgcolor);

  // textspan.html(this.model.get("text"));
  // textspan.css("font-family", design.font.name);
  // textspan.css("font-size", design.font.size);
  // textspan.css("color", design.font.color);
};
