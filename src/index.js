const utils = require('./utils');
const api = require('./api');
const pmc = require('@lemonce3/pmc/src');
const snapshot = require('./snapshot');

const fix = {
	x: 0,
	y: 0,
};

function checkFix(event) {
	if (event.target.tagName === 'SELECT') {
		return;
	}

	const x = event.screenX - event.clientX;
	const y = event.screenY - event.clientY;

	if (!(x && y)) {
		return;
	}

	fix.x = x;
	fix.y = y;
}

api.sendAction('enter', {
	referer: document.referrer,
	href: window.location.href,
	title: document.title
});

utils.forEach(['alert', 'confirm', 'prompt'], function (type) {
	const _dialog = window[type];

	window[type] = function (message) {
		api.sendAction(type, { message, returnValue: _dialog.call(window, message) });
	};
});

utils.forEach(['click', 'dbclick', 'contextmenu', 'change'], function (type) {
	utils.addEventListener(document, type, function (event) {
		checkFix(event);

		const bounds = event.target.getBoundingClientRect();

		const data = {
			time: Date.now(),
			rect: {
				x: bounds.x + fix.x,
				y: bounds.y + fix.y,
				width: bounds.width,
				height: bounds.height
			},
			text: utils.getTextSlice(event.target),
			element: {
				tagName: event.target.tagName,
				type: event.target.type
			}
		};

		if (event.type === 'change') {
			data.value = event.target.value;
		}

		api.sendAction(type, data);
	});
});

const cache = { data: null, hash: null };
const SNAPSHOT = {
	CHANNEL: { DRAW: 'snapshot.draw', CALL: 'snapshot.call' },
	TARGET_ATTRIBUTE: 'lc-target',
	THROTTLE_INTERVAL: 200,
};

function SnapshotData(snapshotHash) {
	const frameList = snapshot.setFrameHashAttribute();
	const data = { self: snapshot.create(), map: {} };

	snapshot.removeFrameHashAttribute();

	return utils.Promise.all(utils.map(frameList, function (frame) {
		try {
			return frame.element.contentWindow.__DRAW_SNAPSHOT(snapshotHash);
		} catch (error) {
			return pmc.request(frame.element.contentWindow, SNAPSHOT.CHANNEL.DRAW, snapshotHash)
				.catch(function () { });
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

utils.addEventListener(document, 'mouseover', function (event, target) {
	const snapshotHash = cache.hash = utils.hash();

	target.setAttribute(SNAPSHOT.TARGET_ATTRIBUTE, 'yes');
	SnapshotData(snapshotHash).then(function () {
		target.removeAttribute(SNAPSHOT.TARGET_ATTRIBUTE);

		try {
			return window.top.__CALL_SNAPSHOT(snapshotHash);
		} catch (error) {
			return pmc.request(window.top, SNAPSHOT.CHANNEL.CALL, snapshotHash, { timeout: 50 });
		}
	});
});

pmc.on(SNAPSHOT.CHANNEL.DRAW, window.__DRAW_SNAPSHOT = function (snapshotHash) {
	if (cache.hash === snapshotHash) {
		return utils.Promise.resolve(cache.data);
	}

	return SnapshotData(snapshotHash);
});


if (window.top === window.self) {
	let timer = null;

	const callSnapshot = window.__CALL_SNAPSHOT = function (snapshotHash) {
		clearTimeout(timer);

		timer = setTimeout(function () {
			window.__DRAW_SNAPSHOT(snapshotHash).then(function (data) {
				api.sendSnapshot(data);
			});
		}, SNAPSHOT.THROTTLE_INTERVAL);
	};

	pmc.on(SNAPSHOT.CHANNEL.CALL, callSnapshot);
	setTimeout(callSnapshot, SNAPSHOT.THROTTLE_INTERVAL);
}