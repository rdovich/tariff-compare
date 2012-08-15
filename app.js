// Module dependencies.

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , Q = require('q')
  , querystring = require('querystring')
  , request = require('request');

// Create the express application
var app = express();
var zipcode = '';

// Configure express
app.configure(function(){
  app.set('port', process.env.PORT || 4000);
  app.set('title', 'Tariff Details');
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


var appId = '9a43a58bDD';
var appKey = '38e0a19462aabf1e27cafee5368d547c';
var zipCode = '';


// Call Genability and get the data.
  
function getGenabilityUtilities(appId, appKey, zipcode) {

  var deferred = Q.defer();
  var parms = {appId: appId, appKey: appKey, zipCode: zipcode};
  var url = "http://api.genability.com/rest/public/lses?" + querystring.stringify(parms); 
  
  request ({url: url},
    function (error, resp, respJSON) {
      try {
        var respObj = JSON.parse(respJSON);
      } catch (e) {
        deferred.revoke('server error');
        return;
      }
      
      if (!error && (resp.statusCode == 200)) {
        deferred.resolve(respObj.results);
      } else {
        deferred.reject('error');
      }
  });
  return deferred.promise;
};


function getGenabilityTariffs(appId, appKey, zipcode) {

//rest/public/tariffs?appId=xxx&appKey=yyy&zipCode=94115&populateProperties=true&customerClasses=RESIDENTIAL


  var deferred = Q.defer();
  var parms = {appId: appId, appKey: appKey, zipCode: zipcode, populateProperties: 'true', customerClasses: 'GENERAL'};
  var url = "http://api.genability.com/rest/public/tariffs?" + querystring.stringify(parms);
  console.log("URL: " , url); 
  
  request ({url: url},
    function (error, resp, respJSON) {
      try {
        var respObj = JSON.parse(respJSON);
      } catch (e) {
        deferred.revoke('server error');
        return;
      }
      
      if (!error && (resp.statusCode == 200)) {
        deferred.resolve(respObj.results);
      } else {
        deferred.reject('error');
      }
  });
  return deferred.promise;
};


// Uses environmental variables (e.g. "NODE_ENV=development node app.js") passed into the command line 
// to tell express how to handle exceptions.

app.configure('development', function(){
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}));  //Dump exceptions and show the stack in the browser.
});

// Routing (ejs)
//app.get('/', routes.index);

// Routing (jade)
app.get('/', function(req, res, next){
  res.render('root', {Title: 'Tariff Details'});
});

app.post('/display-utilities', function(req, res, next){
  zipcode = req.body.zipcode;
  getGenabilityUtilities(appId, appKey, zipcode).then(function(utilities) {
	res.render('utilities', {Title: 'Tariff Details',zip: req.body.zipcode, utilities: utilities});
  });
});

app.post('/display-tariffs', function(req, res, next){
  getGenabilityTariffs(appId, appKey, zipcode).then(function(utilities) {
    console.log(req.body);
	res.render('utilities', {Title: 'Tariff Details',zip: req.body.zipcode, utilities: utilities});
  });
});


// Create the server and listen for requests

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
