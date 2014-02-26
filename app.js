var express = require('express'),
	fs = require('fs'),
	http = require('http'),
	path = require('path'),
	server, io,
	app = express(),
	SocketManager = require('./socket.js'),
	controller = require('./controller.js');

SocketManager = new SocketManager();


app.configure(function() {
	app.set('port', 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.session({ secret: 'keyboard cat' }));
	app.use(express.static(path.join(__dirname, 'app')));
});

app.configure('developement', function() {
	app.user(express.errorHandler());
});

// app.get('/state/:index', function(req, res) {
// 	var json = 
// })

app.get('/', function(req, res) {
	res.redirect('/index.html');
});

server = http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port' + app.get('port'));
});

io = require('socket.io').listen(server, {log: false});

SocketManager.addController(controller);

io.sockets.on('connection', SocketManager.onConnect);
