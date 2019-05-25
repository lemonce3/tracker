const utils = require('./utils');

exports.window = {
	create() {

	},
	destroy() {

	}
};

exports.action = {
	send(type, data) {
		request('/action', {
			method: 'post',
			async: false });

		return {
			type, data
		};
	}
};

function request(url, options = {}) {
	const { method = 'get', data = null, async = true } = options;
	const xhr = new utils.XMLHttpRequest();

	xhr.open(method, url);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.setRequestHeader('X-Tracker-Forward', 'yes');

	return async ? new utils.Promise((resolve, reject) => {
		request.onreadystatechange = function () {
			if (request.readyState !== 4) {
				return;
			}

			if (request.status === 200) {
				resolve(request.responseText);
			} else {
				reject(request.status);
			}
		};

		request.onerror = function (error) {
			reject(error);
		};

		request.send(data);
	}) : (function () {
		xhr.send(data);

		return xhr.response;
	}());
};