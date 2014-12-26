/**
 * Server
 */
var http = require("http");
var url = require("url");

// Servers start method
function start(route, handle) {
	
	// Port to listen on
	var port = 8888;
	
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
		
	}).listen(port);
	
	console.log("Server Started: Listening on port " + port);
}

exports.start = start;