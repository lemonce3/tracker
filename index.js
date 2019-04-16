const pmc = require('@lemonce3/pmc/src');
const {http, getPath, getDescribe} = require('./src/util');

const WATCHING_EVENTTYPE_LIST = [
	'click', 'dbclick', 'contextmenu',
	'change'
];
const OVERWRITING_METHOD_LIST = [
	'alert', 'confirm', 'prompt'
];
const IS_TOP = window.top === window.self;
const RETRY_INTERVAL = 3000;

const windowObj = {
	id: null,
	agentId: window.navigator.userAgent.toLowerCase()
};

function init() {
	http('post', `/api/window`, {
		data: {
			agentId: windowObj.agentId
		}
	}).then(data => {
		windowObj.id = data;

		http('DELETE', `/api/window/${windowObj.id}`);
	}, function () {
		setTimeout(init, RETRY_INTERVAL);
	});
}

if (IS_TOP) {
	postEventMessage({
		type: 'jumpTo',
		describe: {
			title: document.title, URL: window.location.href
		}
	}, true);

	init();
}

let targetDom = {
	hash: 1,
	path: null,
	describe: null
};

pmc.on('event.capture', function (data) {
	const newData = {
		hash: data.hash,
		path: data.path.concat(targetDom.path),
		describe: data.describe.concat(targetDom.describe),
		type: data.type
	};

	if (IS_TOP) {
		postEventMessage(newData);
	} else {
		pmc.request(parent, 'event.capture', newData);
	}

});

window.addEventListener('mouseover', function (event) {
	targetDom.hash = Math.random().toString(16).substr(2, 8);
	targetDom.path = getPath(event.target, []);
	targetDom.describe = getDescribe(event.target, []);
}, true);

WATCHING_EVENTTYPE_LIST.forEach(function (eventName) {
	window.addEventListener(eventName, function (event) {
		const data = {
			hash: targetDom.hash, path: targetDom.path,
			describe: targetDom.describe,
			type: event.type
		};

		if (IS_TOP) {
			postEventMessage(data);
		} else {
			pmc.request(parent, 'event.capture', data);
		}
	}, true);
});

OVERWRITING_METHOD_LIST.forEach(function (methodName) {
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

function postEventMessage(data, async = false) {
	const {id, agentId} = windowObj;

	http('post', `/api/action`, {
		data: {
			windowId: id, agentId, eventInfo: data
		},
		async
	});
}