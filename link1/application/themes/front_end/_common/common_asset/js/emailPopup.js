$(document).ready(function()
{

  $('#guestEmailForm input').keypress(function (e) {
    var key = e.which;
    if(key == 13)  // the enter key code
    { 
      var email = $(this).val();
      if(IsEmail(email)==false || email == ""){
        err_msg = "Please enter a valid email address.";
        $('#guest_email_error').html(err_msg);
        return false;
      }
      else{
        setCookieEmail(email);
        $("#emailModal").modal('hide');
      }        
    }
  });

  $('#guestEmailBtn').click(function(){
    var email = $("#guest_email").val();
    if(IsEmail(email)==false || email == "")
    {
      err_msg = "Please enter a valid email address.";
      $('#guest_email_error').html(err_msg);
      $("#guest_email").addClass('border-danger');
      return false;       
    }
    else{
      setCookieEmail(email);
      $('#guest_email_error').html('');
      $("#guest_email").removeClass('border-danger');
      $("#emailModal").modal('hide');
    }
  });

  function setCookieEmail(email)
  {
    $.ajax({                
      url: base_url+'/set_guest_email_cookie',
      data:{'guest_email':email},            
      type: "POST",
      success:function(result)
      {
        var res = $.trim(result);
        $('#cart_success').show();
        $('#cart_success').html('Information updated successfully.');
        $('#guest_email').val(res);
        $('#cart_success').delay(5000).fadeOut();
      }
    });
  }

  function getGuestCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

	$("body").on("click",".guest_checkout_popup",function(e){
    
    var guestPopup = true;
    var get_guest_cookie = getGuestCookie('guest_email');
    var guest_email_value = $('#guest_email').val();
    
    if(get_guest_cookie!=''){
      var guestPopup = false;
    }
    else if(guest_email_value!=''){
      var guestPopup = false;
    }

    if(guestPopup){
      $('#emailModal').modal('show');
    }
    else{
      $('#emailModal').modal('hide');
    }

    /*
    var guest_email_value = $('#guest_email').val();
    if(guest_email_value!=""){
      $('#emailModal').modal('hide');
    }
    else{
      $('#emailModal').modal('show');
    }
    */
	});

  $("#emailModal").on('hidden.bs.modal', function(){
    $('#guest_email').val('');
    $(this).find('#guest_email_error').html('');
    $(this).find("#guest_email").removeClass('border-danger');
  });

});

