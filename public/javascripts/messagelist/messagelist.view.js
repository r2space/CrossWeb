(function(MessageList) {
  
  MessageList.View = Backbone.View.extend({

    initialize: function(options) {
    	//初始化变量
    	var self = this
        , uid = smart.uid()
        , atUrl = "/notification/list.json?type=at"
        , commentUrl = "/notification/list.json?type=reply";       


        $("#_group1 li").eq(1).removeClass("active");
        $("#_group1 li").eq(2).addClass("active");
        var type = $("#type").val();
        if(type == "at"){
            this.model.type="at";
            this.fetchAt(self,1);
        }
        if(type == "comment"){
            this.model.type="reply";
            this.fetchReply(self,1);
        }
        if(type == "follow"){
            this.model.type="follow";
            this.fetchFollow(self,1);
        }
        if(type == "box"){
            this.model.type="box";
            this.fetchBox(self,1);
        }
        if(type == "group"){
            this.model.type="group";
            this.fetchGroup(self,1);
        }
        


    	
    },

    fetchBox : function(self,pagenum){
        this.model.start = (pagenum - 1) * this.model.limit;
        this.model.curpage = pagenum; 
        this.model.type = "box";
        this.model.fetch({
            success: function(){
              self.boxRender(self);
            }

        });
    },
    boxRender:function(self){
        //渲染画面  
        var c = $("#messages-container").html('');
        var tmpl = $('#msg-box-content-template').html();
        if(parseInt(this.model.total) != 0){
            $("#messages-container").prepend();
            //result.reverse();
            _.each(this.model.items, function(mmsg){

                 c.append(_.template(tmpl, {'uname':mmsg.part.createby.name.name_zh
                    ,'content':mmsg.content ? mmsg.content : " "
                    ,'tcontent':mmsg.part.targetmsg.content ?mmsg.part.targetmsg.content : " "
                    ,'mid':mmsg.target
                    ,"time": smart.date(mmsg.createat)
                    ,"uid":mmsg.part.createby.id

                    ,"uphoto":mmsg.part.createby.photo && mmsg.part.createby.photo.big? "/picture/" + mmsg.part.createby.photo.big : "/images/user.png"
                }));

            });
            smart.pagination(parseInt(this.model.total),this.model.limit, this.model.curpage, "messagelist-home", function(){
                
                var pagenum = $(event.target).attr("id").split("_")[1];
                if(pagenum > 0){
                    
                    self.fetchBox(self,pagenum);
                    return false;
               
                }
              });
        } else {
            $("#messages-container").html(i18n["message.list.lable.nothing"]);
        }           
    },
    fetchGroup:function(self,pagenum){
            this.model.start = (pagenum - 1) * this.model.limit;
            this.model.curpage = pagenum; 
            this.model.type = "invite,remove";
            this.model.fetch({
                success: function(){
                  self.replyGroup(self);
                }

            });
    },
    fetchRemove:function(self,pagenum){
            this.model.start = (pagenum - 1) * this.model.limit;
            this.model.curpage = pagenum; 
            this.model.type = "group";
            this.model.fetch({
                success: function(){
                  self.replyRemove(self);
                }

            });
    },
    fetchFollow:function(self,pagenum){
            this.model.start = (pagenum - 1) * this.model.limit;
            this.model.curpage = pagenum; 
            this.model.type = "follow";
            this.model.fetch({
                success: function(){
                  self.replyFollow(self);
                }

            });
    },

    fetchAt:function(self,pagenum){
            this.model.start = (pagenum - 1) * this.model.limit;
            this.model.curpage = pagenum; 
            this.model.type = "at";
            this.model.fetch({
                success: function(){
                  self.render(self);
                }

            });
    },
    fetchReply:function(self,pagenum){

            this.model.start = (pagenum - 1) * this.model.limit;
            this.model.curpage = pagenum;
            this.model.type = "reply";
            this.model.fetch({
                success: function(){
                  self.replyRender(self);
                }

            });
    },
    replyRead:function(items){
        var nids = [];
        _.each(this.model.items, function(mmsg){
            nids.push(mmsg._id);

        });
        smart.doput("/notification/read.json", {"nids": nids}, function(err, result){
            // console.log("read");
          });
    },
    replyGroup:function(self){

        //渲染画面  


        var c = $("#messages-container").html('');
        var invitetmpl = $('#msg-invite-content-template').html();
        var removetmpl = $('#msg-remove-content-template').html();
        if(parseInt(this.model.total) != 0){
            $("#messages-container").prepend();
            //result.reverse();
            _.each(this.model.items, function(mmsg){
                if(mmsg.type == "invite"){
                    c.append(_.template(invitetmpl, {'uname':mmsg.user.name.name_zh
                        ,'title':mmsg.content
                        ,'mid':mmsg.objectid
                        ,"time": smart.date(mmsg.createat)
                        ,"uid":mmsg.user._id
                        ,"uphoto":mmsg.user.photo && mmsg.user.photo.big? "/picture/" + mmsg.user.photo.big : "/images/user.png"
                    }));
                }else{
                    c.append(_.template(removetmpl, {'uname':mmsg.user.name.name_zh
                        ,'title':mmsg.content
                        ,'mid':mmsg.objectid
                        ,"time": smart.date(mmsg.createat)
                        ,"uid":mmsg.user._id
                        ,"uphoto":mmsg.user.photo && mmsg.user.photo.big? "/picture/" + mmsg.user.photo.big : "/images/user.png"
                    }));
                }
                 

            });
            this.replyRead(this.model.items);
            smart.pagination(parseInt(this.model.total),this.model.limit, this.model.curpage, "messagelist-home", function(){
                
                var pagenum = $(event.target).attr("id").split("_")[1];
                if(pagenum > 0){
                    
                    self.fetchGroup(self,pagenum);
                    return false;
               
                }
              });
        } else {
            $("#messages-container").html(i18n["message.list.lable.nothing"]);
        }
        

    },
    replyFollow:function(self){

        //渲染画面  


        var c = $("#messages-container").html('');
        var tmpl = $('#msg-follow-content-template').html();
        if(parseInt(this.model.total) != 0){
            $("#messages-container").prepend();
            //result.reverse();
            _.each(this.model.items, function(mmsg){

                 c.append(_.template(tmpl, {'uname':mmsg.user.name.name_zh
                    ,'title':mmsg.content
                    ,'mid':mmsg.objectid
                    ,"time": smart.date(mmsg.createat)
                    ,"uid":mmsg.user._id

                    ,"uphoto":mmsg.user.photo && mmsg.user.photo.big? "/picture/" + mmsg.user.photo.big : "/images/user.png"
                }));

            });
            this.replyRead(this.model.items);
            smart.pagination(parseInt(this.model.total),this.model.limit, this.model.curpage, "messagelist-home", function(){
                
                var pagenum = $(event.target).attr("id").split("_")[1];
                if(pagenum > 0){
                    
                    self.fetchFollow(self,pagenum);
                    return false;
               
                }
              });
        } else {
            $("#messages-container").html(i18n["message.list.lable.nothing"]);
        }
        

    },
    replyRemove:function(self){

        //渲染画面  


        var c = $("#messages-container").html('');
        var tmpl = $('#msg-remove-content-template').html();
        if(parseInt(this.model.total) != 0){
            $("#messages-container").prepend();
            //result.reverse();
            _.each(this.model.items, function(mmsg){

                 c.append(_.template(tmpl, {'uname':mmsg.user.name.name_zh
                    ,'title':mmsg.content
                    ,'mid':mmsg.objectid
                    ,"time": smart.date(mmsg.createat)
                    ,"uid":mmsg.user._id

                    ,"uphoto":mmsg.user.photo && mmsg.user.photo.big? "/picture/" + mmsg.user.photo.big : "/images/user.png"
                }));

            });
            this.replyRead(this.model.items);
            smart.pagination(parseInt(this.model.total),this.model.limit, this.model.curpage, "messagelist-home", function(){
                
                var pagenum = $(event.target).attr("id").split("_")[1];
                if(pagenum > 0){
                    
                    self.fetchRemove(self,pagenum);
                    return false;
               
                }
              });
        } else {
            $("#messages-container").html(i18n["message.list.lable.nothing"]);
        }
        

    },
    replyRender:function(self){

        //渲染画面  


        var c = $("#messages-container").html('');
        var tmpl = $('#msg-reply-content-template').html();
        if(parseInt(this.model.total) != 0){
            $("#messages-container").prepend();
            //result.reverse();
            _.each(this.model.items, function(mmsg){

                 c.append(_.template(tmpl, {'uname':mmsg.user.name.name_zh
                    ,'title':mmsg.content
                    ,'mid':mmsg.objectid
                    ,"time": smart.date(mmsg.createat)
                    ,"uid":mmsg.user._id

                    ,"uphoto":mmsg.user.photo && mmsg.user.photo.big? "/picture/" + mmsg.user.photo.big : "/images/user.png"
                }));

            });
            this.replyRead(this.model.items);
            smart.pagination(parseInt(this.model.total),this.model.limit, this.model.curpage, "messagelist-home", function(){
                
                var pagenum = $(event.target).attr("id").split("_")[1];
                if(pagenum > 0){
                    
                    self.fetchReply(self,pagenum);
                    return false;
               
                }
              });
        } else {
            $("#messages-container").html(i18n["message.list.lable.nothing"]);
        }
        

    },
    /**
     * 渲染画面
     */
    render: function(self) {
		//渲染画面  
        var c = $("#messages-container").html('');
        var tmpl = $('#msg-content-template').html();
        if(parseInt(this.model.total) != 0){
            $("#messages-container").prepend();
            //result.reverse();

            _.each(this.model.items, function(mmsg){

                 c.append(_.template(tmpl, {'uname':mmsg.user.name.name_zh
                    ,'title':mmsg.content
                    ,'mid':mmsg.objectid
                    ,"time": smart.date(mmsg.createat)
                    ,"uid":mmsg.user._id
                    ,"uphoto":mmsg.user.photo && mmsg.user.photo.big? "/picture/" + mmsg.user.photo.big : "/images/user.png"
                }));

            });
            this.replyRead(this.model.items);
            smart.pagination(parseInt(this.model.total),this.model.limit, this.model.curpage, "messagelist-home", function(){
                
                var pagenum = $(event.target).attr("id").split("_")[1];
                if(pagenum > 0){
                    
                    self.fetchAt(self,pagenum);
                    return false;
               
                }
              });
        } else {
            $("#messages-container").html(i18n["message.list.lable.nothing"]);
        }
        


    }

});

})(messagelist.view("messagelist"));


