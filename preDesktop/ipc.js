const { ipcMain } = require('electron');
const { readdirSync } = require('fs');
const { join } = require('path');

/** @type {Electron.WebContents | null} */
let target;

const IPC = {
	install() {
		console.log('installing ipc');
		const ipcFolder = join(__dirname, './ipcs/');
		for (const file of readdirSync(join(__dirname, './ipcs/'))) {
			require(join(ipcFolder, file));
		}
	},
	send: {
		/**
		 * @param {string} text
		 */
		pushMessage(text) {
			target.send('push-message', text);
		},
		/**
		 * @param {string} filePath
		 */
		addPersistentBackground(filePath) {
			target.send('add-persistent-background', filePath);
		},
		/**
		 * @param {string} filePath
		 * @param {boolean} active
		 */
		addPersistentCharacter(filePath, active) {
			target.send('add-persistent-character', filePath, active);
		},
		/**
		 * @param {number} id
		 * @param {string|null} ret
		 */
		promptAnswered(id, ret) {
			target.send('prompt-answered', id, ret);
		},
		/**
		 * @param {'general'|'add'|'backgrounds'|'credits'} panel
		 */
		openPanel(panel) {
			target.send('open-panel', panel);
		},
		/**
		 * @param {'general'|'add'|'backgrounds'|'credits'} panel
		 */
		openPanel(panel) {
			target.send('open-panel', panel);
		},
	},
	receive: {
		/** @param {IPCFindCustom} callback */
		findCustoms(callback) {
			receiver('find-customs', callback);
		},
		/** @param {IPCSavePanel} callback */
		savePanel(callback) {
			receiver('save-file', callback);
		},
		/** @param {IPCShowPrompt} callback */
		showPrompt(callback) {
			receiver('show-prompt', callback);
		},
		/** @param {IPCInstallBackground} callback */
		installBackground(callback) {
			receiver('install-background', callback);
		},
		/** @param {IPCUninstallBackground} callback */
		uninstallBackground(callback) {
			receiver('uninstall-background', callback);
		},
		/** @param {IPCContentPack} callback */
		installContentPack(callback) {
			receiver('install-content-pack', callback);
		},
		/** @param {IPCContentPack} callback */
		uninstallContentPack(callback) {
			receiver('uninstall-content-pack', callback);
		},
		/** @param {IPCContentPack} callback */
		activateContentPack(callback) {
			receiver('activate-content-pack', callback);
		},
		/** @param {IPCContentPack} callback */
		deactivateContentPack(callback) {
			receiver('deactivate-content-pack', callback);
		},
	},
};

function receiver(name, callback) {
	ipcMain.on(name, async (e, ...args) => {
		target = e.sender;
		try {
			await callback(...args);
		} catch (e) {
			IPC.send.pushMessage('Error: ' + e.message);
			throw e;
		}
	});
}

module.exports = IPC;

/**
 * @callback IPCFindCustom
 * @returns {void}
 */

/**
 * @callback IPCSavePanel
 * @param {string} filename
 * @param {Uint8Array} responseMessage
 * @returns {void}
 */

/**
 * @callback IPCShowPrompt
 * @param {number} promptId
 * @param {string} message
 * @param {string|null} defaultValue
 * @returns {void}
 */

/**
 * @callback IPCInstallBackground
 * @param {string} filename
 * @param {Uint8Array} blob
 * @returns {void}
 */

/**
 * @callback IPCUninstallBackground
 * @param {string} filename
 * @returns {void}
 */

/**
 * @callback IPCContentPack
 * @param {string} url
 * @returns {void}
 */
