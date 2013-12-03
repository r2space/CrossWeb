
/**
 * 用户编辑画面
 */
(function(UserEdit) {
  
  UserEdit.View = Backbone.View.extend({

    initialize: function(options) {

      var self = this;

      _.bindAll(this, "onSaveBasic", "uploadFiles", "dragover", "dragleave", "dropfile", "showPhoto", "startJcrop", "showThumbnail", "saveImage");

      this.model.fetch({
        success: function(){
          self.render();
        }
      });

      // 保存基本信息
      $("#btn-save").bind("click", self.onSaveBasic);
      // 取消
      var userId = this.model.get("_id");
      $("#cancel").bind("click", function(){
        window.location = "/user/" + userId;
      });

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

    },

    /**
     * 渲染画面
     */
    render: function() {

      var tel = this.model.get("tel")
        , name = this.model.get("name")
        , email = this.model.get("email")
        , custom = this.model.get("custom")
        , address = this.model.get("address")
        , photo = this.model.get("photo");

      $("#user-name").val(name.name_zh);
      $("#user-last").val(name.letter_zh);
      $("#user-title").val(this.model.get("title"));
      $("#user-telephone").val(tel ? tel.mobile : "");
      $("#user-email").val(email ? email.email1 : "");
      $("#user-memo").val(custom ? custom.memo : "");

      $("#user-address").val(address ? address.country : "");
      $("#user-birthday").val(this.model.get("birthday"));
      $("#user-language").val(this.model.get("lang"));
      $("#user-timezone").val(this.model.get("timezone"));

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
      var self = this;

      this.model.set({
        name: {name_zh: $("#user-name").val(), letter_zh: $("#user-last").val()},
        email: {email1: $("#user-email").val()},
        title: $("#user-title").val(),
        custom: {memo: $("#user-memo").val()},
        tel: {mobile: $("#user-telephone").val()},

        address: {country: $("#user-address").val()},
        birthday:$("#user-birthday").val(),
        lang: $("#user-language").val(),
        timezone: $("#user-timezone").val()
      });

      if(!this.onChangePassword()){
        return;
      }

      this.saveImage();

      self.model.save(null, {
        error: function(a, b) {
          var message = JSON.parse(b.responseText).error.message;
          alert("更新失败，"+message);
        },
        success: function(a, b){
          smart.show("success", i18n["success"], i18n["success"], 3);
          //alert("");
        }
      });
    },

    // 修改密码
    onChangePassword: function() {
      var _pwd = $("#user-pwd").val()
        , _pwd1 = $("#user-pwd1").val()
        , _pwd2 = $("#user-pwd2").val();
      
      if(_pwd && _pwd1 && _pwd2){
        
        if(_pwd1 != _pwd2){
          alert(i18n["user.error.diffentPwd"]);
          return false;
        }

        this.model.set({
          password_new: {pwd: _pwd, pwd1: _pwd1}
        });

      }

      return true;
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


    // ------------------------
    
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

})(user.view("useredit"));