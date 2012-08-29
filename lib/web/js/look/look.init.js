var Look = (function () {
	var that = this;

	this.Init = {};

	this.Init.init = function (data) {
		if (data.transactions) {
			that.Samples.transactions = true;
			that.Socket.emit('command', { cmd: 'transactions-start' });
			$('#transactions-start-stop').html('Stop monitoring');
		} else {
			that.Samples.transactions = false;
			that.Socket.emit('command', { cmd: 'transactions-stop' });
			$('#transactions-start-stop').html('Start monitoring');
		}
	};

	$(document).ready(function () {
		that.Samples.init();
		that.Metrics.init();
		that.Cpu.init();
		that.Memory.init();
		that.Router.init();
		that.Socket.init();
	});

	return this;
}.call(Look || {}));