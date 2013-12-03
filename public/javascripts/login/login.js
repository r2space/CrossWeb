
$(function() {
  $('#container-demo').jrumble({
    x: 4,
    y: 0,
    rotation: 0
  });

  $("#loginform").keypress(function(e){
    if(e.keyCode == 13){
      login();
    }
  });
});

var demoTimeout;
function login() {

  var username = $('#name').val()
    , password = $('#pass').val()
    , csrftoken = $('#_csrf').val();
  
  // 必须输入，否则摇一摇
  if (username.length <= 0 || password.length <= 0) {

    var container = $('#container-demo');
    
    container.trigger('startRumble');
    clearTimeout(demoTimeout);
    demoTimeout = setTimeout(function(){container.trigger('stopRumble');}, 200);
  } else {

    $.ajax({
        url: "/simplelogin"
      , async: false
      , type: "GET"
      , data: {
        "name": username, "pass": password
      }
      , success: function(data, textStatus, jqXHR) {
        if (jqXHR.status != 200) {
          alert(data);
        } else {
          window.location = "/message";
        }
      }
      , error: function(jqXHR, textStatus, errorThrown) {
        alert(jqXHR.responseText);
      }
    });
  }
  
}
