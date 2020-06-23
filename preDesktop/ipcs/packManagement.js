const IPC = require('../ipc');
const { writeFile, unlink } = require('fs');
const { join } = require('path');
const packManager = require('../packManager');

IPC.receive.activateContentPack(url => {
	const packName = lookupPackName(url);
	packManager.queueActivateContentPack(packName);
});

IPC.receive.deactivateContentPack(url => {
	const packName = lookupPackName(url);
	packManager.queueDeactivateContentPack(packName);
});

IPC.receive.installContentPack(url => {
	packManager.installContentPack(url);
});

IPC.receive.uninstallContentPack(url => {
	const packName = lookupPackName(url);
	packManager.queueUninstallContentPack(packName);
});

const matcher = /\/([^\/]*?)\/([^\/]*?).json$/;
/**
 * @param {string} path
 */
function lookupPackName(path) {
	console.log('lookupPath', path);
	const matches = matcher.exec(path);
	console.log(matches);
	return matches[1];
}
