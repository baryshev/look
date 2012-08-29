var Look = (function () {
	var that = this;
	
	this.Metrics = {};

	this.Metrics.data = {};

	this.Metrics.plots = {};

	this.Metrics.sectionOrder = {
		'process'	: 1,
		'os'		: 2
	};

	this.Metrics.init = function () {
		
	};

	this.Metrics.add = function (buffer) {
		if (!buffer || !buffer.length) return;

		var update = {};

		buffer.forEach(function (metric) {
			if (metric.op === 'hist') { return; }

			var
				label = metric.scope + ' - ' + metric.name,
				sourceTabId = 'tab-metrics-source-' + metric.source.replace(/\[|\]/g, ''),
				scopeSectionId = 'section-metrics-' + metric.source.replace(/\[|\]/g, '') + '-' + metric.scope.replace(/ /g, '-'),
				plotId = 'plot-metrics-' + metric.source.replace(/\[|\]/g, '') + '-' + metric.scope.replace(/ /g, '-') + '-' + metric.name.replace(/ /g, '-');

			if (!that.Metrics.data[metric.source]) {
				that.Metrics.data[metric.source] = {};

				var sourceTab = $('<li><a href="#' + sourceTabId  + '" data-toggle="tab" onclick="Look.Metrics.refreshPlots();">' + metric.source.replace(/\[/, ' [') + '</a></li>');
				var sourceTabContent = $('<div class="tab-pane" id="' + sourceTabId + '"></div>');
				if (!$('#source-tabs .nav li').length) {
					sourceTab.addClass('active');
					sourceTabContent.addClass('active');
				}
				$('#source-tabs .nav').append(sourceTab);
				$('#source-tabs .tab-content').append(sourceTabContent);
			}

			if (!that.Metrics.data[metric.source][metric.scope]) {
				that.Metrics.data[metric.source][metric.scope] = {};

				var scope = $('<section id="' + scopeSectionId  + '"><div class="page-header"><h2>' + metric.scope + '</h2></div><div class="row"></div></section>');
				$('#' + sourceTabId).append(scope);
				
				$('#' + sourceTabId + ' section').sortElements(function (element1, element2) {
					var
						name1 = $(element1).find('h2').html().toLowerCase(),
						name2 = $(element2).find('h2').html().toLowerCase();
					
					name1 = that.Metrics.sectionOrder[name1] || name1;
					name2 = that.Metrics.sectionOrder[name2] || name2;

					return name1 > name2 ? 1 : -1;
				});
			}

			if (!that.Metrics.data[metric.source][metric.scope][metric.name]) {
				$('#' + scopeSectionId + ' .row').append('<div class="span6"><h4>' + metric.name  + '</h4><div class="plot" id="' + plotId + '" style="width: 100%; height: 200px;"></div></div>');

				$('#' + scopeSectionId + ' .row > div').sortElements(function (element1, element2) {
					var
						name1 = $(element1).find('h4').html().toLowerCase(),
						name2 = $(element2).find('h4').html().toLowerCase();

					return name1 > name2 ? 1 : -1;
				});

				that.Metrics.data[metric.source][metric.scope][metric.name] = { label: label, scope: metric.scope, name: metric.name, series: [], plot: $('#' + plotId) };
			}

			that.Metrics.data[metric.source][metric.scope][metric.name].series.push(metric);
			update[metric.source + ':' + label] = [metric.source, metric.scope, metric.name];
		});

		for (var key in update) {
			that.Metrics.createPlot.apply(null, update[key]);
		}
	};

	this.Metrics.refreshPlots = function () {
		setTimeout(function() {
			for (var source in that.Metrics.data) {
				for (var scope in that.Metrics.data[source]) {
					for (var name in that.Metrics.data[source][scope]) {
						that.Metrics.createPlot(source, scope, name);
					}
				}
			}
		}, 10);
	};

	this.Metrics.createPlot = function (source, scope, name) {
		var date = new Date();
		var offset = date.getTimezoneOffset() * 60 * 1000;
		if (!that.Metrics.data[source][scope][name].plot.is(':visible')) return;
		var metricData = that.Metrics.data[source][scope][name].series;
		metricData = metricData.sort(function (record1, record2) {
			return record1._ts - record2._ts;
		});
		metricData = metricData.slice(-30);
		var data = [];
		metricData.forEach(function (record) {
			data.push([Math.round(record._ts) - offset, record.value]);
		});
		for (var i = data.length; i < 30; i++) {
			data.push([data[i - 1][0] - 60000, null]);
		}

		$.plot(that.Metrics.data[source][scope][name].plot, [{ data: data, label: that.Metrics.data[source][scope][name].series[0].unit }], {
			series: {
				lines: { show: true, fill: true },
				points: { show: true },
				shadowSize: 0
			},
			legend: { show: true, position: 'nw' },
			xaxis: { mode: 'time' },
			yaxis: { min: 0 }
		});
	};

	return this;
}.call(Look || {}));