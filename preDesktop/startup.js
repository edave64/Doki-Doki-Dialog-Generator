module.exports = async function () {
	const server = require('./server.js');
	const ipc = require('./ipc.js');
	const window = require('./window.js');

	ipc.install();
	server.start();

	await Promise.all([server.isReady, window.isReady]);
	const updateDownloader = require('./updateDownloader.js');
	updateDownloader();
	window.open();
};
