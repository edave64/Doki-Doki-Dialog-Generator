const IPC = require('../ipc');
const { getWindow } = require('../window');
const { join } = require('path');
const prompt = require('electron-prompt');

IPC.receive.showPrompt(async (id, message, defaultValue) => {
	const ret = await prompt(
		{
			label: message,
			value: defaultValue || null,
		},
		getWindow()
	);
	IPC.send.promptAnswered(id, ret);
});
