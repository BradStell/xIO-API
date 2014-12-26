/**
 * Routes url code
 */
function route(handle, pathname, query, response) {
	
	console.log("About to route a request for " + pathname);
	
	// If the pathname is one of our specified pathnames (from 'handle') execute its function
	if (typeof handle[pathname] === 'function') {
		handle[pathname](response, query);
	}
	else {
		console.log("\nNo request handler found for " + pathname);
		response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 No results found");
        response.end();
	}
}

exports.route = route;