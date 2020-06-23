const IPC = require('../ipc');
const { writeFile, unlink } = require('fs');
const { join } = require('path');
const { backgroundsPath } = require('../constants');

IPC.receive.installBackground((filename, blob) => {
	const fullPath = join(backgroundsPath, join('/', filename));
	writeFile(fullPath, blob, err => {
		if (!err) {
			IPC.send.pushMessage(`File '${fullPath}' successfully installed!`);
		} else {
			IPC.send.pushMessage(`Error while installing. ${err.message}`);
		}
	});
});

IPC.receive.uninstallBackground(filename => {
	const fullPath = join(backgroundsPath, join('/', filename));
	console.log(fullPath);
	unlink(fullPath, err => {
		if (!err) {
			IPC.send.pushMessage(`File '${fullPath}' successfully uninstalled!`);
		} else {
			IPC.send.pushMessage(`Error while uninstalling. ${err.message}`);
		}
	});
});
