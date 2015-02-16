/**
 * Functions to handle different requests from url
 */
var querystring = require("querystring");
var http = require("http");
var zlib = require("zlib");
var request = require('request');
var OAuth = require('oauth-request');
var github = require('octonode');


//==========================/** Not API End Points. These Functions are used internally in API end point functions **///=================================================================

// The enclosed functions are used for Stackoverflow~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// The gzip decompression algorithm and api call
function getGzipped(url, callback) {
    // buffer to store the streamed decompression
    var buffer = [];

    http.get(url, function(resp) {
        // pipe the response into the gunzip to decompress
        var gunzip = zlib.createGunzip();
        resp.pipe(gunzip);

        gunzip.on('data', function(data) {
            // decompression chunk ready, add it to the buffer
            buffer.push(data.toString());

        }).on("end", function() {
            // response and decompression complete, join the buffer and return
            callback(null, buffer.join(""));

        }).on("error", function(e) {
            callback(e);
        });
        }).on('error', function(e) {
            callback(e);
    });
}

// Adds day of the week to the date
function runDateSwitch(weekDay) {
    var day;

    switch (weekDay) {
        case 0: day = "Sun";
            break;
        case 1: day = "Mon";
            break;
        case 2: day = "Tues";
            break;
        case 3: day = "Wed";
            break;
        case 4: day = "Thurs";
            break;
        case 5: day = "Fri";
            break;
        case 6: day = "Sat";
    }
    
    return day;
}

// Adds commas to the thousands place in required numbers
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
//end Stackoverflow internal functions~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~



//==========/** API End Points **///==================================================================================================================================================

