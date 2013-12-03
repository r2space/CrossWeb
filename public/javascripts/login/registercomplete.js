
$(function() {

  var csrftoken = $('#_csrf').val()
    , email = $("#email").val()
    , emailtoken = $("#emailtoken").val();

  $.ajax({
      url: "/register/confirm"
    , async: true
    , type: "POST"
    , data: {
      "email": email, "emailtoken": emailtoken, "_csrf": csrftoken
    }
    , success: function(data, type) {

      if (data.error) {
        $("#message").html("非常抱歉，未能激活账户");
      } else {
        $("#message").html("您已成功激活账户");
        setTimeout(function(){window.location = "/login";}, 2000);
      }
    }
    , error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      $("#message").html("非常抱歉，未能激活账户");
    }
  });

});

