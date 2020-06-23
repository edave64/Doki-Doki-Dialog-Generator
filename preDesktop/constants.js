const { join } = require('path');

module.exports = Object.freeze({
	characterPath: join(__dirname, '../custom_characters/'),
	backgroundsPath: join(__dirname, '../custom_backgrounds/'),

	dddgUpdateDLPath: join(__dirname, '../updates/dddgWeb'),
	dddgUpdateTargetPath: join(__dirname, '../dddgWeb'),
	dddgUpdateSource: 'https://edave64.github.io/Doki-Doki-Dialog-Generator/pre',

	desktopUpdateDLPath: join(__dirname, '../updates/desktop'),
	desktopUpdateTargetPath: join(__dirname, '../components'),
	desktopUpdateSource:
		'https://edave64.github.io/Doki-Doki-Dialog-Generator/preDesktop',

	port: 3000,
});
