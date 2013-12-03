
/**
 * 导航栏
 */
(function(Menu) {

  Menu.View = Backbone.View.extend({
    
    el: $('#_navbar'),
    
    initialize: function() {

      _.bindAll(this, "render", "onMenuClick", "onUserBoxClick");
      
      // 全局点击事件
      $(document).bind("click", this.onDocumentClick);

      // 显示子菜单
      $("#apps").bind("click", this.showApps);

      // 滚动窗口时，固定导航栏
      $(window).bind("scroll", this.onWindowScroll);

      // 接受MQ的Push通知
      this.initMqPushEvent();

      // 菜单的点击事件
      $("#_navbar a").bind("click", this.onMenuClick);
      $("#_userbox a").bind("click", this.onUserBoxClick);
      
      // 设定缺省的菜单项
      this.activeMenu = $("#" + $("#bright").val());
      this.activeMenu.parent().addClass("active");

      this.model.on("change", this.render);
    },

    render: function () {
    },

    /**
     * 用户信息框点击事件
     */
    onUserBoxClick: function() {
      var src = $(event.target);
      if ( _.isEmpty(src.attr("id")) ) {
        src = src.parent();
      }

      var id = src.attr("id");
      
      if ("_userpic" === id || "_username" === id) {
        window.location = "/user/" + $("#userid").val();
      }

      // 用户档案
      if ("_user" === id) {
        window.location = "/usereditor";
      }

      // 注销
      if ("_logout" === id) {
        window.location = "/simplelogout";
      }

      return false;
    },

    /**
     * 菜单点击事件处理
     */
    onMenuClick: function() {

      var self = this;

      var src = $(event.target);
      if ( _.isEmpty(src.attr("id")) ) {
        src = src.parent();
      }

      var id = src.attr("id");
      if (id === "files") {
        window.location = "/files";
      }

      if (id === "home") {
        window.location = "/message";
      }

      if (id === "message") {
        window.location = "/message";
      }

      if (id === "user") {
        window.location = "/userlist";
      }

      if (id === "group") {
        window.location = "/grouplist";
      }

      if (id === "topic") {
        window.location = "/topiclist";
      }

      if (id === "shortmail") {
        $.ajax({url: "/shortmail/list/unread.json",
          success: function(result) {
            self.showShortmail(result.data.list);
          }
        });
      }

      if (id === "notice") {
        $.ajax({url: "/notification/list/unread.json?start=0&limit=5",
          success: function(result) {
            self.showNotice(result.data.items);
          }
        }); 
      }

      // 改变高亮菜单项
      if (id !== "apps" && id !== "shortmail" && id !== "notice") {
        this.activeMenu.parent().removeClass("active");
        this.activeMenu = src;
        this.activeMenu.parent().addClass("active");
      }

      return false;
    },

    activeMenu: {},

    showShortmail: function(list) {
      var tmpl = $("#_shortmail-template").html()
        , popover = $("#_popover");

      popover.css("left", "179px");
      popover.html(_.template(tmpl, {"title": i18n["navbar.menu.shortmail"], "rows": list}));
      popover.show();
    },

    showNotice: function(list) {
      var tmpl = $("#_notice-template").html()
        , popover = $("#_popover");
      popover.css("left", "219px");
      // console.log(list);
      popover.html(_.template(tmpl, {"title": i18n["navbar.menu.notification"], "rows": list}));
      popover.show();
      $(".notice-item").click(function(){
        var data = $(this).attr("data");
        var type = $(this).attr("type");
        var nid  = $(this).attr("nid");
        var nids = [];
        nids.push(nid);
        smart.doput("/notification/read.json", {"nids": nids}, function(err, result){
          if(type == "follow"){
            window.location.href='/user/'+data;
          } else if(type == "invite"){
            window.location.href='/group/'+data;
          } else if(type == "remove"){
            window.location.href='/group/'+data;  
          } else {
            window.location.href='/message/'+data;
          }
        });
        

      });
    },

    /**
     * 滚动窗口时，固定导航栏
     */
    onWindowScroll: function() {
      
      var offset = 50 - $(document).scrollTop();
      offset = offset > 0 ? offset : 0;
      offset = offset > 50 ? 50 : offset;

      $("#_navbar").css("top", offset);
      $('#_searchresult').css("top", offset + 38);
      // $('#_findresult').css("top", offset + 28);

      // 关闭消息提示Popover
      if (offset == 0) {
        $('#_popover').hide();
      }
    },

    /**
     * 显示子菜单
     */
    showApps: function() {
      $("#subapps").css("display", "block");
    },
    
    /**
     * 全局点击事件
     */
    onDocumentClick: function() {

      // 关闭子菜单
      var target = $(event.target);
      if (target.attr('id') != 'apps') {
        $("#subapps").css("display", "none");
      }
      
      // 关闭Quick搜索结果
      if (target.attr('id') != 'search') {
        $('#_searchresult').css("display", "none");
        $('#_searchresult tbody').empty();
      }

      $('#_findresult').css("display", "none");
      $('#_findresult tbody').empty();

      // Popover
      $('#_popover').hide();
    },
    
    /**
     * 用WebSocket监听后台的推送，更新通知件数
     */
    initMqPushEvent: function() {
      var self = this;

      try {
        var socket = io.connect('http://10.2.8.232:3001');

        // 发送用户ID
        socket.on('connect', function (){
          socket.emit('userid', { id: $("#userid").val() });
        });
        
        $.ajax({url: "/shortmail/list/unread.json",
            success: function(data) {
              if (data.data.count) {
                $("#_shortmail").html(data.data.count);                
              } else {
                $("#_shortmail").html("");
                $("#_shortmail").removeClass("label label-important");
              }    
            }
          });

        $.ajax({url: "/notification/list/unread.json",
            success: function(result) {
              if (result.data.total) {
                $("#_notice").css("display","block");
                $("#_notice").html(result.data.total);
                $("#_notice").addClass("label label-important");                 
              } else {
                $("#_notice").css("display","none");
                $("#_notice").html("");
                $("#_notice").removeClass("label label-important");
              }
            }
          });

        // 监听后台的推送，更新通知件数
        socket.on('push', function (data) {
          smart.notify('Hi! You have a new notification.', '');
          if(data.msg&&(!_.isUndefined(data.msg))){
            $.ajax({url: "/shortmail/list/unread.json",
              success: function(result) {
                self.showShortmail(result.data.list);
                $("#_shortmail").html(result.data.count);
                $("#_shortmail").addClass("label label-important");
              }
            });
          }

          if(data.content&&(!_.isUndefined(data.content))){
            $.ajax({url: "/notification/list/unread.json",
              success: function(result) {
                if (result.data.total) {
                  $("#_notice").css("display","block");
                  $("#_notice").html(result.data.total);
                  $("#_notice").addClass("label label-important");               
                } else {
                  $("#_notice").css("display","none");
                  $("#_notice").html("");
                  $("#_notice").removeClass("label label-important");
                }
              }
            });
          }

          if(data.type&&(!_.isUndefined(data.type))){
            $.ajax({url: "/notification/list/unread.json",
              success: function(result) {
                if (result.data.total) {
                  $("#_notice").css("display","block");
                  $("#_notice").html(result.data.total);
                  $("#_notice").addClass("label label-important");              
                } else {
                  $("#_notice").css("display","none");
                  $("#_notice").html("");
                  $("#_notice").removeClass("label label-important");
                }
              }
            });
          }
 
        });
      } catch (err) {
        console.error("连接MQ出错！");
      }
    },

  });
  
})(smart.view("menu"));
