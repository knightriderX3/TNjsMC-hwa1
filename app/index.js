/*
* Hello World API 
* This app has a RESTful JSON API that listens on port 3000 
* When someone posts anything to the route /hello, the app returns a welcome message, in JSON format
*/

// Dependencies

var http = require('http');
var url = require('url');

var StringDecoder = require('string_decoder').StringDecoder;

// Define the handlers
var handlers = {};

// Hello Handler
handlers.hello = function(data, callback){
    // Callback a http status code, and a payload object
    
    callback(200, {'message' : 'Welcome to localhost:3000/hello'}) ;
};

// Not found handler
handlers.notFound = function(data, callback){
    callback(404);
};

// Define a request router
var router = {
    'hello' : handlers.hello
};

// Instantiate the HTTP server
var httpServer = http.createServer(function(req,res){
    
    // Get the URL and parse it
    var parsedUrl = url.parse(req.url,true);

    // Get the path
    var path = parsedUrl.pathname.replace(/^\/+|\/+$/g,'');

    // Get the HTTP method
    var method = req.method.toLowerCase();

    // Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data',function(data){
        buffer += decoder.write(data);
    });

    req.on('end', function(){

        buffer += decoder.end();

        // Choose the handler this request shoud go to
        // If one is not found, use the notFound handler
        var chosenHandler = typeof(router[path]) !== 'undefined' ? router[path] : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
            path,
            method,
            'payload'  : buffer
        };

        // console.log(data.payload);
        
        // Route the request to the handler specified in the router
        chosenHandler(data,function(statusCode, payload){
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == "number" ? statusCode : 200;
            
            // Use the payload called back by the handler, or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // console.log("payload is - ", payload);


            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);

            res.end(payloadString);

            // Log the request path
            console.log('Returning with this response: '+statusCode, payloadString);
            
        }); 

    });

});

// Start the HTTP Server
httpServer.listen(3000,function(){
    console.log("The server is listening on port 3000");
});