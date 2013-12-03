
(function(Searcher) {

  Searcher.View = Backbone.View.extend({
    
    el: '#search',
    
    initialize: function() {
      _.bindAll(this, "render", "onSearch", "onClick");
      this.model.on("change", this.render);
      
      $(this.el).on("keyup", this.onSearch);
      $(this.el).on("click", this.onClick);
    },
    
    render: function () {
      
      var files = this.model.get("file")
        , self = this
        , users = this.model.get("user")
        , groups = this.model.get("group")
        , resultlist = $('#_searchresult ul');

      resultlist.empty();

      // add files
      if (files.length > 0) {
        resultlist.append(_.template($('#_searchresult-header-template').html(), {
          "type":i18n["navbar.menu.file"]
        }));

        var tmpl = $('#_searchresult-file-template').html()
        _.each(files, function(file){
          var photo = "/images/filetype/"+ self.contenttype2extension(file.contentType, file.filename) +".png";
          resultlist.append(_.template(tmpl, {
              "id": file._id
            , "name":file.filename
            , "photo": photo
            , "addition": Math.round(file.length / 1024 * 100) / 100 + "K"
          }));
        });
      }
      
      // add user
      if (users.length > 0) {
        resultlist.append(_.template($('#_searchresult-header-template').html(), {
          "type": i18n["navbar.menu.user"]
        }));

        var tmpl = $('#_searchresult-user-template').html()
        _.each(users, function(user){
          var name = user.name.name_zh
            , photo = (user.photo && user.photo.small) ? "/picture/" + user.photo.small : "/images/user.png";
          resultlist.append(_.template(tmpl, {
              "id": user._id
            , "name": name
            , "photo": photo
            , "addition": user.title
          }));
        });
      }
      
      // add group
      if (groups.length > 0) {
        resultlist.append(_.template($('#_searchresult-header-template').html(), {
          "type": i18n["navbar.menu.group"]
        }));

        var tmpl = $('#_searchresult-group-template').html()
        _.each(groups, function(group){
          var photo = (user.photo && user.photo.small) ? "/picture/" + user.photo.small : "/images/user.png";
          resultlist.append(_.template(tmpl, {
              "id": group._id
            , "name": group.name.name_zh
            , "photo": photo
            , "addition": group.description
          }));
        });
      }

      // 添加最后一行
      resultlist.append(_.template($('#_searchresult-bottom-template').html(), {
        "keywords": $("#search").val()
      }));

      // 操作按钮点击事件的绑定
      $("#_searchresult a").on("click", function(){
        var src = $(event.target);
        if (src.attr("gid")) {
          smart.doput("/group/join.json", {"gid": src.attr("gid")}, function(err, result){
            alert("成功参加了组");
          });
          return false;
        }

        // send private message
        if (src.attr("uid")) {
          smart.sendPrivateMessage(src.attr("uid"));
          return false;
        }
      });

      $('#_searchresult').show();

    },

    onClick: function() {
    },
    
    /**
     * 文件的mime转换成文件后缀
     */
    contenttype2extension: function(contenttype, filename) {

      var mime = {
          "application/msword": "doc"
        , "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx"
        , "application/vnd.ms-excel": "xls"
        , "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx"
        , "application/vnd.ms-powerpoint": "ppt"
        , "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx"
        , "application/vnd.openxmlformats-officedocument.presentationml.slideshow": "ppsx"
        , "application/pdf": "pdf"
        , "application/rtf": "rtf"
        , "application/zip": "zip"
        , "image/bmp": "bmp"
        , "image/gif": "gif"
        , "image/jpeg": "jpeg"
        , "image/png": "png"
        , "image/tiff": "tiff"
        , "text/plain": "txt"
        , "video/msvideo": "avi"
        , "video/quicktime": "mov"
      };

      var extension = mime[contenttype];
      if (extension) {
        return extension;
      }

      filename.match(/.*[.]([^.]*)$/); // 文件后缀
      return RegExp.$1 || "default";
    },

    onSearch: function() {
      
      var searchval = $(this.el).val(), keywords = this.model.keywords;
      
      // 关键字为空
      if (searchval.length <= 0) {
        this.model.keywords = "";
        this.model.clear({silent: true});
        $('#_searchresult').hide();
        return;
      }
      
      // 全文检索
      var c = event.keyCode;
      if (c == 13) {
        window.location = "/fulltextsearch/result?keywords=" + searchval;
        return;
      }

      // 关键字发生变化
      if (searchval !== keywords) {
        this.model.keywords = searchval;
        this.model.fetch();
      }
    }
    
  });
  
})(smart.view("searcher"));

