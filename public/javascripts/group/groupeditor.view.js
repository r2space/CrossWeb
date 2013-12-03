
/**
 * 组编辑画面
 */
(function(GroupEditor) {
  
  GroupEditor.View = Backbone.View.extend({

    initialize: function(options) {

      var self = this;

      _.bindAll(this, "onSaveBasic", "uploadFiles", "dragover", "dragleave", "dropfile"
        , "showPhoto", "startJcrop", "showThumbnail", "setGroupType");

      this.model.fetch({
        success: function(){
          self.render();
        }
      });

      // 保存基本信息
      $("#saveInfo").bind("click", self.onSaveBasic);

      // 拖拽上传图片事件
      $("#jcropDiv").bind("dragover", self.dragover);
      $("#jcropDiv").bind("dragleave", self.dragleave);
      $("#jcropDiv").bind("dragend", self.ignoreDrag);
      $("#jcropDiv").bind("drop", self.dropfile);

      // 上传按钮事件
      $("#selectFile").bind("click", function(){
        $("#uploadfile").trigger('click');
      });
      $("#uploadfile").bind("change", function(e){
        self.uploadFiles(e.target.files);
      });

      // 取消
      $("#cancel").bind("click", function(){
        window.location = "/group/" + $("#groupid").val();
      });

      // 组的公开类型
      $("#groupType button").bind("click", self.setGroupType);

      $("#groupPhoto").bind("click", function(){
        $("#selectFile").show();
      });
      $("#basicInfo").bind("click", function(){
        $("#selectFile").hide();
      });
    },

    setGroupType: function(src) {
      if (this.model.get("type") == 2) {
        return false;
      }

      $("#setPublic").removeClass("btn-warning");
      $("#setPrivate").removeClass("btn-warning");
      $(event.target).addClass("btn-warning");
    },

    /**
     * 渲染画面
     */
    render: function() {

      var photo = this.model.get("photo");
      $("#group-name").val(_.isObject(this.model.get("name"))?this.model.get("name")["name_zh"]:this.model.get("name"));
      $("#group-letter").val(_.isObject(this.model.get("name"))?this.model.get("name")["letter_zh"]:this.model.get("name"));
      $("#group-description").val(this.model.get("description"));
      $("#group-category").val(this.model.get("category"));

      if (this.model.get("type") == 1) {
        $("#group-type").val(i18n["group.grouplist.tab.group"]);  
      } else {
        $("#group-type").val(i18n["group.grouplist.tab.department"]);
        $("#group-name").attr("disabled","disabled");
        $("#group-letter").attr("disabled","disabled");
      }

      if (this.model.get("secure") == 1) {
        $("#setPrivate").addClass("btn-warning");
      } else {
        $("#setPublic").addClass("btn-warning");
      }

      // 显示照片
      this.showPhoto(photo);
    },

    showPhoto: function(photo) {
      if (!photo) {
        return;
      }

      var big = photo.big ? "/picture/" + photo.big : "/images/user.png";
      $("#bigPhoto").attr("src", big);
      var middle = photo.middle ? "/picture/" + photo.middle : big;
      $("#middlePhoto").attr("src", middle);
      var small = photo.small ? "/picture/" + photo.small : big;
      $("#smallPhoto").attr("src", small);
    },

    // 保存用户基本信息
    onSaveBasic: function() {

      var secure = 1;
      if ($("#setPublic").hasClass("btn-warning")) {
        secure = 2;
      }

      var self = this
        , data = {
            "name": {
              "name_zh":$("#group-name").val()
            , "letter_zh":$("#group-letter").val()
            }
          , "description": $("#group-description").val()
          , "secure": secure
          , "category": $("#group-category").val()
        };

      this.saveImage();

      self.model.save(data, {
        error: function(a, b) {
          alert(i18n["fail"]);
        },
        success: function(a, b){
          alert(i18n["success"]);
        }
      });
    },

    /**
     * 停止拖拽事件
     */
    ignoreDrag: function(e) {
      e.originalEvent.stopPropagation();
      e.originalEvent.preventDefault();
    },

    dragover: function(e) {
      this.ignoreDrag(e);
      $(e.target).parent().addClass("dragging");
    },

    dragleave: function(e) {
      $(e.target).parent().removeClass("dragging");
    },

    /**
     * 相应拖拽图片事件
     */
    dropfile: function(e) {
      this.ignoreDrag(e);
      $(e.target).parent().removeClass("dragging");

      try {
        this.uploadFiles(e.originalEvent.dataTransfer.files);
      } finally {
        this.ignoreDrag(e);
      }
    },
    
    /**
     * 上传图片
     */
    uploadFiles: function(files) {

      if (!files || files.length <= 0) {
        return false;
      }

      if(jcrop_api){
        jcrop_api.destroy();
      }

      for (var f, i = 0; f = files[i]; i++) {
        // 预览图片
        smart.localPreview(f, $("#jcropPhoto"), this.startJcrop);
        $("#jcropPhoto").attr("style", "");
        smart.localPreview(f, $("#realPhoto"));
        smart.localPreview(f, $("#bigPhoto"));
        smart.localPreview(f, $("#middlePhoto"));
        smart.localPreview(f, $("#smallPhoto"));
      }
      this.files = files;
    },

    saveImage: function() {

      if(!jcrop_api || !this.files){
        return;
      }

      var self = this;
      var fd = new FormData();
      for (var i = 0; i < this.files.length; i++) {
        fd.append("files", this.files[i]);
      }
      smart.dopostData("/gridfs/save.json", fd, function(err, result){
        var fid = result.data.items[0]._id;

        var realWidth = $("#realPhoto").width();
        var width = $("#jcropPhoto").width();
        var r = realWidth / width;

        var realheight = $("#realPhoto").height();
        var height = $("#jcropPhoto").height();
        var rh = realheight / height;

        var x = parseInt($("#jcropData").attr("x")*r);
        var y = parseInt($("#jcropData").attr("y")*r);
        var w = parseInt($("#jcropData").attr("w")*r);

        // 防止超过图片真实的长度和高度
        if(x+w > realWidth){
          alert(x+w);
          x = realWidth - w;
        }
        if(y+w > realheight){
          alert(y+w);
          y = realheight - w;
        }

        var photo = {
          "fid":fid,
          "width":w+"",
          "x":x+"",
          "y":y+""
        };

        self.model.set({
          "photo": photo
        });

      });
    
    },

    // ------------------------
    // TODO: 和Bootstrap的JS冲突（需进行JS文件的最小化）
    startJcrop: function() {
      var self = this;

      $("#jcropPhoto").Jcrop({
          onChange: self.showThumbnail
        , onSelect: self.showThumbnail
        , aspectRatio: 1
        , setSelect: [ 0, 0, 150, 150 ]
        , allowSelect: false
      },function(){
          // Store the API in the jcrop_api variable
          jcrop_api = this;
      });
    },

    showThumbnail: function(coords) {
      var rx = 180 / coords.w;
      var ry = 180 / coords.h;
      var w = $("#jcropPhoto").width();
      var h = $("#jcropPhoto").height();

      $("#bigPhoto").css({
        "max-width": "none",
        width: Math.round(rx * w) + 'px',
        height: Math.round(ry * h) + 'px',
        marginLeft: '-' + Math.round(rx * coords.x) + 'px',
        marginTop: '-' + Math.round(ry * coords.y) + 'px'
      });
      
      rx = 50 / coords.w;
      ry = 50 / coords.h;
      $("#middlePhoto").css({
        "max-width": "none",
        width: Math.round(rx * w) + 'px',
        height: Math.round(ry * h) + 'px',
        marginLeft: '-' + Math.round(rx * coords.x) + 'px',
        marginTop: '-' + Math.round(ry * coords.y) + 'px'
      });

      rx = 30 / coords.w;
      ry = 30 / coords.h;
      $("#smallPhoto").css({
        "max-width": "none",
        width: Math.round(rx * w) + 'px',
        height: Math.round(ry * h) + 'px',
        marginLeft: '-' + Math.round(rx * coords.x) + 'px',
        marginTop: '-' + Math.round(ry * coords.y) + 'px'
      });

      $("#jcropData").attr("x", coords.x);
      $("#jcropData").attr("y", coords.y);
      $("#jcropData").attr("w", coords.w);
    }

  });

})(group.view("groupeditor"));

