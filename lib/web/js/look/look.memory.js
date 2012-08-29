var Look = (function () {
	var that = this;

	this.Memory = {};

	this.Memory.lock = function () {
		$('#memory-grid #memory-profile-start')
			.attr('disabled', 'desabled')
			.addClass('k-state-disabled')
			.html('Processing…');
	};

	this.Memory.unlock = function () {
		$('#memory-grid #memory-profile-start')
			.removeAttr('disabled')
			.removeClass('k-state-disabled')
			.html('Take Heap Snapshot');
	};

	this.Memory.init = function () {
		$('#memory-grid').kendoGrid({
			sortable: true,
			columns: [
				{ field: '_label', title: 'Source' },
				{ field: '_date', title: 'Date', width: 100, sortable: true, format: '{0:HH:mm:ss}' }
			],
			pageable: true,
			toolbar: [
				{ name: 'start', template: '<button id="memory-profile-start" class="k-button">Take Heap Snapshot</button>' },
			],
			dataSource: { data: [], sort: { field: '_date', dir: 'desc' }, pageSize: 20 },
			detailTemplate: kendo.template($('#tree-template').html()),
			detailInit: function  (row) {
				row.detailRow.find('.tree').kendoTreeView({
					dataSource: new kendo.data.HierarchicalDataSource({ data: that.Memory.createTree(row.data.toJSON().Retainers) })
				});
			}
		});
	
		$('#memory-grid #memory-profile-start').bind('click', function () {
			that.Memory.lock();
			that.Socket.emit('command', { cmd: 'takeHeapSnapshot' });
			setTimeout(function() { that.Memory.unlock(); }, 30000);
		});
	};

	this.Memory.createTree = function (root) {
		var nodes = [];
		root.forEach(function (retainer) {
			var item = {
				text: retainer._label.replace(/([^%]*%)/, '<strong>$1</strong>'),
				encoded: false
			};
			var items = [];
			for (var field in retainer) {
				if (field.substr(0, 1) === '_') continue;
				if (typeof(retainer[field]) === 'object') {
					items.push({
						text: '<strong>' + field  + '</strong>',
						encoded: false,
						items: that.Memory.createTree(retainer[field])
					});
				} else {
					items.push({
						text: '<strong>' + field  + ':</strong> ' + retainer[field],
						encoded: false
					});
				}
			}
			if (items.length) {
				item.items = items;
			}
			nodes.push(item);
		});
		return nodes;
	};

	this.Memory.addSnapshot = function (snapshot) {
		that.Memory.unlock();
		snapshot._date = new Date(snapshot._ts);
		$('#memory-grid').data('kendoGrid').dataSource.add(snapshot);
	};

	return this;
}.call(Look || {}));