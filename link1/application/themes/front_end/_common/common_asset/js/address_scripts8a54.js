var host_name = window.location.origin;
var host_name_search = host_name.match('localhost');
if(host_name_search)
{
  var base_url = host_name+'/shopv';
}
else
{
  var base_url = host_name;
}

$(document).ready(function()
{
  $('.edit-customer-address-book').click(function(){
    $(".address_errors").html('');
    var address_id = $(this).attr('data-address-id');
    var address_type = $(this).attr('data-address-type');
    var address_section = $(this).attr('data-address-section');
    if(address_section == 'shipping'){
        $("#user-address-popup .modal-title").html('Edit Shipping Address');
    }else{
        $("#user-address-popup .modal-title").html('Edit Billing Address');
    }
    $.ajax({
        url: base_url+'/get_customer_details',
        type: "POST",
        data: {'address_id':address_id,'address_type':address_type},
        success:function(res)
        {
            var cus_detail = $.parseJSON(res);
            var contact_number = cus_detail.contact_number;
            if(cus_detail.contact_number == '' || cus_detail.contact_number == null){
              contact_number = cus_detail.telephone;
            }

            try {
                var split_contact_number = contact_number.split('-');
                var ccCode = split_contact_number[0];
                var numberValue = '+'+ccCode+' '+split_contact_number[1];

                
                $("#mobile_no").intlTelInput("setNumber", numberValue);
                $("#mobile_no").val(split_contact_number[1]);
                

            } catch(e){
                if(!cus_detail.is_billing){
                    $("#mobile_no").intlTelInput("setNumber", '');
                    $("#mobile_no").val('');
                }
                console.log(e);
            }
            //$("#mobile_no").intlTelInput("setNumber", contact_number);
            
            $('#firstname').val(cus_detail.firstname);
            $('#lastname').val(cus_detail.lastname);
            $('#company').val(cus_detail.company);
            $('#post-code').val(cus_detail.post_code);
            $('#fax').val(cus_detail.fax);
            $('#city').val(cus_detail.city);
            $('#address1').val(cus_detail.address1);
            $('#address2').val(cus_detail.address2);
            $('#telephone').val(cus_detail.telephone);
            $('#country').val(cus_detail.country).trigger('change');

            $('#region-state').data('selected', cus_detail.region_state);

            // setTimeout( function(){
                
            // }, 1000 );

            var save_contact_number = cus_detail.contact_number;
            if(cus_detail.contact_number == ''){
              save_contact_number = cus_detail.telephone;
            }

            if(!cus_detail.is_billing){
              
              $('#mobile_number').val('');
            }
            else{
              $('#mobile_number').val(save_contact_number);
            }

            var otp_confirmation = cus_detail.otp_confirmation;
            var is_verified = cus_detail.is_verified;

            if(cus_detail.otp_confirmation == 'no'){
              is_verified = 'yes';
            }
            
            //$('#mobile_no').val(user_contact_number[1]);
            $('#mobile_no').attr('data-otp-confirmation',otp_confirmation);
            $('#mobile_no').attr('data-is-verified',is_verified);
            $('#address_id').val(address_id);
            $('#form_type').val(address_type);
            $('#address_type').val(address_section);
            $('#mobile_no').attr("data-address-no", address_id);
            $('#user-address-popup').modal("show");
        }
    });
  });

  $('#update-user-address-book').click(function(){
      $(".address_errors").html('');    
      var error_count = 0;
      var address_id = $(this).parents('#user-address-popup').find('#address_id').val();
      var formType = $(this).parents('#user-address-popup').find('#form_type').val();
      var address_type = $('#address_type').val();
      var customer_id = $('#customer_id').val();
      var firstname = $.trim($('#firstname').val());
      var lastname = $.trim($('#lastname').val());
      var mobile_no_val = $('#mobile_no').val();
      var countryData = $("#mobile_no").intlTelInput("getSelectedCountryData");
      var dialCode = countryData.dialCode;
      var mobile_number = dialCode+'-'+mobile_no_val;

      var company = $('#company').val();
      var post_code = $.trim($('#post-code').val());
      var fax = $('#fax').val();
      var city = $.trim($('#city').val());
      var address1 = $.trim($('#address1').val());
      var address2 = $('#address2').val();
      var telephone = $('#telephone').val();
      var country = $('#country').val();
      var region_state = $('#region-state').val();
      var validate_address = validateUserAddressBook(firstname,lastname,mobile_no_val,city,address1,post_code,country,region_state);
      if(validate_address)
      {
          addressId = false;
          if(address_id){
              addressId = address_id;
          }

          var customer_verified = $('#mobile_no').attr('data-is-verified');
          var need_otp_confirmation = $('#mobile_no').attr('data-otp-confirmation');
          if(customer_verified == "yes" || need_otp_confirmation == 'no'){

              $.ajax({
                  type : "POST",
                  url : base_url+'/update_customer_address',
                  data : {'customer_id':customer_id,'firstname':firstname,'lastname':lastname,'mobile_number':mobile_number,'need_verification':customer_verified,'company':company,'post_code':post_code,'fax':fax,
                      'city':city,'address1':address1,'address2':address2,'telephone':telephone,'country':country,'region_state':region_state,'addressID':address_id,'address_type':address_type},
                  success:function(response)
                  {
                      var editResult = $.parseJSON(response);
                      // console.log(editResult);
                      var up_firstname = $.trim(editResult.firstname);
                      var up_lastname = $.trim(editResult.lastname);
                      var up_address = $.trim(editResult.address1);
                      var contact_no = $.trim(editResult.contact_no);
                      var error = $.trim(editResult.error);
                      var err_message = $.trim(editResult.err_message);
                      var is_verified = $.trim(editResult.is_verified);
                      var otp_confirmation = $.trim(editResult.otp_confirmation);
                      var city = $.trim(editResult.city);
                      var stateName = $.trim(editResult.stateName);
                      var countryName = $.trim(editResult.countryName);
                      var post_code = $.trim(editResult.post_code);
                      var stateId = $.trim(editResult.state);
                      
                      if(error == "true"){
                          if(err_message == "number_changed"){
                              sendOtp();
                          }
                          else
                          {
                            $('.input-error').show().delay(5000).fadeOut();
                            $('.input-error').html(err_message);  
                          }
                      }
                      else{
                          $('#user-address-popup #mobile_number').val(contact_no);
                          $('#user-address-popup #mobile_no').attr('data-otp-confirmation',otp_confirmation);
                          $('#user-address-popup #mobile_no').attr('data-is-verified',is_verified);
                          
                          $('.cus-name-'+address_id).html(up_firstname+' '+up_lastname);
                          $('.cus-address-'+address_id).html(up_address);
                          
                          if(stateName){
                              var stateSepetator = ", ";
                          }else{
                              var stateSepetator = '';
                          }
                          
                          $('.city-state-country-'+address_id).html(city+', '+stateName+stateSepetator+countryName);
                          $('.cus-contact-'+address_id).html(contact_no);
                          $('.cus-post-code-'+address_id).html(post_code);

                          if(formType && formType == 'add_new'){
                               window.location.reload();
                          }else{
                              window.location.reload();
                              $("#user-address-popup").modal("hide");
                          }
                          $('.input-error').hide();
                          $('.input-error').html('');
                      }
                  }
              });
          }
          else{
              sendOtp();
          }
      }
  });
  
  function sendOtp()
  {
    var customer_id = $('#user-address-popup #customer_id').val();
    var mobile_number = $("#user-address-popup #mobile_no").val();

    var countryData = $("#user-address-popup #mobile_no").intlTelInput("getSelectedCountryData");
    var dialCode = countryData.dialCode;
    mobile_number = dialCode+'-'+mobile_number;
    $('#user-address-popup .input-error').html('').hide();
    $.ajax({              
        url:base_url+'/send_otp_sms',                   
        type:"POST",
        data:{"mobile_number":mobile_number,'customer_id':customer_id},
        success:function(verifyOtp)
        {
          var otp_id = $.trim(verifyOtp);
          if(otp_id == 'exist'){
            $('#user-address-popup .input-error').html('Number already in use.').show().delay(6000).fadeOut();
          } else if( otp_id == 'current_verified' ) {
            $('#user-address-popup #mobile_no').attr('data-is-verified','yes');
          } else {
            $("#verify-customer-otp").modal("show");
            $('#verify-customer-otp #customer-otp-verification').attr('data-last-otpid',otp_id);
          }
        }
    });
  }

  $('#customer-otp-verification').click(function(){
    var otp_number = $('#otpNumber').val();
    var last_otp_id = $(this).attr('data-last-otpid');
    var customer_id = $('#user-address-popup #customer_id').val();
    
    if(otp_number!= "" && !isNaN(otp_number))
    {
      $('.otpError').html('');
      $.ajax({
          type : "POST",
          url : base_url+'/otp_code_validation',
          data : {'enteredCode':otp_number,'otp_id':last_otp_id,'customer_id':customer_id},
          async: false, 
          success: function(validate_res){
              var validate_result = $.trim(validate_res);
              if(validate_result == "success")
              {
                $('#verify-customer-otp').modal('hide');
                $('#user-address-popup #mobile_no').attr('data-is-verified','yes');
                $('#user-address-popup #otpNumber').val('');
                $('.otpError').removeClass('input-error');
                $('#update-user-address-book').trigger('click');
              }
              else{
                $('.otpError').html('Invalid OTP.');
                $('.otpError').addClass('input-error');
              }
          }
      });
    }
    else{
      $('.otpError').html('Please enter valid OTP.');
      $('.otpError').addClass('input-error');
    }
  
  });

  $('#verify-customer-otp').on('hidden.bs.modal', function(){
    $('.otpError').html('');
    $('#otpNumber').val('');
    $('.otpError').removeClass('input-error');
  });


  /*****country flag dropdown end**********/

$("body").on("change",".country-addbook",function(){
  var countryID = $(this).val();
  $("#user-address-popup #region-state").html('');
  $('#update-user-address-book').prop("disabled", true);	
  $.ajax({
        url: base_url+'/selectstate',
        data:{'country_id':countryID},
        dataType: "json",
        success:function(res)
        {
            $('#update-user-address-book').prop("disabled", false);
            var data = '';
            for(var i = 0 ; i< res.length ; i++)
            {
                var zone_id = res[i]["zone_id"];
                var zone_val = res[i]["zone_name"];
                data += '<option value="'+ zone_id+'">'+ zone_val +'</option>';
            }

            if(data == ""){	
              $("#user-address-popup #region-state").val('');

              if(countryID){
                $("#user-address-popup .state-list").hide();
              }
              else{
                $("#user-address-popup .state-list").show();
                data += '<option value="">Please Select</option>';
                $("#user-address-popup #region-state").html(data);
              }
            }
            else{
              $("#user-address-popup .state-list").show();
              $("#user-address-popup #region-state").html(data);
              var selected = $("#user-address-popup #region-state").data('selected');
              if(selected!='') {
                
                if( $("#user-address-popup #region-state option[value="+selected+"]").length > 0 ){
                  $("#user-address-popup #region-state").val( selected );
                  $("#user-address-popup #region-state").parent().find('.address_errors').html('');
                }
                else{
                  $("#user-address-popup #region-state:first-child").attr("selected", "selected");
                }
              }
              else{
                $("#user-address-popup #region-state:first-child").attr("selected", "selected");
              }
            }
        }
    });
});

$("body").on("input", ".post-code-addbook", function(e){
  // console.log('this');
  var post_code_value = $.trim($(this).val());
  var regex = /^[A-Za-z0-9]+$/;

  if (regex.test(post_code_value)) // allow only number and charactors
  {
    if( post_code_value!='' && post_code_value.length >= 6 ){
      
      $('#loader').show();

      $('#user-address-popup').find('#update-user-address-book').prop("disabled", true);
      $.ajax({
        url: base_url+'/get_geo_state_city_from_zipcode',
        data:{'zipcode':post_code_value},
        type: "POST",
        success:function(res){

            $('#user-address-popup').find('#update-user-address-book').prop("disabled", false);
            $('#loader').hide();
            
            if(res!=''){
              result = $.parseJSON(res);
              var city_name = result.city;
              var state_id = result.state;
              var country_id = result.country;
              if(country_id!=''){
                $('#user-address-popup #country').val(country_id).trigger('change');
                $('#user-address-popup #country').parent().find('.address_errors').html('');
              }
              else{
                $('#user-address-popup #country').val('');
              }
              if(state_id!=''){
                $('#user-address-popup #region-state').data('selected', state_id);
                $('#user-address-popup #region-state').parent().find('.address_errors').html('');
                // $("#user-address-popup #region-state").find('option[value="'+state_id+'"]').prop("selected", "selected");
                
              }
              else{
                $('#user-address-popup #region-state').data('selected', '');
                // $("#user-address-popup #region-state").val('');
              }
              if(city_name!=''){
                $("#user-address-popup #city").val(city_name);
                $('#user-address-popup #city').parent().find('.address_errors').html('');
              }
              else{
                $("#user-address-popup #city").val('');
              }

            }
            // console.log(res);
        },
        error: function (jqXHR, exception) {
          $('#update-user-address').prop("disabled", false);
        }
      });
        
    }
  }

});

function validateUserAddressBook(firstname,lastname,mobile_no_val,city,address1,post_code,country,region_state)
{
  var latterOnly = /^[a-zA-Z\s]+$/;
  var count = 0;
  if(firstname == "")
  {
    $('#first_name_err').html("Please enter firstname.");
    count++;
  }
  if(!latterOnly.test(firstname)){
    $('#first_name_err').html("Please enter valid firstname.");
    count++;
  }
  if(lastname == "")
  {
    $('#last_name_err').html("Please enter lastname.");
    count++;
  }
  if(!latterOnly.test(lastname)){
    $('#last_name_err').html("Please enter valid lastname.");
    count++;
  }
  if(mobile_no_val.length < 7 || mobile_no_val.length > 10){
    $('#mobile_number_err').html("Mobile number length should be greater than 7 and less than 11");
          count++;
  }
  if(mobile_no_val == "")
  {
      $('#mobile_number_err').html("Please enter mobile number.");
      count++;
  }
  if(isNaN(mobile_no_val))
  {
      $('#mobile_number_err').html("Please enter number format.");
      count++;
  }
  if(city == "")
  {
    $('#city_err').html("Please enter city.");
    count++;
  }
  if(address1 == "")
  {
    $('#address1_err').html("Please enter address.");
    count++;
  }
  if(isNaN(post_code))
  {
      $('#post_code_err').html("Please enter valid pincode.");
      count++;
  }
  if(post_code == "")
  {
      $('#post_code_err').html("Please enter pincode.");
      count++;
  }
  if(country == "" || country == '-1' || country == null)
  {
    $('#country_err').html("Please enter country.");
    count++;
  }
  stateLength = $(document).find('#region-state').find('option').length;
  if(stateLength > 0){
    if(!region_state || region_state == null){
      $('#region_state_err').html("Please enter region state.");
      count++;
    }
  }
  if(count > 0){
    return false;
  }
  else{
    $('.address_errors').html("");
    return true;
  }
        
}

$(".customer_address_popup input").each(function(){
  $(this).on("input", function(){
    var this_input = $(this).attr("id");
    var element = $(".customer_address_popup #"+this_input);
    var element_val = $.trim(element.val());
    validateUserAddressBookKeypress(this_input,element,element_val);
  });
});

function validateUserAddressBookKeypress(this_input,element,element_val){
  var latterOnly = /^[a-zA-Z\s]+$/;
  if(this_input == 'firstname'){
    if(element_val == "")
    {
      $('#first_name_err').html("Please enter firstname.");
    }
    else if(!latterOnly.test(element_val)){
      $('#first_name_err').html("Please enter valid firstname.");
    }else{
      $('#first_name_err').html("");
    }
  }
  if(this_input == 'lastname'){
    if(element_val == ""){
      $('#last_name_err').html("Please enter lastname.");
    }
    else if(!latterOnly.test(element_val)){
      $('#last_name_err').html("Please enter valid lastname.");
    }else{
      $('#last_name_err').html("");
    }
  }
  if(this_input == 'mobile_no'){
    if(element_val == ""){
      $('#mobile_number_err').html("Please enter mobile number.");
    }
    else if(isNaN(element_val)){
      $('#mobile_number_err').html("Please enter number format.");
    }
    else if(element_val.length < 7 || element_val.length > 10){
      $('#mobile_number_err').html("Mobile number length should be greater than 7 and less than 11");
    }else{
      $('#mobile_number_err').html("");
    }
  }
  if(this_input == 'address1'){
    if(element_val == ""){
      $('#address1_err').html("Please enter address.");
    }else{
      $('#address1_err').html("");
    }
  } 
  if(this_input == 'post-code'){
    if(element_val == ""){
      $('#post_code_err').html("Please enter pincode.");
    }
    else if(isNaN(element_val)){
      $('#post_code_err').html("Please enter valid pincode.");
    }
    else{
      $('#post_code_err').html("");
    }
  }
  if(this_input == 'city'){
    if(element_val == ""){
      $('#city_err').html("Please enter city.");
    }
    else{
      $('#city_err').html("");  
    }
  }
}

$("body").on("change", "select", function(){
  var this_val = $(this).val();
  if(this_val!=''){
    $(this).parent().find(".address_errors").html('');
  }
});
  
$('body').on('click', '.delete_ship_address_book', function(){
    var address_id = $(this).attr('data-address-id');

    if( $(document).find('#deleteAddressModal').length > 0 ){
      $('#deleteAddressModal').modal('show');
      $('#addressDeleteBtn').attr('data-address',address_id);
    }
    else if( confirm("Do you really want to delete this address ?") ){
      deleteUserAddress(address_id);
    }
    else{
      return false;	
    }
});

$('#deleteAddressModal').on('hide.bs.modal', function(){
  $(this).find('#addressDeleteBtn').attr('data-address','');
});

$('body').on('click','#addressDeleteBtn', function(){
  var addressId = $(this).attr('data-address');
  deleteUserAddress(addressId);
});

function deleteUserAddress(address_id){
  $(document).find('#loader').show();
  $.ajax({
    url: base_url+'/delete_customer_address_details',
    data:{'address_id':address_id},
    type: "POST",
    success:function(res){
      window.location.reload();
    },
    error:function(xhr, status, error){
      $(document).find('#loader').hide();
      var msg = xhr.responseText;
      alert(msg);
    }
  });
}

$("body").on("input", "#userDetailForm_validation #post-code", function(e){

    var post_code_value = $.trim($(this).val());
    var regex = /^[A-Za-z0-9]+$/;

    if (regex.test(post_code_value)) // allow only number and charactors
    {
      if( post_code_value!='' && post_code_value.length >= 6 ){
        
        $('#update_account_detail_btn').prop("disabled", true);
        $(document).find('#loader').show();
        $.ajax({
            url: base_url+'/get_geo_state_city_from_zipcode',
            data:{'zipcode':post_code_value},
            type: "POST",
            success:function(res){

                $('#update_account_detail_btn').prop("disabled", false);
                $(document).find('#loader').hide();
                
                if(res!=''){
                    result = $.parseJSON(res);
                    var city_name = result.city;
                    var state_id = result.state;
                    var country_id = result.country;
                    
                    
                    if(country_id!=''){
                        $('#country').val(country_id).trigger('change');
                    }
                    else{
                      $('#country').val('');
                        //$('#country').val(country_id).trigger('change');
                    }
                    if(state_id!=''){
                    
                      setTimeout(function(){
                        $("#region-state").find('option[value="'+state_id+'"]').prop("selected", "selected");
                      },1000);
                        
                    }
                    else{
                        //$("#region-state").find('option[value="'+state_id+'"]').prop("selected", "selected");
                        //$('#region-state').data('selected', '');
                        $("#region-state").val('');
                    }
                    if(city_name!=''){
                        $("#city").val(city_name);
                    }
                    else{
                      $("#city").val('');
                    }

                }
                // console.log(res);
            },
            error: function (jqXHR, exception) {
              // $('#update-user-address').prop("disabled", false);
            }
        });
        
      }
    }
});

/******** Useraccount active sidebar links : start ********/
var pageSlug = '';
var accountUrl = '';
var page_url = window.location.href;

var current_host_name = window.location.origin;
var host_name_search = current_host_name.match('localhost');
if(host_name_search){
  var siteUrl = current_host_name+'/shopv';
}
else{
  var siteUrl = current_host_name;
}

var newUrl = siteUrl.split("/");
var lastIndex = newUrl[newUrl.length-1];

if(lastIndex == '/'){
  accountUrl = siteUrl+'account';
}else{
  accountUrl = siteUrl+'/account';
}

if(page_url.indexOf(accountUrl) > -1){

  var splitURL = page_url.split("/");
  var lastIndex = splitURL[splitURL.length-1];
  if(lastIndex == ''){
      pageSlug = splitURL[splitURL.length-2];
  }
  else{
      pageSlug = lastIndex;
  }

  var secondLast = splitURL[splitURL.length-2];
  var orderView = secondLast+'/'+pageSlug;
  if(orderView.indexOf('?') > -1){
      splitStr = orderView.split("?");
      orderView = splitStr[0];
  }

  var accordianType = $(document).find('.accordion');
  if(accordianType.length > 0){
    var target = $(document).find('.accordion .accordion-heading'); 
  }
  else{
    var target = $(document).find('ul li');
  }

  $(target).each(function(){
      var thisHref = $(this).find('a').attr('href');
      if(thisHref != "#" && thisHref != undefined){

          var lastChar = thisHref[thisHref.length -1];
          if(lastChar == "/"){
            thisHref = thisHref.slice(0,-1);
          }
          var splitNav = thisHref.split("/"); 
          splitSlug = splitNav[splitNav.length -1];
          var splitSlug = $.trim(splitSlug);

          if(pageSlug == splitSlug){
            if(!$(this).hasClass('active')){
              $(this).addClass('active');
            }
          }
          else if((orderView == 'order/view' || orderView == 'order/cancel' || orderView == 'order/return_order' || page_url.indexOf('account/orders')>-1) && splitSlug == 'orders'){
            if(!$(this).hasClass('active')){
              $(this).addClass('active');
            }
          }
      }
  });
}
/******** Useraccount active sidebar links : end ********/

});