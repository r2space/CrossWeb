
/**
 * 构造函数
 */
function Graph(model) {
  this.id = model.get("_id");
  this.model = model;
  this.tmplate = $("#graph_template").html();
};


Graph.prototype.create = function() {
  $("#board").append(_.template(this.tmplate, {_id: this.id}));
};


Graph.prototype.draw = function() {

  var item = $("#" + this.id)
    , design = this.model.get("design")
    , pos = design.position;

  item.offset({top: pos.y, left: pos.x});
  item.width(pos.width);
  item.height(pos.height);

  drawGraph(this.id);
}


function drawGraph(id) {

  var chart1 = new Highcharts.Chart({
    chart: {
      renderTo: id,
      type: 'bar',
      events: {
        click: function(event){
          alert(event.xAxis[0].value + ":" + event.yAxis[0].value);
        }
      }
    },
    plotOptions: {
      series: {
        point: {
          events: {
            click: function(){
              alert(this.x + ":" + this.y);
            }
          }
        }
      }
    },
    title: {
      text: '日本語のタイトルを表示'
    },
    xAxis: {
      categories: ['Apples', 'Bananas', 'Oranges', 'a']
    },
    yAxis: {
      title: {
        text: 'Fruit eaten'
      }
    },
    series: [{
        name: 'Jane',
        data: [1, 1, 4, 6]
      }, {
        name: 'John',
        data: [5, 7, 3]
    }]
  });
}
