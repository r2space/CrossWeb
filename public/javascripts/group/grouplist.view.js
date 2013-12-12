
/**
 * 组一览对应的View。负责组界面的显示，处理界面事件。
 */
(function(GroupList) {
  
  GroupList.View = Backbone.View.extend({

    /**
     * 初始化View
     */
    initialize: function(options) {

      var self = this;
      self.collection = options.collection;

      // 显示所有，组，部门
      $("#all, #group, #department").bind("click", function(){
        self.fetchGroup($(event.target).attr("id"));
      });

      $("#searchInput").keypress(function(event) {
        if(event.which === 13) {
          self.fetchGroup();
        }
      });

      $("#searchBtn").click(function() {
        self.fetchGroup();
      });

      // 创建组
      $("#createGroup").bind("click", function() {
        self.createGroup(); return false;
      });

      window.sidemenu.view.onSideMenuClicked = this.sideMenuClicked;

      self.fetchGroup("all");
    },

    /**
     * 渲染画面
     */
    render: function() {

      var self = this
        , tmpl = $('#group-template').html()
        , uid = $("#userid").val();

      if (this.kind === "all") {
        container = $("#allContainer");
      }

      if (this.kind === "group") {
        container = $("#groupContainer");
      }

      if (this.kind === "department") {
        container = $("#departmentContainer");
      }

      container.html("");

      if(self.collection.total > 0) {
        self.collection.each(function(group) {
          container.append(_.template(tmpl, {
            "id": group.get("_id")
            , "name": _.isObject(group.get("name"))?group.get("name")["name_zh"]:group.get("name")
            , "secure":group.secure
            , "secure": group.get("secure")
            , "type": group.get("type")
            , "members": group.get("member").length
            , "lastModify": group.get("editat").substr(0, 10)
            , "joined": _.contains(group.get("member"), uid)
          }));
        });

        var total = self.collection.total;
        var count = self.collection.count;
        var pagenum = self.collection.pagenum;

        smart.pagination(total, count, pagenum, "pagination", function(pagenum){
          self.fetchGroup(null, count*(pagenum - 1), count, pagenum);
        });

        $("#allContainer a, #groupContainer a, #departmentContainer a").on("click", function(){
          self.joinGroup($(this));
        });
      } else {
        $("#pagination").html("");
        smart.appendNoResultRow(container);
      }
    },

    sideMenuClicked: function(item, type) {
      
      // 部门的消息
      if (type == "group") {
        window.location = "/group/" + item;
      }
      return false;
    },

    /**
     * 检索组信息
     */
    fetchGroup: function(kind, start, count, pagenum) {

      var self = this;

      if(kind) {
        self.kind = kind;
        $("#searchInput").val("");
        self.keywords = "";
      } else {
        self.keywords = $("#searchInput").val();
      }

      self.collection.keywords = self.keywords;
      self.collection.type = "";
      if (self.kind == "group") {
        self.collection.type = "1";
      }
      if (self.kind == "department") {
        self.collection.type = "2";
      }
      self.collection.start = start || 0;
      self.collection.count = count || 20;
      self.collection.pagenum = pagenum || 1;

      self.collection.fetch({
        success: function() {
          self.render();
        }
      });
    },

    /**
     * 创建组
     */
    createGroup: function() {

      var self = this
        , data = {
            "name": {
              "name_zh" : $("#groupName").val()
             ,"letter_zh":$("#groupLetter").val() 
              }
          , "secure": "1"
          , "description": $("#groupDescription").val()
        };

      // 利用Model保存组信息
      var GroupModel = group.model("group").Model;
      new GroupModel().save(data, {
        success: function(){
          self.fetchGroup(self.kind, self.firstLetter);

          // 关闭对话框
          $("#create-group-modal").modal('hide');
        }
      });
    },

    /**
     * 参加组
     */
    joinGroup: function(source){

      var self = this
        , gid = source.attr("gid")
        , url = source.attr("joined") == "true" ? "/group/leave.json" : "/group/join.json";

      if (!gid) { return; }

      smart.doput(url, {"gid": gid}, function(err, result){
        if (err) {
          console.log(err); return;
        }

        self.fetchGroup(self.kind, self.firstLetter);

        // //发送通知
        // var gname = self.collection.get(gid).attributes.name
        // , content = source.html() === "退出" ? "退出了" + gname + "组" : "加入了" + gname + "组"
        // , members = self.collection.get(gid).attributes.member;

        // _.each(members, function(member){
        //   if(member == $("#userid").val()) {
        //     console.log("###");
        //   } else {
        //     smart.sendNotification(member, content, 4);
        //   }        
        // });
      });
    }
  });

})(group.view("grouplist"));

