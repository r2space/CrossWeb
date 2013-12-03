(function(Reply) {

  Reply.View = Backbone.View.extend({

    initialize: function(options) {

      _.bindAll(this, "createReply", "clearCreateReplyTo", "previousPage", "nextPage");
      this.$(".create-reply-btn").on("click", this.createReply);
      this.$(".reply-to-btn").on("click", this.focusOnCreateReplyContent);
      this.$(".clear-create-reply-to").on("click", this.clearCreateReplyTo);
      this.$(".replies-pagination .previous-page-btn").on("click", this.previousPage);
      this.$(".replies-pagination .next-page-btn").on("click", this.nextPage);
      this.updateValueToHtml();
      this.$(".replies-container").removeClass("hide");
    },

    previousPage: function() {
      this.collection.start -= this.collection.count;
      this.$(".replies-pagination li").addClass("disabled");
      this.updateValueToHtml();
      this.$(".replies-pagination .next-page-btn").css("display", "inline-block");
    },
    
    nextPage: function() {
      this.collection.start += this.collection.count;
      this.$(".replies-pagination li").addClass("disabled");
      this.updateValueToHtml();
      this.$(".replies-pagination .previous-page-btn").css("display", "inline-block");
    },

    focusOnCreateReplyContent: function() {
      _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

      var replyToUser
        , elId = $(this).closest(".reply").attr("id")
        , mid = elId.split("-")[1]
        , rid = elId.split("-")[2]
        , reply = _.find(window.message.reply, function(reply){return reply.collection.mid == mid;});

      reply.model.set({replyto: rid});
      
      window.user.api.getUser($("#userid").val(), function(user){
        replyToUser = user;
        var tmpl = $('#reply-to-template').html()
          , tmpldata = {replyToUname: replyToUser.get("uname").first};
        reply.view.$(".create-reply-to").html(_.template(tmpl, tmpldata));
        reply.view.$(".create-reply-to").removeClass("hide");
        reply.view.$(".create-reply-content").focus();
      });
    },

    clearCreateReplyTo: function() {
      this.model.unset("to");
      this.$(".create-reply-to").addClass("hide");
    },

    createReply: function() {
      var self = this;
      
      var model = this.model
        , mid = this.collection.mid
        , content = this.$(".create-reply-content").val();

    	if (content) {
    		model.set({replyto: mid, content: content});
        try{
          model.save(model.toJSON(),{
            success: function(model, response) {
              self.putData(model, mid);
              model.rebuild();
              this.$(".create-reply-content").val("");
              self.clearCreateReplyTo();
            },
            error: function() {
              alert('error');
            }
          });
        } catch(err) {
          console.log(err);
        }
    	};
    },

    updateValueToHtml : function (){
      var _this = this;
      this.$(".replies-container").html("");
      this.collection.fetch({
        success: function(model, response) {
          _this.collection.models = _.sortBy(_this.collection.models, function (reply) { return reply.get("createat")});
          var replies = _this.collection
            , mid = _this.collection.mid;
          // pager
          if (replies.start == 1) _this.$(".replies-pagination .previous-page-btn").css("display", "none");
          // if (replies.length == 0) alert("没有下一页了");
          if (replies.length != replies.count + 1) {
            _this.$(".replies-pagination .next-page-btn").css("display", "none");
          }else{
            replies.shift();
          }
          _this.$(".replies-pagination li").removeClass("disabled");
          // update
          replies.each(function (reply) {
            _this.putData(reply, mid);
          });
        },
        error: function() {
          alert('error');
        }
      });
    },

    putData : function (reply, mid){
      _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

      var content = reply.get("content")
        , rid = reply.get("_id")
        , time = reply.get("createat")
        , user = reply.get("createby")
        , uname = user.uname.name_zh
        , uphoto = user.photo.small
        , uid = user._id
        , to_uname = reply.get("replyto")
        , tmpl = $('#reply-template').html()
        , tmpldata = {mid: mid
                    , rid: rid
                    , content: content
                    , uname: uname
                    , to_uname: to_uname
                    , uphoto: uphoto
                    , uid: uid
                    , time: time
                  };
      this.$(".replies-container").prepend(_.template(tmpl, tmpldata));
      // 增加 content中被回复人的信息
      if (to_uname) this.$(".replies-container dl:first .reply-to").removeClass("hide");
    },
  });

})(message.view("reply"));