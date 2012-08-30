var Look = (function () {
	var that = this;
	
	this.Samples = {};
	
	this.Samples.transactions = false;

	this.Samples.init = function () {
		$('#transactions-start-stop').bind('click', function () {
			if (that.Samples.transactions) {
				that.Samples.transactions = false;
				that.Socket.emit('command', { cmd: 'transactions-stop' });
				$('#transactions-start-stop').html('Start monitoring');
			} else {
				that.Samples.transactions = true;
				that.Socket.emit('command', { cmd: 'transactions-start' });
				$('#transactions-start-stop').html('Stop monitoring');
			}
		});
		
		$('#filter-operator').bind('change', function () {
			switch ($(this).val()) {
				case 'match'	: $('#filter-value').attr('placeholder', 'regex'); break;
				case '=='		: $('#filter-value').attr('placeholder', ''); break;
				case '>'		:
				case '<'		: $('#filter-value').attr('placeholder', 'number'); break;
			}		
		});

		$('#filter-apply').bind('click', function () {
			if (!$('#filter-value').val().length) {
				$('#filter-value').addClass('error');
				return;
			}
			$('#filter-value').removeClass('error');
			that.Socket.emit('command', { cmd: 'filter', args: [{ key: $('#filter-key').val(), op: $('#filter-operator').val(), val: $('#filter-value').val() }] });
			$('#filter-apply').html('Reapply');
		});

		$('#filter-reset').bind('click', function () {
			that.Socket.emit('command', { cmd: 'filter' });
			$('#filter-key').val('any field');
			$('#filter-operator').val('matches');
			$('#filter-value').val('');
			$("#filter-apply").html('Apply');
		});

		$('#requests-grid').kendoGrid({
			columns: [
				{ field: '_label', title: 'URL' },
				{ field: '_ms', title: 'Time', width: 100 },
				{ field: '_date', title: 'Date', width: 100, format: '{0:HH:mm:ss}' }
			],
			pageable: true,
			/*toolbar: [
				{ name: 'search', template: '<input class="sample-search" type="text" placeholder="search requests…" />' },
				{ name: 'clear', template: '<button id="requests-grid-clear" style="float: right;" class="k-button">Clear</button>' }
			],*/
			dataSource: { data: [], sort: { field: '_date', dir: 'desc' }, pageSize: 20 },
			detailTemplate: kendo.template($('#tree-template').html()),
			detailInit: function (row) {
				row.detailRow.find('.tree').kendoTreeView({
					dataSource: new kendo.data.HierarchicalDataSource({ data: that.Samples.createTree(row.data.toJSON()) })
				});
			}
		});

		$('#operations-grid').kendoGrid({
			columns: [
				{ field: '_label', title: 'Operation' },
				{ field: '_ms', title: 'Time', width: 100 },
				{ field: '_date', title: 'Date', width: 100, format: '{0:HH:mm:ss}' }
			],
			pageable: true,
			/*toolbar: [
				{ name: 'search', template: '<input class="sample-search" type="text" placeholder="search operations…" />' },
				{ name: 'clear', template: '<button id="operations-grid-clear" style="float: right;" class="k-button">Clear</button>' }
			],*/
			dataSource: { data: [], sort: { field: '_date', dir: 'desc' }, pageSize: 20 },
			detailTemplate: kendo.template($('#tree-template').html()),
			detailInit: function (row) {
				row.detailRow.find('.tree').kendoTreeView({
					dataSource: new kendo.data.HierarchicalDataSource({ data: that.Samples.createTree(row.data.toJSON()) })
				});
			}
		});
	
		$('#errors-grid').kendoGrid({
			columns: [
				{ field: '_label', title: 'URL' },
				{ field: '_ms', title: 'Time', width: 100 },
				{ field: '_date', title: 'Date', width: 100, format: '{0:HH:mm:ss}' }
			],
			pageable: true,
			/*toolbar: [
				{ name: 'search', template: '<input class="sample-search" type="text" placeholder="search errors…" />' },
				{ name: 'clear', template: '<button id="errors-grid-clear" style="float: right;" class="k-button">Clear</button>' }
			],*/
			dataSource: { data: [], sort: { field: '_date', dir: 'desc' }, pageSize: 20 },
			detailTemplate: kendo.template($('#tree-template').html()),
			detailInit: function (row) {
				row.detailRow.find('.tree').kendoTreeView({
					dataSource: new kendo.data.HierarchicalDataSource({ data: that.Samples.createTree(row.data.toJSON()) })
				});
			}
		});

		//$('.sample-search').kendoAutoComplete();
	};

	this.Samples.createTree = function (node) {
		var items = [];
		for (var field in node) {
			if (field.substr(0, 1) === '_') continue;
			if (typeof(node[field]) === 'object') {
				var subitems = that.Samples.createTree(node[field]);
				if (subitems.length) {
					items.push({
						text: '<strong>' + (node[field]._label ? node[field]._label : field)  + '</strong>',
						encoded: false,
						items: subitems
					});
				}
			} else {
				items.push({
					text: '<strong>' + field  + ':</strong> ' + node[field],
					encoded: false
				});
			}
		}
		return items;
	};

	this.Samples.updateFilterKeys = function (keys) {
		var selectedKey = $('#filter-key option:selected').val();
		$('#filter-key option').remove();
		$('#filter-key').append(new Option('any field', '*', false, selectedKey === '*'));
		keys.forEach(function (key) {
			$('#filter-key').append(new Option(key, key, false, selectedKey === key));
		});
	};

	this.Samples.add = function (buffer) {
		if (!buffer || !buffer.length) return;

		buffer.forEach(function (sample) {
			sample._date = new Date(sample._ts);
			if (sample.Error) {
				// errors
				$('#errors-grid').data('kendoGrid').dataSource.add(sample);
			} else if (sample._isMacro) {
				// requests
				$('#requests-grid').data('kendoGrid').dataSource.add(sample);
			} else {
				// operations
				$('#operations-grid').data('kendoGrid').dataSource.add(sample);
			}
		});
	};

	return this;
}.call(Look || {}));