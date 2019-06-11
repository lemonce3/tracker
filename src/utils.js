exports.Promise = window.Promise || require('promise-polyfill/lib');
exports.XMLHttpRequest = window.XMLHttpRequest || function XMLHttpRequest() {
	// eslint-disable-next-line no-undef
	return new ActiveXObject('Microsoft.XMLHTTP');
};

const MODEL_ELEMENT = /(input|textarea)/;
const VALUE_IGNORE_INPUT = /(checkbox|radio)/;
const DEFAULT_TRANCATE_LENGTH = 60;
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

exports.hash = function hash() {
	return Math.random().toString(16).substr(2, 8);
};

exports.addEventListener = function addEventListener(dom, eventType, listener) {
	function listenerWrap(event) {
		listener(event, event.target || event.srcElement);
	}

	if (dom.addEventListener) {
		dom.addEventListener(eventType, listenerWrap, true);
	} else {
		dom.attachEvent(`on${eventType}`, listenerWrap);
	}
};

function searchText(element) {
	return element.textContent
		? element.textContent
		: element.innerText;
}

function searchLabel(element) {
	const labels = element.labels;
	if (labels && labels[0]) {
		return labels[0].textContent
			? labels[0].textContent
			: labels[0].innerText;
	}

	if (VALUE_IGNORE_INPUT.test(element.type)) {
		return null;
	}

	return element.value;
}

function strTrim(str) {
	return str.replace(/^\s+|\s+$/g, '');
}

function truncateText(string, length) {
	let text = strTrim(String(string));
	const newlinePos = text.search(/\r?\n/);

	if (newlinePos !== -1) {
		text = text.substr(0, newlinePos);
	}

	if (text.length > length) {
		return text.substr(0, length - 1) + '...';
	}

	return text;
}

exports.getTextSlice = function getTextSlice(element, length = DEFAULT_TRANCATE_LENGTH) {
	let raw;

	if (MODEL_ELEMENT.test(element.tagName.toLowerCase())) {
		raw = searchLabel(element);
	} else {
		raw = searchText(element);
	}

	return raw ? truncateText(raw, length) : null;
};