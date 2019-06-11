const utils = require('./utils');

exports.sendAction = function sendAction(type, data) {
	request('/api/action', {
		method: 'post',
		async: false,
		data: JSON.stringify({ type, data })
	});
};

exports.sendSnapshot = function sendSnapshot(snapshotData) {
	request('/api/snapshot', {
		method: 'post',
		async: false,
		data: JSON.stringify(snapshotData)
	});
};

function request(url, options = {}) {
	const { method = 'get', data = undefined, async = true } = options;
	const xhr = new utils.XMLHttpRequest();

	xhr.open(method, url);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.setRequestHeader('X-Tracker-Forward', 'yes');

	return async ? new utils.Promise((resolve, reject) => {
		xhr.onreadystatechange = function () {
			if (xhr.readyState !== 4) {
				return;
			}

			if (xhr.status === 200) {
				resolve(xhr.responseText);
			} else {
				reject(xhr.status);
			}
		};

		xhr.onerror = function (error) {
			reject(error);
		};

		xhr.send(data);
	}) : (function () {
		xhr.send(data);

		return xhr.response;
	}());
}