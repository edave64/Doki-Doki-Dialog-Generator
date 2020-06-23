const IPC = require('../ipc');
const config = require('../config').getConfig();
const { join } = require('path');
const { writeFile } = require('fs');

IPC.receive.savePanel((filename, blob) => {
	const fullPath = join(config.downloadPath, join('/', filename));
	writeFile(fullPath, blob, err => {
		if (!err) {
			IPC.send.pushMessage(`File '${fullPath}' successfully saved!`);
		} else {
			IPC.send.pushMessage(`Error while saving. ${err.message}`);
		}
	});
});
