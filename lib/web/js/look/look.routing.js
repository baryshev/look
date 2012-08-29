var Look = (function () {
	var that = this;

	this.Router = {};

	this.Router.init = function () {
		Backbone.history.start({ pushState: true, root: '/' });
	};

	this.Router.route = '';

	var	LookRouter = Backbone.Router.extend({
		routes: {
			''				: 'transactionsPage',
			transactions	: 'transactionsPage',
			metrics			: 'metricsPage',
			cpu				: 'cpuPage',
			memory			: 'memoryPage'
		},
		transactionsPage	: function () { that.Router.go('transactions', true) },
		metricsPage			: function () { that.Router.go('metrics', true) },
		cpuPage				: function () { that.Router.go('cpu', true) },
		memoryPage			: function () { that.Router.go('memory', true) }
	});

	this.Router.router = new LookRouter();

	this.Router.go = function (page, notNavigate) {
		if (!notNavigate) { that.Router.router.navigate(page); }
		if (page !== that.Router.route) {
			if (that.Router.route) {
				$('#' + that.Router.route + '-link').removeClass('active');
				$('#' + that.Router.route + '-page').hide();
			}
			$('#' + page + '-link').addClass('active');
			$('#' + page + '-page').show();
			that.Router.route = page;
		}
		if (that.Router.route === 'metrics') {
			that.Metrics.refreshPlots();
		}
		return false;
	};

	return this;
}.call(Look || {}));