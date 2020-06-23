const IPC = require('../ipc');
const { readdir } = require('fs');
const { backgroundsPath, characterPath } = require('../constants');
const packManager = require('../packManager');

IPC.receive.findCustoms(async () => {
	await packManager.applyQueues();
	readdir(backgroundsPath, (err, files) => {
		if (err) return;
		for (const file of files) {
			if (file.startsWith('.')) continue;
			IPC.send.addPersistentBackground('/custom_backgrounds/' + file);
		}
	});
	readdir(characterPath, (err, folders) => {
		if (err) return;
		for (const folder of folders) {
			IPC.send.addPersistentCharacter(
				`/custom_characters/${folder}/index.json`,
				!folder.startsWith('.')
			);
		}
	});
});
