
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
    , password = $('#pass').val();
//    , csrftoken = $('#_csrf').val();

//  if (client.browser.ie >=10 || client.browser.chrome !=0 || client.browser.safari !=0) {
//  } else {
//    Alertify.log.info("supported Browsers: chrome, safari, IE10");
//    return;
//  }

  // 必须输入，否则摇一摇
  if (username.length <= 0 || password.length <= 0) {

    var container = $('#container-demo');
    
    container.trigger('startRumble');
    clearTimeout(demoTimeout);
    demoTimeout = setTimeout(function(){container.trigger('stopRumble');}, 200);
  } else {

    smart.doget("/simplelogin?name=" + username + "&password=" + password, function(err, result) {
      if (err) {
        return smart.show("error", "Not correct", "UserID or Password is not correct.");
        //return Alertify.log.info("Not correct");
      }

      window.location = "/message";
    });
  }
  
}
