// Module dependencies.

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

// Create the express application
var app = express();

// Configure express
app.configure(function(){
  app.set('port', process.env.PORT || 4000);
  app.set('title', 'Tariff Compare');
  app.set('views', __dirname + '/views');
  //app.set('view engine', 'ejs');  //Set the default view engine.
  app.set('view engine', 'jade');  //Set the default view engine.
  app.use(express.favicon());
  app.use(express.logger('dev'));    // Turn on Apache style logging (pass thru from Connect)
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.errorHandler());
});

// Uses environmental variables (e.g. "NODE_ENV=development node app.js") passed into the command line 
// to tell express how to handle exceptions.

app.configure('development', function(){
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}));  //Dump exceptions and show the stack in the browser.
});

// Routing (ejs)
//app.get('/', routes.index);

// Routing (jade)
app.get('/', function(req, res, next){
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

// Create the server and listen for requests

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});