const Promise = window.Promise || require('promise-polyfill/lib');

function http(method = 'get', url = '/', { data = null, async = false } = {}) {
	const request = new XMLHttpRequest();
	const stringData = JSON.stringify(data);

	request.open(method, `${url}?_t=${new Date().getTime()}`, async);
	request.setRequestHeader('Content-Type', 'application/json');
	request.setRequestHeader('X-Observer-Forward', 'yes');
	
	return async ? new Promise((resolve, reject) => {
		request.onreadystatechange = function () {
			if (request.readyState !== 4) {
				return;
			}

			if (request.status === 200) {
				try {
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
		request.send(data && stringData);

		const response = request.responseText;

		try {
			return JSON.parse(response);
		} catch (error) {
			return response;
		}
	}());
}

function forEach(arr, callback) {
	if (arr.forEach) {
		arr.forEach(callback);

		return;
	}

	for (let index = 0; index < arr.length; index++) {
		callback(arr[index], index);
	}
}

function getPath(element) {
	const pathList = [];
	const infoList = ['attributes', 'className', 'tagName'];
	let parentElement = element.parentElement;
	
	while (parentElement !== document && parentElement) {
		const result = {};

		forEach(infoList, item => {
			result[item] = element[item];
		});

		pathList.push(result);

		element = parentElement;
		parentElement = element.parentElement;
	};

	return pathList;
}

function getDescribe({target: element, clientX, clientY}) {
	const info = {
		firstChild: null,
		self: null,
		previous: null,
		next: null,
		parent: null,
		position: null
	};

	info.self = getInfo(element);

	const {clientWidth, clientHeight} = document.body;
	info.position = {
		x: clientX, y: clientY,
		width: clientWidth,
		height: clientHeight,
		scrollTop: document.documentElement.scrollTop || document.body.scrollTop, 
		scrollLeft: document.documentElement.scrollLeft || document.body.scrollLeft
	};

	const infoList = {
		previous: 'previousElementSibling',
		next: 'nextElementSibling',
		parent: 'parentElement',
		firstChild: 'firstElementChild'
	};

	for(key in infoList) {
		info[key] = null;

		if (element[infoList[key]]) {
			info[key] = getInfo(element[infoList[key]]);
		}
	}

	return info;
}

function getInfo(element) {
	const {tagName, childNodes} = element;
	let text = '';

	forEach(childNodes, child => {
		if (child.nodeType === 3 && !text) {
			const value = child.nodeValue.replace(/[\n\s]/g, "");

			text = value.length === 0 ? '' : value;
		}
	});

	return {tagName, text};
}

module.exports = {
	http, forEach,
	getPath, getDescribe
};