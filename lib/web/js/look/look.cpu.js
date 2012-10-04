var Look = (function () {
	var that = this;

	this.Cpu = {};

	this.Cpu.init = function () {
		$('#cpu-grid').kendoGrid({
			columns: [
				{ field: '_label', title: 'Source' },
				{ field: '_date', title: 'Date', width: 100, format: '{0:HH:mm:ss}' }
			],
			pageable: true,
			toolbar: [
				{ name: 'start', template: '<button id="cpu-profile-start" class="k-button">Collect CPU profile</button>' },
				{ name: 'seconds', template: '&nbsp;for&nbsp;&nbsp;<input id="cpu-profile-time" />&nbsp;&nbsp;seconds' }
			],
			dataSource: { data: [], sort: { field: '_date', dir: 'desc' }, pageSize: 20 },
			detailTemplate: kendo.template($('#tree-template').html()),
			detailInit: function (row) {
				row.detailRow.find('.tree').kendoTreeView({
					dataSource: new kendo.data.HierarchicalDataSource({
						data: [
							that.Cpu.createTree(row.data.toJSON().root),
							that.Cpu.createTree(row.data.toJSON().hotSpots)
						]
					})
				});
			}
		});

		$('#cpu-grid #cpu-profile-time').kendoNumericTextBox({ value: 10, min: 5, max: 60, step: 5, format: 'n0' });
		$('#cpu-grid #cpu-profile-start').bind('click', function() {
			that.Cpu.lock();
			var time = parseInt($('#cpu-grid #cpu-profile-time').val(), 10);
			that.Socket.emit('command', { cmd: 'profileCpu', args: time });
			setTimeout(function() { that.Cpu.unlock(); }, time * 1000);
		});
	};

	this.Cpu.createTree = function (root, depth) {
		if (!depth) depth = 0;
		if (depth > 20) return;
		var node = {
			text: root._label.replace(/([^%]*%)\s+-\s+([^\s]*)(\s*)\(([^:]+)(:?)(\d*)\)/, '<strong>$1</strong> - <span class="blue">$2</span>$3(<span class="green">$4</span>$5<span class="red">$6</span>)'),
			encoded: false
		};

		if (root._target && root._target.length) {
			node.items = [];
			root._target.forEach(function (subnode) {
				node.items.push(that.Cpu.createTree(subnode, depth + 1));
			});
		}
		return node;
	};

	this.Cpu.lock = function () {
		$('#cpu-grid #cpu-profile-start')
			.attr('disabled', 'disabled')
			.addClass('k-state-disabled')
			.html('Collecting…');

		$('#cpu-grid #cpu-profile-time')
			.data('kendoNumericTextBox')
			.enable(false);
	};

	this.Cpu.unlock = function () {
		$('#cpu-grid #cpu-profile-start')
			.removeAttr('disabled')
			.removeClass('k-state-disabled')
			.html('Collect CPU profile');

		$('#cpu-grid #cpu-profile-time')
			.data('kendoNumericTextBox')
			.enable(true);
	};

	this.Cpu.getHotPath = function (call) {
		if (!call || !call._target) return [];
		var path = [{ _cpuUsage: call._cpuUsage, _label: call._label }];
		for (var i = 0; i < call._target.length; i++) {
			var targetCall = call._target[i];
			if (targetCall._cpuUsage > call._cpuUsage / 2 && targetCall._cpuUsage >= 1) {
				path = that.Cpu.getHotPath(targetCall).concat(path);
				break;
			}
		}
		return path;
	};

	this.Cpu.getHotSpots = function (snapshot) {
		var hotSpots = [];
		snapshot.root._target.forEach(function (call) {
			var path = that.Cpu.getHotPath(call);
			if (path.length > 0 && path[0]._cpuUsage >= 1) {
				var spot = path.shift();
				spot._target = path;
				hotSpots.push(spot);
			}
		});
		hotSpots = hotSpots.sort(function (call1, call2) {
			return call2._cpuUsage - call1._cpuUsage;
		});
		return hotSpots;
	};

	this.Cpu.addSnapshot = function (snapshot) {
		snapshot.root._label = 'Call tree';
		snapshot.hotSpots = { _label: 'Hot spots', _target: that.Cpu.getHotSpots(snapshot) };
		snapshot._date = new Date(snapshot._ts);
		$('#cpu-grid').data('kendoGrid').dataSource.add(snapshot);
	};

	return this;
}.call(Look || {}));