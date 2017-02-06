const moment = require('moment');

let cache = new Map();
module.exports = function generator(params) {
	const requestKey = JSON.stringify(params);
	if (cache.has(requestKey)) {
		return cache.get(requestKey);
	}

	const since = moment(params.since);
	const till = moment(params.till);

	if (!since.isValid() || !till.isValid()) {
		return {"error": "Invalid date"};
	}

	let transactions = [];

	// Iterate over the requested date range
	for (let day = moment(since); day.diff(till, 'days') <= 0; day.add(1, 'day')) {
		day.set('hour', Math.round(Math.random() * 23)); // More realistic?
		transactions.push({ // Income
			date: day.format('YYYY-MM-DD[T]HH:mm:ss'),
			value: Math.round(Math.random() * 1500)
		});
		transactions.push({ // Expense
			date: day.format('YYYY-MM-DD[T]HH:mm:ss'),
			value: -Math.round(Math.random() * 1000) // Trying to earn more than spend :D
		});
	}

	cache.set(requestKey, transactions);

	return transactions;
};
