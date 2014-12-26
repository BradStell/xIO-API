/**
 * Main File
 */
var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

// All of the API end points get assigned their functions (defined in requestHandler.js)
var handle = {}
handle["/GET/stackoverflow/users"] = requestHandlers.stackUser;
handle["/GET/stackoverflow/id"] = requestHandlers.stackId;
handle["/GET/bitbucket/users"] = requestHandlers.bitbucket;
handle["/GET/bitbucket/users/oath"] = requestHandlers.bitbucketOath;
handle["/GET/github/users"] = requestHandlers.githubUser;
handle["/GET/launchpad/users"] = requestHandlers.launchpad;
handle["/GET/sourceforge/users"] = requestHandlers.sourceforge;
handle["/api"] = requestHandlers.apiRef;
handle["/"] = requestHandlers.apiRef;

// Calling the servers start method sending in the router and the object of pathnames
server.start(router.route, handle);