var express_module = require('express');
var app = express_module(); //express app/aspress as a function

var fs = require('fs'); //system file read
var fileUpload = require('express-fileupload');//to allow express multipart/form-data handling

var PouchDB = require('pouchdb');//pouch db, module
require('dotenv').config();//dot env module



var server_listen_port = 3000;//port express server is running on


//__________________________________ routes _____________________________

//++++++++++ enable files upload ++++++++++
app.use(fileUpload());

//++++++++++ static elements ++++++++++
app.use(express_module.static('public'));



// +++++++++ HOME ++++++++
app.get('/', function(req, res){

    res.sendFile(__dirname + "/views/index.html");
    //res.jsonp('hello there');


});

//home user profile data
app.get('/home_profile_data', function(req, res){


    var pouch_db = new PouchDB(process.env.couch_database);//connects to couchdb remotely

    //get all user profile on db
    pouch_db.allDocs({include_docs: true, attachments: true}).then(function(result){

        if(result.rows == ''){//if no users on db
            //show first user form
            return res.json('show_profile_add_form');
        }
       

        var profiles_data = [];//save sorted profile data temporarly

        result.rows.forEach(data=>{

            profiles_data.push({
                    user_name : data.doc.name,
                    user_last_name : data.doc.lastname,
                   // identity_number : req.body.identity_number,
                    user_country : data.doc.country,
                    user_city : data.doc.city,
                    user_about_me : data.doc.aboutme,
                    user_join_month : data.doc.join_month,
                    user_join_year : data.doc.join_year,
                    user_join_day : data.doc.join_day,
                    user_birth_day : data.doc.birth_day,
                    user_birth_month : data.doc.birth_month, 
                    user_birth_year : data.doc.birth_year,
                    user_contact_number : data.doc.contact_number,
                    user_home_address : data.doc.home_address ,
                    user_direct_relation : data.doc.direct_relation,/*[{father : id},{ mother : id}] */
                    user_profile_picture : data.doc.profile_picture,

            })


        })
        //console.log(result);

        res.json(profiles_data);

    }).catch(function(error){
            //console.log('alldocs DB error',error);

            //if error, database is empty
            //create database
        if(error.reason == 'Database does not exist.'){

            var pouch_db = new PouchDB(process.env.couch_database);//connects to couchdb 

            //initialize db/ to complete creation process
            pouch_db.info().then(function(results){

                //db created
                //console.log(results);

                //show first user form
                res.json('show_profile_add_form');


            }).catch(function(error){

                //console.log('db create error',error);
                res.json('error getting users profile data');

            });

        }
        else{
             res.json('error getting users profile data');
        }

    })

   
});

// +++++++++ image upload ++++++++

//save uploadded image
app.post('/upload', function(req, res) {//accept post/upload request
		
    var date = new Date();			
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();
        
    var upload_date_time = hour+'-'+minutes+'-'+seconds+(hour>12?daytime='PM':daytime='AM')+', '+day+'-'+month+'-'+ year + ' '; //add date to file name
    

    //ceck if form details are filled
    if(req.body.name == false || req.body.lastname == false || req.body.identity_number == false || req.body.country == false || req.body.city == false || req.body.aboutme == false ){
        //return res.send('operation terminated, form data missing');
        return res.redirect('/?upload=file_upload_data_missing');
    }


  //+++++++++++++++++++++++++++ upload file +++++++++++++++++++++++++++
  try {
    if(!req.files) {
        //res.send('Error uploading file. No file selected.');
        res.redirect('/?upload=file_upload_data_missing');
    } 
    else {
        //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
        let uploaded_image = req.files.filetoupload;
        //console.log(req.body);
        
        //Use the mv() method to place the file in upload directory (i.e. "uploads")
        uploaded_image.mv('./public/images/upload/profile_image/' + uploaded_image.name);

        //rename uploaded file, make unique
        fs.rename('./public/images/upload/profile_image/' + uploaded_image.name, './public/images/upload/profile_image/' + upload_date_time + uploaded_image.name, function(err){
            if(err){


                //res.send('Error uploading file, please retry.');
                return res.redirect('/?upload=file_upload_error');

            }
            

            // add form data to db
            var pouch_db = new PouchDB(process.env.couch_database);//connects to couchdb remotely

            // pouch_db.info().then(function(info){
            //     console.log(info);
            // // }).catch(function (error){
            //     console.log('error',error);
            // });


            //check if profile with id exists first

            pouch_db.get(req.body.identity_number).then(function (doc){

                //if exists
                //console.log(doc);

                //send error profile exists
                return res.redirect('/?upload=file_upload_profile_exists');

            }).catch(function (error){

                //not exists
                //console.log('error',error);
               
                pouch_db.put({
                    '_id' : req.body.identity_number,
                    name : req.body.name,
                    lastname : req.body.lastname,
                    identity_number : req.body.identity_number,
                    country : req.body.country,
                    city : req.body.city,
                    aboutme : req.body.aboutme,
                    join_month : month,
                    join_year : year,
                    join_day : day,
                    birth_day : req.body.birthday,
                    birth_month : req.body.birthmonth, 
                    birth_year : req.body.birthyear,
                    contact_number : req.body.contactnumber,
                    home_address : req.body.homeaddress,
                    profile_picture : 'images/upload/profile_image/' + upload_date_time.replace(/ /g,'%20') + uploaded_image.name.replace(/ /g,'%20'),
                    direct_relation : [{}],/*[{father : id},{ mother : id}] */

                }).then(function(result){

                    //console.log(result);
                    
                    //save to db success
                    //send response
                    //res.send('File is uploaded');
                    return res.redirect('/?upload=file_upload_success');

                }).catch(function(error){
                   // console.log('error',error);

                    //save profile to db error
                    return res.redirect('/?upload=file_upload_error');
                });
                    

            });      
 
            
        })


    }
} 
catch (err) {
    res.status(500).send(err);
}
   





});


