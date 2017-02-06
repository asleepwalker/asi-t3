angular.module('app', ['chart.js'])
	.config(function (ChartJsProvider) {
		ChartJsProvider.setOptions({
			title: {
				text: 'Transactions Graph',
				display: true
			},
			legend: {
				display: true,
			},
			maintainAspectRatio: false,
			scales: {
				xAxes: [{
					gridLines: {
						display: false
					},
					ticks: {
						fontSize: 14
					}
				}],
				yAxes: [{
					ticks: {
						display: false,
						maxTicksLimit: 8
					}
				}]
			},
			chartColors: [{
				backgroundColor: '#E53E2D',
				borderColor: '#B73224',
				borderWidth: 1
			}, {
				backgroundColor: '#84BE46',
				borderColor: '#6A9838',
				borderWidth: 1
			}]
		});
	})
	.service('interactions', function ($http) {
		this.get = function (since, till) {
			var sinceDate = since.format('YYYY-MM-DD');
			var tillDate = till.format('YYYY-MM-DD');

			var parse = this.parse;
			return $http({
				cache: true,
				method: 'GET',
				url: '/api/transactions/' + sinceDate + '/' + tillDate
			}).then(function (response) {
				return parse(response.data, since, till);
			});
		};

		this.parse = function(data, since, till) {
			var dayData = [];
			// Iterate over the requested date range
			for (var day = moment(since); day.diff(till, 'days') <= 0; day.add(1, 'day')) {
				dayData.push({
					label: day.date(),
					transactions: data.filter(function (transaction) {
						return moment(transaction.date).isSame(day, 'day');
					})
				});
			}

			var labels = [];
			var expenses = [];
			var incomes = [];

			dayData.map(function (day) {
				var expense = 0;
				var income = 0;
				day.transactions.forEach(function (transaction) {
					if (transaction.value > 0) {
						income += transaction.value;
					} else {
						expense -= transaction.value;
					}
				});
				labels.push(day.label);
				expenses.push(expense);
				incomes.push(income);
			});

			return {
				labels: labels,
				data: [ expenses, incomes ]
			};
		};
	})
	.controller('graph', function ($scope, interactions) {
		$scope.$watch('range', function (newRange) {
			interactions.get(newRange.since, newRange.till)
				.then(function (stats) {
					$scope.labels = stats.labels;
					$scope.data = stats.data;
				});
		}, true);

		var range = $scope.range = {
			since: moment().startOf('day').subtract(6, 'day'),
			till: moment().startOf('day')
		};

		$scope.prevWeek = function() {
			[range.since, range.till].map(function (date) {
				date.subtract(1, 'week');
			});
		};

		$scope.nextWeek = function() {
			[range.since, range.till].map(function (date) {
				date.add(1, 'week');
			});
		};

		$scope.isCurrentWeek = function() {
			return moment().isSame(range.till, 'week');
		};

		$scope.getDistance = function() {
			if (!$scope.isCurrentWeek()) {
				var distance = moment().diff(range.till, 'weeks');
				return distance + ' ' + (distance > 1 ? 'weeks' : 'week') + ' ago';
			} else {
				return 'This week';
			}
		};

		$scope.getInterval = function() {
			if (range.since.isSame(range.till, 'month')) { // Same month
				return range.since.format('MMM D') + '-' + range.till.format('D, YYYY');
			} else if (range.since.isSame($scope.till, 'year')) { // Different months, same year
				return range.since.format('MMM D') + '-' + range.till.format('MMM D, YYYY');
			} else { // Different years
				return range.since.format('MMM D, YYYY') + '-' + range.till.format('MMM D, YYYY');
			}
		};
	});
