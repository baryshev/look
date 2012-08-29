var connect = require('connect');
var connectRoute = require('connect-route');
var http = require('http');
var app = connect();
var server = http.createServer(app);
var io = require('socket.io').listen(server, { log: false });

var rewrite = function(req, res, next) {
	req.url = '/';
	next();
};

app.use(connectRoute(function(router) {
	router.get('/metrics', rewrite);
	router.get('/transactions', rewrite);
	router.get('/cpu', rewrite);
	router.get('/memory', rewrite);
}));


app.use(connect.static(__dirname + '/web'));

var port = (typeof(process.argv[2]) !== 'undefined' && process.argv[2] !== 'undefined') ? process.argv[2] : 5959;
var host = (typeof(process.argv[3]) !== 'undefined' && process.argv[3] !== 'undefined') ? process.argv[3] : '0.0.0.0';

console.log('Profiler listening on ' + host + ':' + port);

server.listen(port, host);

var receiver = new (require('./receiver'));

receiver.on('request', function (data) {
	process.send(data);
});

io.sockets.on('connection', function (socket) {
	receiver.addSocket(socket);
});

process.on('message', function (data) {
	receiver.send(data);
});