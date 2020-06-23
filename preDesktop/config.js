const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../config.json');

const baseConfig = {
	downloadPath: path.join(__dirname, '../panels/'),
};

let readConfig = null;

module.exports = {
	getConfig() {
		if (!readConfig) {
			readConfig = baseConfig;
			try {
				const content = fs.readFileSync(configPath);
				readConfig = {
					...readConfig,
					...JSON.parse(content),
				};
			} catch (e) {}
		}
		return readConfig;
	},
	saveConfig() {
		if (!readConfig) return;
		fs.writeFile(configPath, JSON.stringify(readConfig), err => {});
	},
};
