exports.Promise = window.Promise || require('promise-polyfill/lib');
exports.XMLHttpRequest = window.XMLHttpRequest || function XMLHttpRequest () {
	// eslint-disable-next-line no-undef
	return new ActiveXObject('Microsoft.XMLHTTP');
};

const _forEach = Array.prototype.forEach;

exports.forEach = function forEach(array, callback) {
	if (_forEach) {
		_forEach.call(array, callback);
	} else {
		for (let index = 0; index < array.length; index++) {
			callback(array[index], index);
		}
	}
};

const _map = Array.prototype.map;

exports.map = function map(array, callback) {
	const newArray = [];

	if (_map) {
		return _map.call(array, callback);
	} else {
		for (let index = 0; index < array.length; index++) {
			newArray.push(callback(array[index], index));
		}

		return newArray;
	}
};

exports.now = Date.now || function now() {
	return new Date().getTime();
};

exports.hash = function hash() {
	return Math.random().toString(16).substr(2, 8);
};

exports.addEventListener = function addEventListener(dom, eventType, listener) {
	if (dom.addEventListener) {
		dom.addEventListener(eventType, listener, false);
	} else {
		dom.attachEvent(`on${eventType}`, function (event) {
			event.target = event.srcElement;
			listener(event);
		});
	}
};