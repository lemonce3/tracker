const Promise = window.Promise || require('promise-polyfill/lib');

function http(method = 'get', url = '/', { data = null, async = true, type } = {}) {
	const request = new XMLHttpRequest();
	const stringData = JSON.stringify(data);

	request.open(method, `${url}?_t=${new Date().getTime()}`, async);
	request.setRequestHeader('Content-Type', 'application/json');
	request.setRequestHeader('X-Observer-Forward', 'yes');

	if (type) {
		request.responseType = type;
	}
	
	return async ? new Promise((resolve, reject) => {
		request.onreadystatechange = function () {
			if (request.readyState !== 4) {
				return;
			}

			if (request.status === 200) {
				try {
					if (type === 'blob') {
						return resolve(request.response);
					}

					resolve(JSON.parse(request.responseText));
				} catch (error) {
					resolve(request.responseText);
				}
			} else {
				reject(request.status);
			}
		};

		request.onerror = function (error) {
			reject(error);
		};

		request.send(data && stringData);
	}) : (function () {
		const response = request.send(data && stringData);

		try {
			return JSON.parse(response);
		} catch (error) {
			return response;
		}
	}());
}

module.exports = {
	http,
	Promise
};