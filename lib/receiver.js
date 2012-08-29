var events = require('events');
var util = require('util');

var Receiver = function () {
	events.EventEmitter.call(this);
	this.sockets = {};
	this.data = [];
};

util.inherits(Receiver, events.EventEmitter);

Receiver.prototype.addSocket = function (socket) {
	var that = this;

	this.sockets[socket.id] = socket;

	socket.emit('commands', this.data);

	this.emit('request', { cmd: 'init', args: { socket: socket.id } });

	socket.on('command', function (data) {
		that.emit('request', data);
	});

	socket.on('disconnect', function () {
		socket.removeAllListeners('disconnect');
		socket.removeAllListeners('message');
		delete(that.sockets[socket.id]);
	});
};

Receiver.prototype.send = function (data) {
	if (data.cmd === 'init') {
		this.sockets[data.args.socket].emit('commands', [ data ]);
		return;
	}
	this.data.push(data);
	if (this.data.length > 512) this.data.shift();
	for (var id in this.sockets) {
		this.sockets[id].emit('commands', [ data ]);
	}
};

module.exports = Receiver;