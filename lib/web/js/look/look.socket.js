var Look = (function () {
	var that = this;

	this.Socket = {};

	this.Socket.init = function () {
		that.Socket.socket = io.connect(document.location.protocol + '//' + document.location.hostname + ':' + document.location.port);

		that.Socket.socket.on('commands', function (commands) { that.Core.handleCommands(commands); });

		setInterval(function () { that.Socket.emit('command', { cmd: 'resume' }); }, 60000);
	};

	this.Socket.emit = function (command, values) {
		if (that.Socket.socket) {
			that.Socket.socket.emit(command, values);
		}
	};

	return this;
}.call(Look || {}));