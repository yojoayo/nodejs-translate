//  OpenShift sample Node application
var express   = require('express');
var fs        = require('fs');
var app       = express();
var eps       = require('ejs');
var cors      = require('cors');
var translate = require('lib/translate');

app.engine('html', require('ejs').renderFile);

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL;
var mongoURLLabel = "";
if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
  var mongoHost = process.env[mongoServiceName + "_SERVICE_HOST"];
  var mongoPort = process.env[mongoServiceName + "_SERVICE_PORT"];
  var mongoUser = process.env.MONGODB_USER
  if (mongoHost && mongoPort && process.env.MONGODB_DATABASE) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD) {
      mongoURL += process.env.MONGODB_USER + ':' + process.env.MONGODB_PASSWORD + '@';
    }
    // Provide UI label that excludes user id and pw

    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + process.env.MONGODB_DATABASE;
    mongoURL += mongoHost + ':' + mongoPort + '/' + process.env.MONGODB_DATABASE;
  }
}

app.use(cors());



app.get('/', function (req, res) {
    res.render('index.html', { pageCountMessage : null});
 });

app.get('/translate/:sl/:tl/:text', function (req, res) {
	var text = req.params.text,
		sl = req.params.sl,
		tl = req.params.tl;
	translate({
		text: text,
		source: sl || 'es',
		target: tl || 'en'
	}, function (translation) {
		res.send({
			"translation": translation
		});
	});
});

app.get('/translate/:text', function (req, res) {
	var text = req.params.text;
	translate({
		text: text,
		source: 'es',
		target: 'en'
	}, function (translation) {
		res.send({
			"translation": translation
		});
	});
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on ' + ip + ':' + port);
