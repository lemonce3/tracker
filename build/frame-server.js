const path = require('path');
const http = require('http');
const fs = require('fs');
const template = require('es6-template-strings');

const startPort = config.frameServer.startPort;
const {host, port} = config;

const frameHTML = fs.readFileSync(path.resolve(__dirname, 'template/frame.html'), 'utf-8');
const topHTML = fs.readFileSync(path.resolve(__dirname, 'template/top.html'), 'utf-8');
const framesetHTML = fs.readFileSync(path.resolve(__dirname, 'template/frameset.html'), 'utf-8');

exports.rootFrameURL = `http://${host}:${startPort}`;

function createFrameServer(id, frameData, callback = () => {}, frameset = false) {
	const framePort = startPort + id;

	const content = template(
		frameData ? (frameset ? framesetHTML : frameHTML) : topHTML,
		Object.assign({
			bundleURL: `http://${host}:${port}/bundle.js`, port: framePort
		}, frameData ? {
			urlA: `http://${host}:${startPort + frameData[0]}`,
			urlB: `http://${host}:${startPort + frameData[1]}`,
		} : {})
	);

	http.createServer((req, res) => {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(content);
	}).listen(framePort);

	callback();
}

createFrameServer(0, [1, 2], () => {
	createFrameServer(1);

	createFrameServer(2);
}, true);