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
var utilityList;
var tariffList;
var lseId = '';
var utilityName = '';

// Call Genability and get the data.
  
function getGenabilityUtilities(appId, appKey, zipcode) {

  var parms = {appId: appId, appKey: appKey, zipCode: zipcode};
  var url = "http://api.genability.com/rest/public/lses?" + querystring.stringify(parms);

  return url;
};

function getGenabilityTariffs(appId, appKey, lseId) {

  var parms = {appId: appId, appKey: appKey, lseId: lseId, populateProperties: 'true', customerClasses: 'GENERAL'};
  var url = "http://api.genability.com/rest/public/tariffs?" + querystring.stringify(parms); 
  
  return url;
};

function getGenabilityTariff(appId, appKey, tariffId) {

  var parms = {appId: appId, appKey: appKey};
  var url = "http://api.genability.com/rest/public/tariffs/" + tariffId + "?" + querystring.stringify(parms); 
  console.log(url);
  return url;
};

function getGenabilityData(url) {
  var deferred = Q.defer();
  
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
}

// Uses environmental variables (e.g. "NODE_ENV=development node app.js") passed into the command line 
// to tell express how to handle exceptions.

app.configure('development', function(){
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}));  //Dump exceptions and show the stack in the browser.
});

// Routing (jade)
app.get('/', function(req, res, next){
  res.render('root', {Title: 'Tariff Details', Subtitle: 'Enter your zipcode'});
});

app.post('/display-utilities', function(req, res, next){
  zipcode = req.body.zipcode;
  getGenabilityData(getGenabilityUtilities(appId, appKey, zipcode)).then(function(utilities) {
	utilityList = utilities;
	res.render('utilities', {Title: 'Tariff Details', Subtitle: 'Select your utility', zip: zipcode, utilities: utilities});
  });
});

app.post('/display-tariffs', function(req, res, next){
  console.log(req.body);
  for (i=0; i<utilityList.length; i++) {
    if (utilityList[i].name === req.body.selectedUtil) {
      lseId = utilityList[i].lseId;
    }
  }

  utilityName = req.body.selectedUtil;
      
  getGenabilityData(getGenabilityTariffs(appId, appKey, lseId)).then(function(tariffs) {
	tariffList = tariffs;
	res.render('tariffs', {Title: 'Tariff Details', Subtitle: 'Select your tariff', zip: zipcode, tariffs: tariffs, utilityName: utilityName});
  });
});

app.post('/display-tariff-details', function(req, res, next){
  console.log(req.body);
  console.log(tariffList);
  console.log(tariffList.length);

  for (i=0; i<tariffList.length; i++) {
    if (tariffList[i].tariffName === req.body.selectedTariff) {
      tariffId = tariffList[i].tariffId;
    }
  }
  
  tariffName = req.body.selectedTariff;
  
  getGenabilityData(getGenabilityTariff(appId, appKey, tariffId)).then(function(tariff) {
    console.log(tariff[0]);
    res.render('tariff', {Title: 'Tariff Details', Subtitle: 'Tariff detail for ' + utilityName + ': ' + tariffName, tariff: tariff[0]});
  });
});

// Create the server and listen for requests

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