// show upload form
app.get('/upload', function(req, res) {//accepts get/reply to request

            //write upload form, + directory contents
         //   res.writeHead(200, {'Content-Type': 'text/html'});
            res.send(`
                
                <form id='profile_form' action="upload" method="post" enctype="multipart/form-data" style='margin:10vh auto auto 15vw;min-width:200px;width: 70vw;min-height: 400px; height: auto;' class='form-control'>
                    <br/>
                    <p style='width:100%;height:auto'> 
                        <span style='width:auto;display:inline-block'>Upload ID type image</span>
                        <span style='width:20px;height:30px;display:inline-block;float:right;text-align:center;margin:0.5vw' class='w3-button w3-circle w3-red' onclick = 'show_hide("profile_form_container"), ((current_url_query.length > 1)?window.open(http_https + current_domain, "_self"):"")' >
                            
                        </span>
                    </p>
                    <input type="file" name="filetoupload" class='form-control' id='form_filetoupload' ><br>
                    <input type="text" name="name" class='form-control' placeholder="Name" id='form_name'><br>
                    <input type="text" name="lastname" class='form-control' placeholder="Last Name" id='form_lastname'><br>

                    <input type="text" name="birthday" class='form-control' placeholder="Day of birth" id='form_birthday'><br>
                    <input type="text" name="birthmonth" class='form-control' placeholder="Month of birth" id='form_birthmonth'><br>
                    <input type="text" name="birthyear" class='form-control' placeholder="Year of birth" id='form_birthyear'><br>
                    <input type="text" name="contactnumber" class='form-control' placeholder="Contact number" id='form_contactnumber'><br>
                 
                    <input type="number" name="identity_number" class='form-control' placeholder="ID Number" id='form_identity_number'><br>
                    <input type="text" name="country" class='form-control' placeholder="Country" id='form_country'><br>
                    <input type="text" name="city" class='form-control' placeholder="City" id='form_city'><br>
                    <input type="text" name="homeaddress" class='form-control' placeholder="Home address" id='form_homeaddress'><br>

                    <textarea name="aboutme" onclick='this.innerHTML=""' class='w3-block form-control' style='min-height:10vh;margin: auto auto 20px auto' id='form_aboutme'>About me</textarea>
                    
                    <input type="submit" class='btn btn-primary w3-block' onclick='account_form_validation()'>
                </form>
                <script>

                function account_form_validation(){ //form validation 

                    //form field validation 
                    var  form_filetoupload = document.getElementById('form_filetoupload').value.length == 0;
                    var  form_name = document.getElementById('form_name').value.length == 0;
                    var  form_lastname = document.getElementById('form_lastname').value.length == 0;
                    var  form_identity_number = document.getElementById('form_identity_number').value.length == 0;
                    var  form_country = document.getElementById('form_country').value.length == 0;
                    var  form_city = document.getElementById('form_city').value.length == 0;
                    var  form_aboutme = document.getElementById('form_aboutme').value == 'About me';
                     
                    // console.log('form_filetoupload',form_filetoupload )
                    // console.log('form_name',form_name)
                    // console.log('form_lastname',form_lastname)
                    // console.log('form_identity_number',form_identity_number)
                    // console.log('form_country', form_country )
                    // console.log('form_city',form_city)
                    // console.log('form_aboutme',form_aboutme)
                    // alert()
                
                    if(form_filetoupload|| form_name || form_lastname || form_identity_number ||  form_country || form_city || form_aboutme ){
                        return alert('Please fill in all the details');
                    }
                     
                    // TODO do something here to show user that form is being submitted
                    
                
                
                }



                </script>
                                     
            `);
        
            res.end();

})











































//__________________________________ routes end _________________________

app.listen(server_listen_port, function(){
    console.log('------------------------------------------');
    console.log('express server running on 127.0.0.1:'+server_listen_port);
    console.log('------------------------------------------');
})
