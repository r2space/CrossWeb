(function(ShortMail) {
  
  ShortMail.View = Backbone.View.extend({

    initialize: function(options) {
      var self = this;

      _.bindAll(this, "getMailList", "sideMenuClicked");

      this.model.fetch({
        success: function(){
          self.render();
        }
      });

      // 查看更早的消息
      $("#showEarlier").bind("click", function(){
        self.getMailList(self.uid, $(event.target).attr("date"), 'earlier');
      });

      // 发送
      $("#reply_mail").bind("click",function(){
        self.sendMail(self.uid);
      });

      this.uid = "";
      window.sidemenu.view.onSideMenuClicked = this.sideMenuClicked;
    },

    /**
     * 渲染画面
     */
    render: function() {

      var self = this
        ,  all_users_list = self.model.attributes.data.items;

      // 选中第一个人
      this.uid = all_users_list[0]._id;

      $("#mails-container").empty();        
      self.getMailList(this.uid, '', "unread");             
    },

    /**
     * 侧菜单点击事件
     */
    sideMenuClicked: function(item, type) {

      this.uid = item;

      $("#mails-container").empty();        
      this.getMailList(this.uid, '', "unread");             
      return false;
    },

    // 发送私信
    sendMail: function(uid){

      var self = this;
      var touid = uid               
        , m = $('#send_private_msg').val() ;        
       
      smart.send(touid, m, function(){         
            
        $('#send_private_msg').val("");               
        $("#mails-container").empty();                
        self.getMailList(touid);                       
      });               
    },

    getMailList: function(uid, date, type) {

      var self = this;

      if (!uid) {
        return false;
      }

      var url = "/shortmail/story.json?uid=" + uid + "&type=" + type;
      if(type == 'earlier'){
        url += "&date=" + date;
      }

      smart.doget(url, function(err, result){

        var mails = result.items

        if (mails.length > 0) {
          $("#showEarlier").attr("date",mails[0].createat);
        } else {
          if (type == 'earlier') {
            $("#showEarlier").parent().html(i18n["shortmail.message.noeariler"]);
          } else {
            $("#showEarlier").attr("date","");
          }
        }

        self.showMails(mails);
      });
    },

    showMails: function(mails){

      var currUser,dl,dt;

      // 反序
      mails.reverse();

      _.each(mails, function(mail){

        var content = mail.message
          , mid = mail._id
          , time = mail.createat
          , uid = mail.createby 
          , uname = mail.user.name.name_zh
          , me = $("#userid").val() 
          , uphoto = mail.user.photo && mail.user.photo.small ? "/picture/" + mail.user.photo.small : "/images/user.png";

        var isowner = uid == me;

        if(uid != currUser){
          var tmpl = $('#maillist-template').html();
          $("#mails-container").prepend(_.template(tmpl, ""));
          currUser = uid;
          var uTmpl = $('#maillist-user-template').html()
            , uData = { uid: uid
                      , uphoto: uphoto
                      , uname: uname
                    };
          dl = $("#mails-container dl").first();
          dl.append(_.template(uTmpl,uData));
          dl.append("<hr>");
          dt = dl.children("dt");
        }

        var contentTmpl = $('#maillist-content-template').html()
          , contentData = { mid: mid
                          , time: smart.date(time)
                          , content: content
                        };
        dt.after(_.template(contentTmpl,contentData));

      });
    }

  });

})(shortmail.view("shortmail"));