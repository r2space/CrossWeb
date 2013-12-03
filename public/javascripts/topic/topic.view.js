
(function(Topic) {
  
  Topic.View = Backbone.View.extend({

    initialize: function(options) {
      
      var self = this;
      
      this.allCollection = options.allCollection;
      this.myCollection = options.myCollection;

      _.bindAll(this, "previousAllPage", "nextAllPage", "previousMyPage", "nextMyPage");

      $("#topic-save-btn").bind("click", this.saveTopic);
      $("#topic-name").bind("blur", this.checkTopicName);
      $("#letter-filter-all .btn-group .btn").bind("click", this.updateAllTopics);
      $("#letter-filter-my .btn-group .btn").bind("click", this.updateMyTopics);
      $(".btn-joined").on("mouseenter", this.changeIntoLeaveBtn);
      $(".btn-joined").on("mouseout", this.changeIntoJoinedBtn);
      $(".btn-tojoin").on("click", this.joinTopic);
      $(".btn-joined").on("click", this.leaveTopic);

      if ($("title").text() === "话题一览") {
        $(".all-topics-pagination .previous-page-btn").on("click", this.previousAllPage);
        $(".my-topics-pagination .previous-page-btn").on("click", this.previousMyPage);
        $(".all-topics-pagination .next-page-btn").on("click", this.nextAllPage);
        $(".my-topics-pagination .next-page-btn").on("click", this.nextMyPage);
        $().ready(self.updateValueToListHtml());
      } else{
        $().ready(self.updateValueToTopicHtml());
      }
    },

    previousAllPage: function() {
      this.allCollection.start -= this.allCollection.count;
      $(".all-topics-pagination li").addClass("disabled");
      this.updateAllTopics();
      $(".all-topics-pagination .next-page-btn").css("display", "inline-block");
    },
    
    nextAllPage: function() {
      this.allCollection.start += this.allCollection.count;
      $(".all-topics-pagination li").addClass("disabled");
      this.updateAllTopics();
      $(".all-topics-pagination .previous-page-btn").css("display", "inline-block");
    },

    previousMyPage: function() {
      this.myCollection.start -= this.myCollection.count;
      $(".my-topics-pagination li").addClass("disabled");
      this.updateMyTopics();
      $(".my-topics-pagination .next-page-btn").css("display", "inline-block");
    },
    
    nextMyPage: function() {
      this.myCollection.start += this.myCollection.count;
      $(".my-topics-pagination li").addClass("disabled");
      this.updateMyTopics();
      $(".my-topics-pagination .previous-page-btn").css("display", "inline-block");
    },

    updatePager: function(topics, kind) {
      if (kind == "myTopics") {
        kind = "my";
      } else{
        kind = "all";
      };
      if (topics.start == 1) $("." +kind +"-topics-pagination .previous-page-btn").css("display", "none");
      if (topics.length == 0) alert("没有下一页了");
      if (topics.length != topics.count + 1) {
        $("." +kind +"-topics-pagination .next-page-btn").css("display", "none");
      }else{
        topics.pop();
      }
      $("." +kind +"-topics-pagination li").removeClass("disabled");
    },

    updateValueToTopicHtml: function(){
      var self = this;
      this.model.fetch({
        success: function(){
          var topic = self.model.attributes;
          self.putDataIntoTopic(topic);
        }
      });
      //添加言论
      window.message.api.updateValueToHtml(null, null, window.location.href.split("/")[4]);
    },

    putDataIntoTopic: function(topic){

      var topicId = topic._id
        , topicName = topic.title
        , topicAdmin = topic.createby
        , topicMembers = topic.member
        , topicDescription = topic.abstract
        , topicPublic;
      var loginId = $("#userid").val();

      if (topic.category === 0) {
        topicPublic = "公开";
      } else{
        topicPublic = "私密";
      };
      $("#topic-name").text(topicName);
      $("#topic-public em").text(topicPublic);
      $("#topic-description").text(topicDescription);

      $("#join-btn").removeClass("hide");
      if (topicAdmin === loginId) {
        $("#join-btn").addClass("disabled");
        $("#edit-btn").removeClass("hide");
      };
      if (_.contains(topicMembers, loginId)) {
          $("#join-btn").text("已加入");
          $("#join-btn").removeClass("btn-primary btn-tojoin");
          $("#join-btn").addClass("btn-joined");
      };

      //edit model
      $("#topic-name-input").val(topicName);
      $("#topic-description-textarea").val(topicDescription);
      if (topic.category === "1") {
        $(".topic-public :radio[value=1]").attr("checked", "checked");
      } else{
        $(".topic-public :radio[value=0]").attr("checked", "checked");
      }; 
    },

    saveTopic: function(){
      var topicId = window.location.href.split("/")[4]
      var topicName = $("#topic-name-input").val();
      var topicDescription = $("#topic-description-textarea").val();
      var topicPublic = $(".topic-public :checked").val();
      var jrumbleNameTimeout
        , jrumbleDescriptionTimeout;

      $("#topic-name-input").bind("focus", function(){
        $("#topic-name").removeClass("error");
      });
      $("#topic-description-textarea").bind("focus", function(){
        $("#topic-description").removeClass("error");
      });


      $("#topic-name").jrumble({
        x: 4,
        y: 0,
        rotation: 0,
        speed: 30
      });
      if (topicName === "") {
        $("#topic-name").addClass("error");
        $("#topic-name").trigger('startRumble');
        clearTimeout(jrumbleNameTimeout);
        jrumbleNameTimeout = setTimeout(function(){$("#topic-name").trigger('stopRumble');}, 400);

      };
      $("#topic-description").jrumble({
        x: 4,
        y: 0,
        rotation: 0,
        speed: 30
      });
      if (topicDescription === "") {
        $("#topic-description").addClass("error");
        $("#topic-description").trigger('startRumble');
        clearTimeout(jrumbleDescriptionTimeout);
        jrumbleDescriptionTimeout = setTimeout(function(){$("#topic-description").trigger('stopRumble');}, 400);
      };

      if (topicName !== "" && topicDescription !== "") {

        window.topic.model.set({_id: topicId
                      , title: topicName
                      , abstract: topicDescription
                      , content: "请添加内容"
                      , category: topicPublic});
        window.topic.model.save("","",{
          success: function() {
            if (_.isEmpty(topicId)) {
              tid = window.topic.model.get("_id");
              if (!_.isEmpty(tid)) {
                window.location.href = "/topic/"+tid;
              }
            } else{
              $("#message-save-success").removeClass("hide");
            };
          },
        });
      };
    },

    checkTopicName: function(){
      var topicName = $("#topic-name-input").val();
      //判断topic是否存在；
      if (ajaxresult=false) {
        $("#topic-name").addClass("warning");
        //add a label(包括已存在topic的链接)
      };

    },

    changeIntoLeaveBtn: function(){
      $(this).addClass("btn-danger");
      $(this).text("退出话题");

    },

    changeIntoJoinedBtn: function(){
      $(this).removeClass("btn-danger");
      $(this).text("已加入");
    },

    joinTopic: function(){
      var self = this;
      var tid = window.location.href.split("/")[4] ? window.location.href.split("/")[4] : $(this).parent().parent().attr("id").split("-")[1];
      $.post("/topic/addMember.json?_csrf=" + $("#_csrf").val()
            , {"tid": tid}
            , function(result){
              if (result.code === 200) {
                $(self).removeClass("btn-primary btn-tojoin");
                $(self).text("已加入");
                $(self).addClass("btn-joined");
                var memberCountEl = $(self).parent().prev();
                $(memberCountEl).text(parseInt($(memberCountEl).text()) + 1);
              }else{
                alert("您是话题管理员，不能加入或退出话题。");
              };
      });
    },

    leaveTopic: function(){
      var self = this;
      var tid = window.location.href.split("/")[4] ? window.location.href.split("/")[4] : $(this).parent().parent().attr("id").split("-")[1];
      $.post("/topic/removeMember.json?_csrf=" + $("#_csrf").val()
            , {"tid": tid}
            , function(result){
              if (result.code === 200) {
                $(self).removeClass("btn-danger btn-joined");
                $(self).text("申请加入");
                $(self).addClass("btn-primary btn-tojoin");
                var memberCountEl = $(self).parent().prev();
                $(memberCountEl).text(parseInt($(memberCountEl).text()) - 1);
              }else{
                alert("您是话题管理员，不能加入或退出话题。");
              };
      });
    },

    updateValueToListHtml: function(){
      var self = this;
      var kind;
      this.allCollection.fetch({
        success: function() {
          kind = "allTopics";
          self.updatePager(self.allCollection, kind);
          self.putData(self.allCollection, kind);
        },
      });

      this.myCollection.uid = $("#userid").val();
      this.myCollection.fetch({
        success: function() {
          kind = "myTopics";
          self.updatePager(self.myCollection, kind);
          self.putData(self.myCollection, kind);
        },
      });


    },

    updateAllTopics: function(){
      var kind;
      var collection = window.topic.allCollection;
      var view = window.topic.view;
      if (this.innerText === "All" || _.isEmpty(this.innerText)) {
        collection.firstLetter = "";
      }else if (_.isEmpty(this.innerText)) {
        // do nothing
      }else{
        collection.firstLetter = this.innerText;
      };
      collection.uid = "";

      collection.fetch({
        success: function() {
          kind = "allTopics";
          $("#all-topics-container").html("");
          view.updatePager(collection, kind);
          view.putData(collection, kind);
        },
      });

    },

    updateMyTopics: function(){
      var kind;
      var collection = window.topic.myCollection;
      var view = window.topic.view;

      if (this.innerText === "All") {
        collection.firstLetter = "";
      }else if (_.isEmpty(this.innerText)) {
        // do nothing
      }else{
        collection.firstLetter = this.innerText;
      };
      collection.uid = $("#userid").val();

      collection.fetch({
        success: function() {
          kind = "myTopics";
          $("#my-topics-container").html("");
          view.updatePager(collection, kind);
          view.putData(collection, kind);
        },
      });

    },

    putData: function(collection, kind){
      var topicId;
      var topicName;
      var topicMessages;
      var topicMembers;
      var tmpl;
      var tmpldata;
      _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

      collection.each(function (topic) {
        isJoined = false;
        topicId = topic.get("_id");
        topicName = topic.get("title");
        topicDescription = topic.get("abstract");
        topicMembers = topic.get("member");
        topicMembersCount = topicMembers.length;

        tmpl = $('#topic-template').html();
        tmpldata = {id: topicId
                      ,gname: topicName
                      , g_msg_count: "0"
                      , g_member_count: topicMembersCount
                    };
        if (kind === "allTopics") {
          $("#all-topics-container").append(_.template(tmpl, tmpldata));
        } else{
          $("#my-topics-container").append(_.template(tmpl, tmpldata));
        };

        if (_.contains(topicMembers, $("#userid").val())) {
          $("#topic-" + topicId + " .topic-action a").text("已加入");
          $("#topic-" + topicId + " .topic-action a").removeClass("btn-primary btn-tojoin");
          $("#topic-" + topicId + " .topic-action a").addClass("btn-joined");
        };
      });

          
    },
  });

})(topic.view("topic"));

