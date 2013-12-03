
$(function() {
  $('#container').jrumble({
    x: 4,
    y: 0,
    rotation: 0
  });

  $("#registerform").keypress(function(e){
    if(e.keyCode == 13){
      login();
    }
  });

  $("#animate").hide();
});

var demoTimeout;
function register() {

  var email = $('#email').val()
    , csrftoken = $('#_csrf').val();
  
  // 必须输入，否则摇一摇
  if (email.length <= 0 || !isEmail(email)) {

    var container = $('#container-demo');
    
    container.trigger('startRumble');
    clearTimeout(demoTimeout);
    demoTimeout = setTimeout(function(){container.trigger('stopRumble');}, 200);
  } else {

    $("#animate").show();
    $.ajax({
        url: "/register"
      , async: true
      , type: "POST"
      , data: {
        "email": email, "_csrf": csrftoken
      }
      , success: function(data, type) {
        $("#animate").hide();

        if (data.error) {
          alert(data.error);
        } else {
          alert("请确认我们给您发送的邮件，来完成注册");
          // window.location = "/login";
        }
      }
      , error: function(jqXHR, textStatus, errorThrown) {
        $("#animate").hide();
        alert(errorThrown);
      }
    });
  }
  
  return false;
}

function isEmail(email) { 
  var regexstr = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regexstr.test(email);
} 
