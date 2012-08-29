var Look = (function () {
	var that = this;

	this.Core = {};

	this.Core.loadedData = {};

	this.Core.handleCommands = function (commands) {
		var	data = [];

		commands.forEach(function (command) {
			switch (command.cmd) {
				case 'init' :
					that.Init.init(command.args);
					break;
				case 'updateFilterKeys' :
					that.Samples.updateFilterKeys(command.args);
					break;
				case 'updateData' :
					switch (command.args._ns) {
						case 'cpu-profiles' : that.Cpu.addSnapshot(command.args); break;
						case 'heap-snapshots' : that.Memory.addSnapshot(command.args); break;
						default: data.push(command.args); break;
					}
					break;
			}
		});
		that.Core.updateData(data);
	};

	this.Core.updateData = function (data) {
		if (!data || !data.length) return;
		var buffer = { metrics: [], samples: [] };

		data.forEach(function (record) {
			if (record._id) {
				if (!!that.Core.loadedData[record._id]) return;
				that.Core.loadedData[record._id] = true;
			}

			switch (record._ns) {
				case 'info' : break;
				case 'metrics' : buffer.metrics.push(record); break;
				case 'samples' : buffer.samples.push(record); break;
			}
		});

		that.Samples.add(buffer.samples);
		that.Metrics.add(buffer.metrics);
	};

	return this;
}.call(Look || {}));