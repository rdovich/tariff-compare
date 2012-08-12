var http = require("http");
var express = require ("express");

// Create the express application
var app = express();

// Configure express
app.configure(function(){
	app.use(express.logger());  // Turn on Apache style logging (pass thru from Connect)
	app.use(express.errorHandler());
	app.use(express.static(__dirname + '/static'));
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');  //Set the default view engine.
});

// Uses environmental variables (e.g. "NODE_ENV=development node app.js") passed into the command line 
// to tell express how to handle exceptions.

app.configure('development', function(){
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}));  //Dump exceptions and show the stack in the browser.
});

// Routing
app.get('/', function(req, res){
	//res.send('Hello world!');
	res.render('root');
});


// Call Genability and get the data.

http.get("http://api.genability.com/rest/public/lses?appId=9a43a58bDD&appKey=38e0a19462aabf1e27cafee5368d547c&zipCode=78641", function(res) {
  console.log("Got response: " + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });  
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});

// Listen for requests

app.listen(4000);