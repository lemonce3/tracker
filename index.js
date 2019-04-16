const pmc = require('@lemonce3/pmc/src');
const {http} = require('./src/util');

const WATCHING_EVENTTYPE_LIST = [
	'click', 'dbclick', 'contextmenu',
	'change'
];
const IS_TOP = window.top === window.self;
const RETRY_INTERVAL = 3000;

const windowObj = {
	id: null,
	agentId: window.navigator.userAgent.toLowerCase()
};

if (IS_TOP) {
	//获取windowId，delete window
}

let targetDom = {
	hash: 1,
	path: null,
	describe: null
};

pmc.on('event.capture', function (data) {
	const newData = {
		hash: `${data.hash}-${targetDom.hash}`, //hash需要这么复杂吗？
		path: data.path.concat(targetDom.path),
		describe: data.describe.concat(targetDom.describe),
		type: data.type
	};

	if (IS_TOP) {
		postEventMessage(newData);

		return false;
	}

	pmc.request(parent, 'event.capture', newData);
});

window.addEventListener('mouseover', function (event) {
	targetDom.hash = ++ targetDom.hash;
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

function postEventMessage(data) {
	const {id, agentId} = windowObj;

	http('post', `/api/window/event`, {
		data: {
			agentId, windowId: id, eventInfo: data
		},
		async: false
	});
}

function getPath(target, pathList = []) {
	const parentElement = target.parentElement;
	const infoList = ['attributes', 'classList', 'className', 'tagName'];

	if (parentElement !== document && parentElement) {
		const result = {};

		infoList.forEach(item => {
			result[item] = target[item];
		});

		pathList.push(result);

		return getPath(parentElement, pathList);
	}

	return pathList;
}

function getDescribe(target, describeList = []) {
	const parentElement = target.parentElement;

	if (parentElement !== document && parentElement) {
		describeList.push(target.textContent);

		return getDescribe(parentElement, describeList);
	}

	return describeList;
}