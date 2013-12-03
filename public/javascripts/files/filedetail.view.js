
/**
 * 文件一览
 *
 */
(function(FileDetail) {

  FileDetail.View = Backbone.View.extend({
    
    el: $('#docbody'),
    
    initialize: function() {

      _.bindAll(this, "render", "updateFile", "fetchFile", "followFile");

      var self = this;
      var fid = this.model.id;

      $("#fileupdate_btn").bind("click", function(){
        $("#uploadfile").trigger('click');
      });

      $("#uploadfile").bind("change", function(e){
        var target = e.target;
        self.updateFile(fid,e.target.files);
      });

      $("#follow_btn").bind("click", function(){
        self.followFile(fid, "follow");
      });
      $("#unfollow_btn").bind("click", function(){
        self.followFile(fid, "unfollow");
      });

      this.fetchFile();

      window.sidemenu.view.onSideMenuClicked = this.sideMenuClicked;
    },

    sideMenuClicked: function(item, type) {

      window.location = "/files?tab=" + item;
      return false;
    },

    fetchFile: function(){
      var self = this;
      self.model.fetch({
        success: function(){
          self.render();
        }
      });
    },
    
    /**
     * 生成文件一览，并绑定事件
     */
    render: function () {

      var self = this;

      self.renderDetail();
      self.renderHistory();
      self.renderFollower();
    },

    renderDetail: function(){
      var self = this
        , file = this.model.get("file")
        , followers = this.model.get("follower")
        , owner = this.model.get("owner");


      var isowner = owner._id === smart.uid()
        , isfollower = _.any(followers, function(follower){ return follower._id === smart.uid()})
        , photo = "/images/filetype/" + file.extension + ".png";

      $("#file_image img").attr("src", photo);
      $("#file_name").html(file.filename);
      $("#file_owner").html(owner.name.name_zh);
      $("#file_owner").attr("href", "/user/" + owner._id);

      if(!isowner){
        if(isfollower){
          $("#follow_btn").hide();
          $("#unfollow_btn").show();
        } else {
          $("#follow_btn").show();
          $("#unfollow_btn").hide();
        }
      }
    },

    renderHistory: function(){
      var self = this
        , history = this.model.get("history");

      $("#historyCount").html(history.length);
      var tmpl = $("#file-history-template").html()
        , container = $("#historylist");

      container.html("");
      _.each(history, function(file, idx){
        var ver = idx + 1;
        if(ver == history.length){
          ver = 'newest';
        } 
        container.prepend(_.template(tmpl, {
            downloadId: file._id
          , extension: file.extension
          , title: file.filename
          , ver: ver
          , uid: file.user._id
          , author: file.user.name.name_zh
          , at: smart.date(file.uploadDate)
        }));
      });
    },

    renderFollower: function(){
      var self = this
        , follower = this.model.get("follower");

      $("#showFollower").html("follower(" + follower.length + ")");

      var tmpl = $("#file-follower-template").html()
        , container = $("#followerlist");

      container.html("");
      _.each(follower, function(user){
        var photo = user.photo;
        photo = photo && photo.big ? "/picture/" + photo.big : "/images/user.png";
        container.append(_.template(tmpl, {
          id: user._id
          , photo: photo
          , name: user.name.name_zh
          , title: user.title
          , lastMessage: user.lastMessage
        }));
      });
    },

    followFile: function(fid, kind){
      var self = this;
      var url = "/file/" + kind + ".json";
      smart.doput(url, {"fid": fid}, function(err, result){
        if(result.error){
          console.log(result); return;
        }

        self.fetchFile();

      });
    },
    
    updateFile: function(fid, file){
      var self = this;

      if (!file || file.length <= 0) {
        return false;
      }

      var fd = new FormData();
      fd.append("fid", fid);
      fd.append("files", file[0]);
      smart.dopostData("/file/upload.json", fd, function(err, result){
        if(err){
          console.log(result); return;
        }
        self.fetchFile();
      });
    },

    
  });
  
})(files.view("filedetail"));

