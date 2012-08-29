var events = require('events');
var util = require('util');

var Agent = function() {
	events.EventEmitter.call(this);
};

util.inherits(Agent, events.EventEmitter);

Agent.prototype.send = function (data) {
	this.emit('request', data);
};

Agent.prototype.request = function (data) {
	switch (data.cmd) {
		case 'transactions-start' :
		case 'transactions-stop' :
			this.emit('command', data);
		default :
			this.emit('message', data);
			break;
	}
};

module.exports = Agent;