const pmc = require('@lemonce3/pmc/src');
const {http, forEach, getPath, getDescribe} = require('./src/util');

const IS_TOP = window.top === window.self;
const RETRY_INTERVAL = 3000;

let windowId;

function init() {
	try {
		windowId = http('post', `/api/window`, {
			data: {
				agentId: window.navigator.userAgent.toLowerCase(),
				title: document.title, URL: window.location.href
			}
		});
		
		http('DELETE', `/api/window/${windowId}`, {async: true});
	} catch (e) {
		setTimeout(init, RETRY_INTERVAL);
	} 
}

if (IS_TOP) {
	// init();
}

const targetDom = {
	hash: 1,
	path: null,
	describe: null,
	snapshot: null
};

pmc.on('event.capture', function ({
	hash, path, describe, type, snapshot
}) {
	const newData = {
		hash,
		path: path.concat(targetDom.path),
		describe: describe,
		type, snapshot
	};

	if (IS_TOP) {
		postEventMessage(newData);
	} else {
		pmc.request(parent, 'event.capture', newData);
	}

});

window.addEventListener('mouseover', function (event) {
	const {target} = event;

	targetDom.hash = Math.random().toString(16).substr(2, 8);
	targetDom.path = getPath(target);
	targetDom.describe = getDescribe(event);
	targetDom.snapshot = target.outerHTML.replace(target.innerHTML, '');
}, true);

forEach([
	'click', 'dbclick', 'contextmenu',
	'change'
], function (eventName) {
	window.addEventListener(eventName, function (event) {
		const {hash, path, describe, snapshot} = targetDom;
		const data = {
			type: event.type,
			hash, path, describe, snapshot
		};
		console.log(event);
		if (IS_TOP) {
			postEventMessage(data);
		} else {
			pmc.request(parent, 'event.capture', data);
		}
	}, true);
});

forEach([
	'alert', 'confirm', 'prompt'
], function (methodName) {
	const native = window[methodName];

	window[methodName] = function (message) {
		const result = native.apply(window, arguments);

		postEventMessage({
			type: methodName,
			describe: {
				message, result
			}
		});
	}
});

function postEventMessage(data) {
	return http('post', `/api/${windowId}/action`, {
		data
	});
}