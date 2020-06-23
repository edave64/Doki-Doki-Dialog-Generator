const constants = require('./constants');
const { unlinkRec, downloadJSON } = require('./files');
const request = require('request');
const { readFile } = require('fs');
const { promisify } = require('util');
const { join } = require('path');
const _ = require('lodash');

module.exports = function () {
	run().catch((e) => {
		console.error('updater error: ', e);
	});
};

async function run() {
	await downloadUpdates(
		constants.desktopUpdateTargetPath,
		constants.desktopUpdateDLPath,
		constants.desktopUpdateSource
	);
	await downloadUpdates(
		constants.dddgUpdateTargetPath,
		constants.dddgUpdateDLPath,
		constants.dddgUpdateSource
	);
}

/**
 * @param {fs.PathLike} targetFolder
 * @param {fs.PathLike} downloadFolder
 * @param {string} sourceUrl
 */
async function downloadUpdates(targetFolder, downloadFolder, sourceUrl) {
	await unlinkRec(downloadFolder);
	const remoteHashList = await downloadJSON(`${sourceUrl}/hash-list.json`);
	const localHashList = JSON.parse(
		await promisify(readFile)(join(targetFolder, 'hash-list.json'), 'utf8')
	);
	const deleteFiles = _.difference(
		Object.keys(localHashList),
		Object.keys(remoteHashList)
	);
	console.log(diff);
}
