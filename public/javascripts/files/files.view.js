
/**
 * 文件一览
 *
 */
(function(Files) {

  Files.View = Backbone.View.extend({
    
    el: $('#docbody'),
    
    initialize: function() {

      _.bindAll(this, "render", "sideMenuClicked", "onRowSelect", "onCreateTemplateClick", "onPageClick", "uploadFiles", "fetchFiles");

      $(document).bind("click", function(){
        $("#fileHistory").hide();
      });

      var self = this
        , uid = smart.uid();

      // 上传按钮事件
      $("#selectFile").bind("click", function(){
        $("#uploadfile").trigger('click');
      });
      $("#uploadfile").bind("change", function(e){
        var fid = $(e.target).attr("fid") || "";
        $("#uploadfile").attr("fid","");
        self.uploadFiles(fid, e.target.files);
      });

      // 创建文书
      $("#create").bind("click", self.onCreateTemplateClick);

      // 切换文件类型
      $("#showFiles, #showImages, #showVideos, #showAudios, #showNotes").bind("click", function(){
        self.collection.type = $(event.target).attr("target");
        self.fetchFiles(1);
      });

      var tab = window.location.href.split("?tab=")[1];
      if(tab){
        self.sideMenuClicked(tab);
      }

      self.fetchFiles(1);
      window.sidemenu.view.onSideMenuClicked = this.sideMenuClicked;
    },

    sideMenuClicked: function(item, type) {

      var self = this;
      if (item == "file") {
        $("#showFiles").click();
        self.collection.type = $("#showFiles").attr("target");
      }
      if (item == "image") {
        $("#showImages").click();
        self.collection.type = $("#showImages").attr("target");
      }
      if (item == "video") {
        $("#showVideos").click();
        self.collection.type = $("#showVideos").attr("target");
      }
      if (item == "audio") {
        $("#showAudios").click();
        self.collection.type = $("#showAudios").attr("target");
      }
      
      self.fetchFiles(1);

      return false;
    },

    fetchFiles: function(page){
      var self = this;
      page = page || 1;
      self.collection.page = page;
      self.collection.fetch({
        success: function(){
          self.render();
        }
      });
    },
    
    /**
     * 生成文件一览，并绑定事件
     */
    render: function () {

      var self = this
        , container
        , template = _.template($('#files-template').html())

      if (self.collection.type == "application") {
        container = $("#docs");
        container.html("");
      }
      if (self.collection.type == "image") {
        container = $("#images");
        container.html("");
      }
      if (self.collection.type == "video") {
        container = $("#videos");
        container.html("");
      }
      if (self.collection.type == "audio") {
        container = $("#audios");
        container.html("");
      }
      if (self.collection.type == "notes") {
        container = $("#notes");
        container.html("");
      }

      smart.pagination(
          self.collection.total
        , self.collection.limit
        , self.collection.page
        , "file_page_container"
        , function(page){
            self.fetchFiles(page);
            return false;
          });

      self.collection.each(function(file) {

        var name = file.get("filename")
          , metadata = file.get("metadata")
          , extension = file.get("extension")
          , uid = metadata.author
          , fid = file.id
          , downloadId = file.get("downloadId")
          , gid = ""
          , uploadDate = file.get("uploadDate");

        container.append(template({
            "name": name
          , "extension": extension
          , "uid": uid
          , "fid": fid
          , "gid": gid
          , "downloadId": downloadId
          , "on": uploadDate.substr(0, 10)
        }));

        $("#" + fid + " a.btn").on("click", function(){
          var target = $(event.target)
            , func = target.attr("name");
          if (func == "update") {
            $("#uploadfile").attr("fid", target.attr("fid"));
            $("#uploadfile").trigger('click');
          } else if (func == "history") {
            self.fileHistory(event.target);
          }
          //return false;
        });
      });

      
      // // 创建一览
      // $("#filelist").empty();
      // $("#filelist").append(template({rows: files, type: target}));
      
      // // 绑定行选择，连接点击等事件
      // $("#docbody td a").bind("click", this.onCreateDocument);
      // $("#docbody td").bind("click", this.onRowSelect);



    },

    fileHistory: function(target){
      var self = this
        , fid = $(target).attr("fid")
        , url ="/file/history.json?fid=" + fid;

        smart.doget(url, function(err, result){
          var tmpl = $("#files-history-template").html()
            , container = $("#historylist");

          container.html("");
          _.each(result.items, function(file) {
            container.append(_.template(tmpl, {
                downloadId: file._id
              , extension: file.extension
              , title: file.filename
              , author: file.user.name.name_zh
              , at: smart.date(file.uploadDate)
            }));
          });

          var div = $("#fileHistory");
          div.show();
          console.log($(target).position());
          var position = $(target).position();
          position.top += 25;
          position.left -= 50;
          div.offset(position);
        });
    },
    /**
     * 上传图片
     */
    uploadFiles: function(fid,files) {
      var self = this;
      if (!files || files.length <= 0) {
        return false;
      }

      var fd = new FormData();
      fd.append("fid", fid);
      for (var i = 0; i < files.length; i++) {
        fd.append("files", files[i]);
      }

      smart.dopostData("/file/upload.json", fd, function(err, result){
        console.log(result);
        // location.reload();
        // self.startJcrop();
      });
    },

    onCreateDocument: function() {

      var name = $(event.target).attr("name")
        , tmplid = $(event.target).parents("tr").attr("id");

      if ("createdocument" === name) {
        window.location.href = "/doc?tmplid=" + tmplid;
      }

      return false;
    },
    
    onRowSelect: function() {
      var target = this.model.get("target");

      if (target === "template") {
        window.location.href = "/tmpl?tmplid=" + event.target.parentElement.id;
      } else {
        window.location.href = "/doc?docid=" + event.target.parentElement.id;
      }
    },
    
    onCreateTemplateClick: function() {
      window.location.href = "/tmpl";
    },

    activePage: {},
    onPageClick: function() {
      try {
        $("#pagination .active").removeClass("active");  

        this.activePage = $("#" + event.target.id).parent();
        this.activePage.addClass("active");

        // 翻页检索
        window.file.model.fetch({target: "template", page: app.page()});

        return false;
      } catch(e) {
        console.log(e);
        return false;
      }
    }
    
  });
  
})(files.view("files"));

