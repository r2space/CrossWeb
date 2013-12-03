/**
 * 全文检索
 */
(function(FulltextSearch) {
  
  FulltextSearch.View = Backbone.View.extend({

    /**
     * 初始化View
     */
    initialize: function() {

      var self = this;
      _.bindAll(this,"render","sideMenuClicked");

      $("#search").val($("#keywords").val());
      self.render(1);
      window.sidemenu.view.onSideMenuClicked = this.sideMenuClicked;

    },


    sideMenuClicked: function(item, type) {

      var self = this;
      
      if (type == "fts") {
        self.item = item;
        self.render(1);
      }

      return false;
    },

    /**
     * 渲染画面
     */
    render: function(page) {
      
      var self = this
        , resultlist = $("#resultlist")
        , keywords = $("#keywords").val()
        , url = "/search/full.json?keywords=" + keywords;

      url += "&start=" + (page-1)*20;
      url += "&count=" + 20;

      if(self.item && self.item != "all"){
        url += "&style=" + self.item;
      }

      smart.doget(url, function(err, data){

        var state = data.state
          , items = data.items;

        $("#resultMsg").html("检索结果总数："+state.rows+" 件 表示可能总数："+state.permit_rows+" 件");
        resultlist.empty();

        // add message
        if (items.length > 0) {
          _.each(items, function(item){

            var type = item.style;
            var title = item.title;
            title = title.replace(/<br>/g," ");
            if(title.length > 20){
              title = title.substring(0,20) + "...";
            }
            var content = item.content;
            content = content.replace(/\*\[\-\[\+\[/g,"<");
            content = content.replace(/\]\+\]\-\]\*/g,">");
            content = content.replace(/<br>/g," ");
            var score = item.score;
            var id = item.id;

            var url;
            if("user" == type){
              url = "/user/"+id;
              type = i18n["navbar.menu.user"];
            }else if("group" == type){
              url = "/group/"+id;
              type = i18n["navbar.menu.group"];
            }else if("message" == type){
              type = i18n["navbar.menu.message"];
              var parent_id = item.parent_id;
              if(parent_id){
                id = parent_id;
                type += "-" + i18n["message.list.button.reply"];
              }
              url = "/message/"+id;
            }

            resultlist.append(_.template($('#solr-template').html(), {
                "title": title
              , "content": content
              , "score": score
              , "url": url
              , "type": type
            }));
          });

          smart.pagination(state.permit_rows, 20, page, "messagelist-user", function(){
            var pagenum = $(event.target).attr("id").split("_")[1];
            if(pagenum > 0){
              self.render(pagenum);
            }
            return false;
          });
        }else{
          $("#messagelist-user").hide();
        }
      });
    }

  });

})(fulltextsearch.view("fulltextsearch"));

