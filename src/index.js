const utils = require('./utils');
const api = require('./api');
const pmc = require('@lemonce3/pmc/src');
const snapshot = require('./snapshot');

api.action.send('enter', {
	referer: document.referrer,
	href: window.location.href,
	title: document.title
});

/**
 * Override Window
 */
utils.forEach(['alert', 'confirm', 'prompt'], function (type) {
	const _dialog = window[type];
	
	window[type] = function (message) {
		const returnValue = _dialog.apply(window, message);

		api.action.send(type, { message, returnValue });
	};
});

/**
 * Listen mouseevent
 */
utils.forEach(['click', 'dbclick', 'contextmenu', 'change'], function (type) {
	utils.addEventListener(document, type, function () {
		api.action.send(type, { targetId: null, windowId: null });
	});
});

/**
 * 收集快照
 */
const cache = { data: null, hash: null };
const SNAPSHOT = {
	CHANNEL: { DRAW: 'snapshot.draw', CALL: 'snapshot.call' },
	TARGET_ATTRIBUTE: 'lc-target',
	THROTTLE_INTERVAL: 100,
};

function SnapshotData() {
	const frameList = snapshot.setFrameHashAttribute();
	const snapshotHash = cache.hash = utils.hash();
	const data = { self: snapshot.create(), map: {} };

	snapshot.removeFrameHashAttribute();

	return utils.Promise.all(utils.map(frameList, function (frame) {
		try {
			return frame.element.contentWindow.__DRAW_SNAPSHOT(snapshotHash);
		} catch (error) {
			return pmc.request(frame.element.contentWindow, SNAPSHOT.CHANNEL.DRAW, snapshotHash)
				.catch(function () {});
		}
	})).then(function (frameDataList) {
		utils.forEach(frameDataList, function (frameData, index) {
			if (frameData) {
				data.map[frameList[index].hash] = frameData;
			}
		});

		return cache.data = data;
	});
}

utils.addEventListener(document, 'mouseover', function (event) {
	const { target } = event;

	target.setAttribute(SNAPSHOT.TARGET_ATTRIBUTE, 'yes');
	SnapshotData().then(function () {
		try {
			return window.top.__CALL_SNAPSHOT(cache.hash);
		} catch (error) {
			return pmc.request(window.top, SNAPSHOT.CHANNEL.CALL, cache.hash, { timeout: 50 });
		}
	});
	target.removeAttribute(SNAPSHOT.TARGET_ATTRIBUTE);
});

pmc.on(SNAPSHOT.CHANNEL.DRAW, window.__DRAW_SNAPSHOT = function (hash) {
	if (cache.hash === hash) {
		return utils.Promise.resolve(cache.data);
	}
	
	return SnapshotData();
});


if (window.top === window.self) {
	let timer = null;

	pmc.on(SNAPSHOT.CHANNEL.CALL, window.__CALL_SNAPSHOT = function (hash) {
		//清除计时器
		clearTimeout(timer);
		
		timer = setTimeout(function () {
			window.__DRAW_SNAPSHOT(hash).then(function (data) {
				console.log(data)
			});
		}, SNAPSHOT.THROTTLE_INTERVAL);
	});
}