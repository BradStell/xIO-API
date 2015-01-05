/**
 * Server
 */
var http = require("http");
var url = require("url");
var host = process.env.VCAP_APP_HOST || 'localhost';
var port = process.env.VCAP_APP_PORT || 8888;

// Servers start method
function start(route, handle) {
	
	// Create a server and listen on specified port
	// When a 'ping' comes in, execute the anonymous function
	http.createServer(function(request, response) {
			
		// Capture the url
		var pathname = url.parse(request.url).pathname;
		var query = url.parse(request.url).query;
		
		// Get rid of the annoying favicon
		if(pathname != "/favicon.ico") {
			
			console.log("\nRequest for " + pathname + " received.");		
			
			// Send to the router the following information
			route(handle, pathname, query, response);
		}
		
	}).listen(port, host);
	
	console.log("Server Started: Listening on port " + port);
}

exports.start = start;