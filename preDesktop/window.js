const {
	app,
	Menu,
	BrowserWindow,
	dialog,
	shell,
	session,
} = require('electron');
const path = require('path');
const url = require('url');
const { port } = require('./constants');
const fileManagerCommandForPath = require('./fileManager');
const config = require('./config').getConfig();
const { backgroundsPath, characterPath } = require('./constants');
const ipc = require('./ipc');

const WINDOW_WIDTH = 1428;
const WINDOW_HEIGHT = 720;

let makeReady;

app.on('ready', function() {
	makeReady();
	create_menus();
});

app.on('window-all-closed', function() {
	app.quit();
});

function create_menus() {
	const template = [
		{
			label: app.getName(),
			submenu: [
				{
					label: 'Set download folder',
					click: () => {
						const newPath = dialog.showOpenDialogSync(w, {
							title: 'Set download folder',
							defaultPath: config.downloadPath,
							properties: ['openDirectory'],
						});
						if (!newPath) return;
						config.downloadPath = newPath[0];
						require('./config').saveConfig();
					},
				},
				{
					label: 'Open download folder in file manager',
					click: () => {
						fileManagerCommandForPath(config.downloadPath);
					},
				},
				{
					label: 'Open content pack folder in file manager',
					click: () => {
						fileManagerCommandForPath(characterPath);
					},
				},
				{
					label: 'Open background folder in file manager',
					click: () => {
						fileManagerCommandForPath(backgroundsPath);
					},
				},
				{ type: 'separator' },
				{
					role: 'quit',
				},
			],
		},
		{
			label: 'View',
			submenu: [
				{ role: 'reload' },
				{ type: 'separator' },
				{ role: 'resetzoom' },
				{ role: 'zoomin' },
				{ role: 'zoomout' },
				{ type: 'separator' },
				{ role: 'togglefullscreen' },
			],
		},
		{
			label: 'Panel',
			submenu: [
				panelItem('General', ''),
				panelItem('Content Packs', 'character-packs'),
				panelItem('Add'),
				panelItem('Backgrounds'),
				panelItem('Credits'),
			],
		},
	];

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}

/**
 * @param {string} label
 * @param {string|undefined} panel
 */
function panelItem(label, panel) {
	if (panel === undefined) panel = label.toLowerCase();
	return {
		label,
		click: () => {
			ipc.send.openPanel(panel);
		},
	};
}

module.exports = {
	open() {
		w = new BrowserWindow({
			width: WINDOW_WIDTH,
			height: WINDOW_HEIGHT,
			resizable: true,
			icon:
				process.platform === 'win32'
					? path.join(__dirname, '../favicon.ico')
					: path.join(__dirname, '../favicon.png'),
			webPreferences: {
				preload: path.join(__dirname, 'electronPreload.js'),
			},
		});

		w.webContents.session.setPermissionCheckHandler(() => false);

		w.webContents.session.setPermissionRequestHandler(
			(webCont, perm, callback, details) => callback(false)
		);
		w.webContents.session.webRequest.onHeadersReceived((details, callback) => {
			callback({
				responseHeaders: {
					...details.responseHeaders,
					'Content-Security-Policy': [
						"script-src 'self'; object-src 'none'; child-src 'none'; form-action 'self'",
					],
				},
			});
		});

		w.loadURL(
			url.format({
				pathname: 'localhost:' + port /* 'localhost:8080' */,
				protocol: 'http:',
				slashes: true,
			})
		);

		// Prevent new links to open in the same tab
		w.webContents.on('new-window', (event, url) => {
			event.preventDefault();
			shell.openExternal(url);
			//win.loadURL(url);
		});

		// Prevent navigation
		w.webContents.on('will-navigate', (event, url) => {
			if (url === 'http://localhost:3000/') return;

			shell.openExternal(url);
			event.preventDefault();
		});

		w.webContents.on('before-input-event', function(e, props) {
			if (props && props.key === 'I' && props.control) {
				w.webContents.openDevTools();
				e.preventDefault();
				return false;
			}
		});

		w.on('closed', function() {
			w = null;
		});
	},

	isReady: new Promise(resolve => {
		makeReady = resolve;
	}),

	getWindow() {
		return w;
	},
};
