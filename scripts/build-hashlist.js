const fs = require('fs');
const { join } = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');

/**
 * @typedef IFolder
 * @type {Object}
 * @property {string} name
 * @property {IFolder[]} subfolders
 * @property {string[]} files
 */

/**
 * @param {string} folderName
 * @returns {Promise<IFolder>}
 */
function scanFolder(folderName) {
	return new Promise((resolve, reject) => {
		/** @type {IFolder[]} */ const subFolders = [];
		/** @type {string[]} */ const subFiles = [];
		fs.readdir(folderName, (err, files) => {
			if (err) {
				reject(err);
				return;
			}
			const subPromises = files.map((file) => {
				return new Promise((subResolve, subReject) => {
					fs.lstat(join(folderName, file), (statErr, stat) => {
						if (statErr) {
							subReject(err);
						}

						if (stat.isDirectory()) {
							scanFolder(join(folderName, file) + '/')
								.then((subFolder) => {
									subFolders.push(subFolder);
									subResolve();
								})
								.catch(() => subReject());
						} else {
							subFiles.push(file);
							subResolve();
						}
					});
				});
			});

			Promise.all(subPromises)
				.then(() =>
					resolve({
						name: folderName,
						files: subFiles,
						subfolders: subFolders,
					})
				)
				.catch((reason) => reject(reason));
		});
	});
}

const baseDirRel = './dist';
const distRegexp = /^dist\//;

/**
 * @param {IFolder} folder
 * @param {Object.<string, string>} hashes
 */
async function queueAssetConversions(folder, hashes) {
	const localPath = folder.name;

	if (folder.files) {
		await Promise.all(
			folder.files.map(async (file) => {
				const fileLocalPath = join(localPath, file);
				return (hashes[fileLocalPath.replace(distRegexp, '')] =
					await checksumFile(fileLocalPath));
			})
		);
	}

	if (folder.subfolders) {
		await Promise.all(
			folder.subfolders.map(
				async (subfolder) => await queueAssetConversions(subfolder, hashes)
			)
		);
	}
}

function checksumFile(path) {
	return new Promise((resolve, reject) => {
		const hash = crypto.createHash('SHA512');
		const stream = fs.createReadStream(join(path));
		stream.on('error', (err) => reject(err));
		stream.on('data', (chunk) => hash.update(chunk));
		stream.on('end', () => resolve(hash.digest('base64')));
	});
}

async function run() {
	const assetFolder = await scanFolder(baseDirRel);
	const out = {};
	await queueAssetConversions(assetFolder, out);
	console.log(JSON.stringify(out, undefined, 1));
}

run();
