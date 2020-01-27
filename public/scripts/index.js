//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

var current_url= window.location.pathname;//content after domain 
var current_url_query = window.location.search; //url contents after ?
var current_domain = window.location.host;//domain en port//use this on live


//change protocol to unsecured if coming from unsecured site ::
var http_https = "https://"; 

if(location.protocol === 'http:'){
	http_https = 'http://';//return http
}

//hide or show div

function show_hide(div, to_show_hide = 'hide'){

    //if  show_hide = 'hide'; then hide the html division else show it
    to_show_hide == 'hide'?document.getElementById(div).style.display='none' : document.getElementById(div).style.display='display';
}








//++++++++++++++++++++++++++ add account ++++++++++++++++++++++++++

if(current_url_query != '?'){//check if its a previouse upload and give necessary messages if so

    if(current_url_query == '?upload=file_upload_profile_exists'){//account created
     
        alert('Identity already registered, with another account.');//show alert
        
        window.open(http_https + current_domain, '_self');//open home page
    }

    if(current_url_query == '?upload=file_upload_success'){//account created
     
        alert('Account created');//show alert
        
        window.open(http_https + current_domain, '_self');//open home page
    }

    if(current_url_query == '?upload=file_upload_data_missing'){//if error
        
        add_new_account(); //show profile form
       
    }




} 

function add_new_account(){

    var url = http_https + current_domain + '/upload';//make request to upload api on server

    $.get(url, function(response, status){
       // console.log(status, response);

       if(status == 'success'){ //if response recieved
            if(response==''){//if response is empty give error
                
                alert('There was an error getting resources to create your profile, please try again')
            
            }
            else{//else show form

                document.getElementById('profile_form_container').innerHTML='';//clean div of previous contents

                $('#profile_form_container').append(response);//add forn data from server
                document.getElementById('profile_form_container').style.display='block';//show form as popup
            }

        }
        else{
            //connection/server error
            alert('[connection/server error]\n\r. There was an error getting resources to create your profile, please try again later.')
        }
    })



}



//++++++++++++++++++++++++++ porpulate homepage ++++++++++++++++++++++++++

function home_page_porpulate(){

    var url = http_https + current_domain + '/home_profile_data';//make request to upload api on server

    $.get(url, function(response, status){
       // console.log(status, response);

       if(status == 'success'){ //if response recieved
        //console.log(response)
            if(response==''){//if response is empty give error
                
                alert('There was an error getting resources, refresh page')
            
            }
            else if(response == 'show_profile_add_form'){//no user in db/allow user add

                alert('No profile loaded in database, please add one.');
                return add_new_account();//show profile add form

            }

            else{//else append items

                document.getElementById('main_background_profile_iages').innerHTML='';//clean div of previous contents

                var browser_screen_height = screen.height;//get screen height in px
                var browser_screen_width = screen.width;//get screen width in px
                

                for(var i = 0; i <= response.length -1; i++){

                    
                    $('#main_background_profile_iages').append(`<img src='${response[i].user_profile_picture}' style='width:${((browser_screen_width )*0.25)}px;height:${((browser_screen_width)*0.25)}px;' alt='${ response[i].user_name + '' + response[i].user_last_name }' onclick="user_info('${response[i].user_name}', '${response[i].user_last_name}', '${response[i].user_country}', '${response[i].user_city}', '${response[i].user_about_me}', '${response[i].user_join_month}', '${response[i].user_join_year}', '${response[i].user_join_day}', '${response[i].user_birth_month}', '${response[i].user_birth_year}', '${response[i].user_direct_relation}', '${response[i].user_profile_picture}', '${response[i].user_birth_day}')">`);//add profiles as background

                    
                }
                
               
               
            }

        }
        else{
            //connection/server error
            alert('[connection/server error]\n\r. There was an error getting resources, please refresh page or try again later.')
        }
    })



}


//function show user profile data

function user_info( user_name, user_last_name, user_country, user_city, user_about_me, user_join_month, user_join_year, user_join_day, user_birth_month, user_birth_year, user_direct_relation, user_profile_picture, user_birth_day){

    //console.log(arguments);

    document.getElementById('profile_image_block').style.backgroundImage = `url(${user_profile_picture})`;
    document.getElementById('profile_image_block').style.backgroundPosition = 'middle';
    document.getElementById('profile_image_block').style.backgroundSize = 'contain';
    document.getElementById('profile_image_block').style.backgroundRepeat = 'no-repeat';

    document.getElementById('user-name').innerHTML=`Name : ${user_name}` ;
    document.getElementById('user-lastname').innerHTML= `Last name : ${user_last_name}`;
    document.getElementById('user-birthdate').innerHTML= `Born : ${user_birth_day+'/'+user_birth_month+'/'+user_birth_year}`;
    document.getElementById('user-city').innerHTML= `From : ${user_city}`;
    document.getElementById('about-me').innerHTML= user_about_me;
    //document.getElementById().innerHTML= ;

    document.getElementById("image_profile_info_container").style.display="block";//show details of user

}