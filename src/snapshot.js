const utils = require('./utils');

const FRAME_SELECTOR = 'frame, iframe';
const FRAME_ATTRIBUTE = 'lc-hash';

exports.setFrameHashAttribute = function setFrameHashAttribute() {
	return utils.map(document.querySelectorAll(FRAME_SELECTOR), function (element) {
		const hash = utils.hash();
		
		element.setAttribute(FRAME_ATTRIBUTE, hash);
		
		return { element, hash };
	});
};

exports.removeFrameHashAttribute = function removeFrameHashAttribute() {
	utils.forEach(document.querySelectorAll(FRAME_SELECTOR), function (frameElement) {
		frameElement.removeAttribute(FRAME_ATTRIBUTE);
	});
};

exports.create = function createSnapshot() {
	let outerHTML = window.document.documentElement.outerHTML;

	utils.forEach(document.querySelectorAll('link, script, meta, style'), function (element) {
		outerHTML = outerHTML.replace(element.outerHTML, '');
	});
	
	return outerHTML.replace(/[\r\n]/g, '').replace(/>\s+</g, '><');
};