// Function to retrieve JSON from stackoverflow via a username
function stackUser(response, query) {
	
	var jdata;
	var jTagData;
	var userTags;
	var sendToWebpage = '';
	var name = querystring.parse(query)["name"];
	
	// In case the user includes the '{' and '}' characters, remove them
	name = name.replace("{", "").replace("}", "");
		
	var urlUser = "http://api.stackexchange.com/2.2/users?order=desc&sort=reputation&inname=" + name + "&site=stackoverflow";
	
	console.log("\nRequest handler 'stackUser' was called.\nQuerying: " + name + "\n");
	
	// Calling the gzip function declared above
	getGzipped(urlUser, function(err, data) {

       jdata = JSON.parse(data);

 
       if (jdata.items.length === 0){
 		   sendToWebpage = "404 No results found.";
 		   console.log("\nNo user matches that name");
 		   
 		   response.writeHead(200, {"Content-Type": "text/plain"});
      	   response.write(sendToWebpage);
      	   response.end();
 	   } 
 	   else {    		   
 	   
    	   // Add source to object
    	   jdata.source = "stackoverflow";	    	   
    	   
    	   // Change times from unix epoch time to human readable time
    	   var myDate = new Date( jdata.items[0].last_modified_date * 1000);
           jdata.items[0].last_modified_date = ((runDateSwitch(myDate.getDay()) + " " + (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear()));
    	   
           myDate = new Date( jdata.items[0].last_access_date * 1000);
           jdata.items[0].last_access_date = ((runDateSwitch(myDate.getDay()) + " " + (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear()));
           
           myDate = new Date( jdata.items[0].creation_date * 1000);
           jdata.items[0].creation_date = ((runDateSwitch(myDate.getDay()) + " " + (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear()));          
                     
           // Add commas to reputation value to make it more human readable
           jdata.items[0].reputation = numberWithCommas(jdata.items[0].reputation); 
                      
           // API for users Tags using user id
           var urlTag = 'http://api.stackexchange.com/2.2/users/' + jdata.items[0].user_id + '/tags?order=desc&sort=popular&site=stackoverflow'; 
           	           
           /** Run another API call using users id to get tags **/
           getGzipped(urlTag, function(errT, dataT) {
        	   
	           	jTagData = JSON.parse(dataT);           	
	           	
	           	for(var i = 0; i < jTagData.items.length; i++) {
	           	        
	           		userTags += jTagData.items[i].name + " ";
	           	}    	 
           	
	            jdata.tags = userTags;	            
	            
	            sendToWebpage = JSON.stringify(jdata, null, 2);
	            
	            response.writeHead(200, {"Content-Type": "text/plain"});
	        	response.write(sendToWebpage);
	        	response.end();
           });            
 	   }
	});
}

//Function to retrieve JSON from stackoverflow via an ID
function stackId(response, query) {
	
	var jdata;
	var jTagData;
	var userTags;
	var sendToWebpage = '';
	var userId = querystring.parse(query)["id"];
	
	// In case the user includes the '{' and '}' characters, remove them
	userId = userId.replace("{", "").replace("}", "");
	
	var urlId = "http://api.stackexchange.com/2.2/users/" + userId + "?order=desc&sort=reputation&site=stackoverflow";
	
	console.log("\nRequest handler 'stackId' was called.\n\nQuerying: " + userId + "\n");
	
	getGzipped(urlId, function(err, data) {    	   
    	
 	   jdata = JSON.parse(data);  	   
 	   
 	   if (jdata.items.length === 0){
 		   sendToWebpage = "404 No results found.";
 		   console.log("\nNo user matches that name");
 		   
 		   response.writeHead(200, {"Content-Type": "text/plain"});
      	   response.write(sendToWebpage);
      	   response.end();
 	   } 
 	   else {    		   
 	   
    	   // Add source to object
    	   jdata.source = "stackoverflow";	    	   
    	   
    	   // Change times from unix epoch time to human readable time
    	   var myDate = new Date( jdata.items[0].last_modified_date * 1000);
           jdata.items[0].last_modified_date = ((runDateSwitch(myDate.getDay()) + " " + (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear()));
    	   
           myDate = new Date( jdata.items[0].last_access_date * 1000);
           jdata.items[0].last_access_date = ((runDateSwitch(myDate.getDay()) + " " + (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear()));
           
           myDate = new Date( jdata.items[0].creation_date * 1000);
           jdata.items[0].creation_date = ((runDateSwitch(myDate.getDay()) + " " + (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear()));          
                     
           // Add commas to reputation value to make it more human readable
           jdata.items[0].reputation = numberWithCommas(jdata.items[0].reputation); 
                      
           // API for users Tags using user id
           var urlTag = 'http://api.stackexchange.com/2.2/users/' + jdata.items[0].user_id + '/tags?order=desc&sort=popular&site=stackoverflow'; 
           	           
           /** Run another API call using users id to get tags **/
           getGzipped(urlTag, function(errT, dataT) {
        	   
	           	jTagData = JSON.parse(dataT);           	
	           	
	           	for(var i = 0; i < jTagData.items.length; i++) {
	           	        
	           		userTags += jTagData.items[i].name + " ";
	           	}    	 
           	
	            jdata.tags = userTags;    
	            
	            sendToWebpage = JSON.stringify(jdata, null, 2);
	            
                response.writeHead(200, {"Content-Type": "text/plain"});
                response.write(sendToWebpage);
                response.end();
           });
       }
    });
}

// Function to retrieve JSON from bitbucket via a username and no Oauth
function bitbucket(response, query) {
	
	var name = querystring.parse(query)["name"];
	
	// In case the user includes the '{' and '}' characters, remove them
	name = name.replace("{", "").replace("}", "");
	
	var url = 'https://bitbucket.org/api/1.0/users/' + name;	
	var sendToWebpage = '';
	
	console.log("\nRequest handler 'bitbucket' was called.\nQuerying: " + name + "\n");
	
	request(url, function (error, res, body) {
		if (!error && res.statusCode === 200) {			    
		    
		    // Transforming the json string sent back from the api call into a true JSON object
		    var jbody = JSON.parse(body);
		    
		    // Adding three fields to the returned JSON object for my own purposes
		    jbody.numRepos = jbody.repositories.length;
		    jbody.usingOauth = "No";
		    jbody.source = 'bitbucket';

		    sendToWebpage = JSON.stringify(jbody, null, 2);

            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write(sendToWebpage);
            response.end();
		}
		
		// If the user does not exist on BitBucket display this message
		else {
          console.log("User does not exist.");
		
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write("404 User not found");
          response.end();
		}
	});
}

// Function to retrieve a JSON from bitbucket via Oauth
function bitbucketOath(response, query) {
	
    var name = querystring.parse(query)["name"];
    var publicKey = querystring.parse(query)["public"];
    var secretKey = querystring.parse(query)["secret"];
    
    // In case the user includes the '{' and '}' characters, remove them
    name = name.replace("{", "").replace("}", "");
    publicKey = publicKey.replace("{", "").replace("}", "");
    secretKey = secretKey.replace("{", "").replace("}", "");
    
    console.log("\nRequest handler 'bitbucketOath' was called.\nQuerying: " + name + " " + publicKey + " " + secretKey + "\n");
    
    // Users' two keys
    var bit = OAuth({
        consumer: {
            public: publicKey,
            secret: secretKey
        }
    });
    
    // If Tokens are required~~~~~~~~~~~~~~~~~~~~~~~~~~~
    /*
    bit.setToken({
        public: 'S7WnWhrAxreD8K766s',
        secret: 'kz6GNh9GgbyTtu3wZHBPBTGbBEjPHZGg'
    });
    *///~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    // Api call to retrieve users information from BitBucket, returned in JSON form
    bit.get({
        url: 'https://bitbucket.org/api/1.0/users/' + name,
        qs: {
            count: 5
        },
        json: true
    }, function(err, res, body) {
    	
    	if (!err && res.statusCode === 200) {
	    	// Adding three fields to the returned JSON object for my own purposes
	    	body.numRepos = body.repositories.length;
	    	body.usingOauth = 'Yes';
	    	body.source = 'bitbucket';	        
	        
	    	var stringBody = JSON.stringify(body, null, 2);
	    	
	    	response.writeHead(200, {"Content-Type": "text/plain"});
	        response.write(stringBody);
	        response.end();
    	}
    	else	    		
    		console.log("User does not exist.");
    	    response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not found");
            response.end();
    });    
}

// Retrieves a JSON from Github via a username
function githubUser(response, query) {
	
	var client = github.client();
	var name = querystring.parse(query)["name"];
	
	// In case the user includes the '{' and '}' characters, remove them
	name = name.replace("{", "").replace("}", "");
	
	var url = "/users/" + name;
	
	console.log("\nRequest handler 'githubUser' was called.\nQuerying: " + name + "\n");
	
	client.get(url, {}, function (err, status, jsonbody, headers) {
		if (err) {
			response.writeHead(404, {"Content-Type": "text/plain"});
	        response.write("404 Results not found");
	        response.end(); 
        }
	    console.log('error = ' + err + ' status = ' + status + ' headers = ' + headers);        
        jsonbody.source = 'github';
        
        var body = JSON.stringify(jsonbody, null, 2);
        
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write(body);
        response.end();
    });
}

// Function to retrieve a JSON from Launchpad via a username
function launchpad(response, query) {	 
    
    var name = querystring.parse(query)["name"];
    
    // In case the user includes the '{' and '}' characters, remove them
    name = name.replace("{", "").replace("}", "");
    
    var url = 'https://api.launchpad.net/1.0/~' + name;
    
    console.log("\nRequest handler 'launchpad' was called.\nQuerying: " + name + "\n");
    
    // The request method that will make the http call to the bitbucket api for accessing a username
    request(url, function (error, res, body) {
		if (!error && res.statusCode === 200) {			    
		    
		    // Transforming the json string sent back from the api call into a true JSON object
		    var jbody = JSON.parse(body);		    
		    
		    // Adding three fields to the returned JSON object for my own purposes
		    jbody.usingOauth = "No";
		    jbody.source = 'launchpad';
		    
		    var sbody = JSON.stringify(jbody, null, 2);
		    
		    response.writeHead(200, {"Content-Type": "text/plain"});
		    response.write(sbody);
		    response.end();
		}
		
		// If the user does not exist on BitBucket display this message
		else
		  console.log("User does not exist.");
		  response.writeHead(404, {"Content-Type": "text/plain"});
	      response.write("404 Not found.");
	      response.end();
	})
}

// Function to retrieve a JSON from Sourceforge 
function sourceforge(response, query) {
	    
    var name = querystring.parse(query)["name"];
    
    // In case the user includes the '{' and '}' characters, remove them
    name = name.replace("{", "").replace("}", "");
    
    var url = 'http://www.sourceforge.net/rest/u/' + name;
    
    console.log("\nRequest handler 'sourceforge' was called.\nQuerying: " + name + "\n");
    
    // API REST http call to the sourceforge username endpoint
    request(url, function (error, res, body) {
    	if (!error && res.statusCode == 200) {    		
    	    
    		// The object returned from api endpoint is a string of a JSON object, turn it into a JSON object
    		var jbody = JSON.parse(body);
    		
    		jbody.source = "sourceforge";
    		
    		var sbody = JSON.stringify(jbody, null, 2);
    		
    		response.writeHead(200, {"Content-Type": "text/plain"});
    	    response.write(sbody);
    	    response.end();		
    	}
    	else
    		console.log("User does not exist.");
    	    response.writeHead(404, {"Content-Type": "text/plain"});
	        response.write("404 Not found.");
	        response.end();
    })
}

//Function to show API endpoints 
function apiRef(response, query) {
	
	var body = "<!DOCTYPE html>" + 
		"<html>" +
		"<head><title>API Reference Material</title>" +
		"<style>" +
		"{background-color:lightgrey}" +
		"table {width:90%}" +
		"p {width:90%;font-family:courier new}" +
		"table, th, td {border:1px solid black;border-collapse:collapse;}" +
		"td {padding:15px;text-align:left;width:33.33%}" +
		"th {padding:20px;text-align:center;width:33.33%}" +
		"table#t1 tr:nth-child(even) {background-color:#eee;}" +
		"table#t1 tr:nth-child(odd) {background-color:#fff;}" +
		"table#t1 th {background-color:gray;color:white;font-size:120%}" +
		"</style>" +
		"</head>" +
		"<body>" +
		"<h1>API Reference Material</h1>" +
		"<h3>Instructions</h3>" +
		"<p>Each of the following endpoints should be appended onto the end of the programs url.  The program url is the following:" +
		" 'xioapi.mybluemix.net'.  For example - to search for a user with the username 'commonsware' in stackoverflow, type the following" +
		" url into your web browsers url search bar: " +
		" 'xioapi.mybluemix.net/GET/stackoverflow/users?name=commonsware' (without the quotes).</p>" +
		"<table id='t1'>" +
		" <tr>" +
		"  <th>API Endpoints</th>" +
		"  <th>Information</th>" +
		"  <th>Description</th>" +
		" </tr>" +
		" <tr>" +
		"  <td>/GET/stackoverflow/users?name={name}</td>" +
		"  <td>Replace '{name}' with the name of the person you wish to look up." +
		"  <td>This endpoint will retrieve a JSON object from Stackoverflow based on a users account information." +
		"  The object will be in String form, so you will need to handle the data format on your end.  <bold>Important:</bold>" +
		"  An ambiguous name, such as 'brad', will return back EVERY username with the word 'brad' in it.  If a username is ambiguous," +
		" please search by ID instead.</td>" +		
		" </tr>" +
		" <tr>" +
		"  <td>/GET/stackoverflow/id?id={idNumber}</td>" +
		"  <td>Replace '{idNumber}' with the id of the person you wish to look up</td>" +
		"  <td>This endpoint will retrieve a JSON object from Stackoverflow based on a users account information." +
		"  The object will be in String form, so you will need to handle the data format on your end.</td>" +
		" </tr>" +
		" <tr>" +
		"  <td>/GET/bitbucket/users?name={name}</td>" +
		"  <td>Replace '{name}' with the name of the person you wish to look up</td>" +
		"  <td>This endpoint will retrieve a JSON object from Bitbucket based on a users public account information." +
		"  The object will be in String form, so you will need to handle the data format on your end.</td>" +
		" </tr>" +
		" <tr>" +
		"  <td>/GET/bitbucket/users/oath?name={name}&public={public key}&secret={secret key}</td>" +
		"  <td>Replace '{name}' with the name of the person you wish to look up</td>" +
		"  <td>This endpoint will retrieve a JSON object from Bitbucket based on a users private and public account information." +
		"  The object will be in String form, so you will need to handle the data format on your end.</td>" +
		" </tr>" +
		" <tr>" +
		"  <td>/GET/github/users?name={name}</td>" +
		"  <td>Replace '{name}' with the name of the person you wish to look up</td>" +
		"  <td>This endpoint will retrieve a JSON object from Github based on a users private account information." +
		"  The object will be in String form, so you will need to handle the data format on your end.</td>" +
		" </tr>" +
		" <tr>" +
		"  <td>/GET/launchpad/users?name={name}</td>" +
		"  <td>Replace '{name}' with the name of the person you wish to look up</td>" +
		"  <td>This endpoint will retrieve a JSON object from Launchpad based on a users public account information." +
		"  The object will be in String form, so you will need to handle the data format on your end.</td>" +
		" </tr>" +
		" <tr>" +
		"  <td>/GET/sourceforge/users?name={name}</td>" +
		"  <td>Replace '{name}' with the name of the person you wish to look up</td>" +
		"  <td>This endpoint will retrieve a JSON object from Sourceforge based on a users public account information." +
		"  The object will be in String form, so you will need to handle the data format on your end.</td>" +
		" </tr>" +
		"</table>" +
		"</body>" +
		"</html>";
	
	response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
	
}

exports.stackUser = stackUser;
exports.stackId = stackId;
exports.bitbucket = bitbucket;
exports.bitbucketOath = bitbucketOath;
exports.githubUser = githubUser;
exports.launchpad = launchpad;
exports.sourceforge = sourceforge;
exports.apiRef = apiRef;