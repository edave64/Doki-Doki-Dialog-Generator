//const fetch = require('node-fetch');
const IPC = require('./ipc');
const { dirname, join, basename } = require('path');
const { characterPath } = require('./constants');
const { promisify } = require('util');
const request = require('request');
const fs = require('fs');
const mkdirp = promisify(require('mkdirp'));
const crypto = require('crypto');
const sha256 = crypto.createHash('sha256');
const del = require('del');

const queueFile = join(__dirname, '../queues.json');
let loaded = false;

const queues = {
	/** @type {string[]} */
	deactivate: [],
	/** @type {string[]} */
	activate: [],
	/** @type {string[]} */
	uninstall: [],
};

module.exports = {
	async applyQueues() {
		if (!loaded) {
			try {
				const contents = await promisify(fs.readFile)(queueFile, {
					encoding: 'utf8',
				});
				Object.assign(queues, JSON.parse(contents));
			} catch (e) {}
		}
		try {
			const uninstalls = [];
			for (const uninstall of queues.uninstall) {
				if (
					uninstall.includes('/') ||
					uninstall === '..' ||
					uninstall === '.'
				) {
					throw new Error(
						'Protection error: queued uninstall contains a restricted characters! ' +
							uninstall
					);
				}
				uninstalls.push(del(join(characterPath, uninstall)));
			}
			await Promise.all(uninstalls);
			const deactivates = [];
			for (const deactivate of queues.deactivate) {
				if (
					deactivate.includes('/') ||
					deactivate === '..' ||
					deactivate === '.'
				) {
					throw new Error(
						'Protection error: queued deactivate contains a restricted characters! ' +
							deactivate
					);
				}
				deactivates.push(
					promisify(fs.rename)(
						join(characterPath, deactivate),
						join(characterPath, '.' + deactivate)
					)
				);
			}
			await Promise.all(deactivates);
			const activates = [];
			for (const activate of queues.activate) {
				if (activate.includes('/') || activate === '..' || activate === '.') {
					throw new Error(
						'Protection error: queued activate contains a restricted characters! ' +
							activate
					);
				}
				activates.push(
					promisify(fs.rename)(
						join(characterPath, activate),
						join(characterPath, activate.replace(/^\.+/, ''))
					)
				);
			}
			await Promise.all(activates);
		} catch (e) {
			console.error(e);
			IPC.send.pushMessage(
				`There was an issue applying content-pack changes. The previously made changes might not have been fully applied! Error: ${e}`
			);
		}
		Object.assign(queues, {
			deactivate: [],
			activate: [],
			uninstall: [],
		});
		updateQueueFile();
	},

	/**
	 * @param {string} url
	 */
	async installContentPack(url) {
		let response;
		try {
			if (url.startsWith('/')) {
				url = 'http://localhost:3000' + url;
			}
			response = (await promisify(request)({
				url,
			})).body;
			console.log(response);
		} catch (e) {
			throw new Error('Could not fetch content pack: ' + e.message);
		}
		let json;
		try {
			json = JSON.parse(response);
		} catch (e) {
			throw new Error('Cannot parse json');
		}
		const uninstallIdx = queues.uninstall.indexOf(json.packId);
		if (uninstallIdx >= 0) {
			queues.uninstall.splice(uninstallIdx, 1);
			await updateQueueFile();
			console.log('uninstallIdx: ' + uninstallIdx + ' skipped');
			return;
		}
		const baseFetch = dirname(url);
		const baseTarget = join(characterPath, join('/', json.packId));
		const externalTarget = join(baseTarget, '$external');

		const paths = {
			'/': 'localhost:3000/',
			'./': baseFetch + '/',
		};
		const originalBase = joinNormalize('', json.folder || '/', paths);
		const pathData = {
			baseFetch,
			baseTarget,
			externalTarget,
			paths,
		};
		if (json.chibi) {
			json.chibi = await importImage(originalBase, pathData, json.chibi);
		}
		const partImporters = [];

		if (json.eyes)
			partImporters.push(importParts(originalBase, pathData, json.eyes));
		if (json.hairs)
			partImporters.push(importParts(originalBase, pathData, json.hairs));

		await Promise.all([
			...partImporters,
			importHeads(originalBase, pathData, json.heads),
			importPoses(originalBase, pathData, json.poses),
		]);

		await promisify(fs.writeFile)(
			join(baseTarget, './index.json'),
			JSON.stringify(json),
			{ encoding: 'utf8' }
		);
	},

	/**
	 * @param {string} packName
	 */
	async queueUninstallContentPack(packName) {
		if (queues.uninstall.indexOf(packName) >= 0) {
			return;
		}
		queues.uninstall.push(packName);
		await updateQueueFile();
	},

	/**
	 * @param {string} packName
	 */
	async queueActivateContentPack(packName) {
		if (queues.activate.indexOf(packName) >= 0) {
			return;
		}
		const deactivateIdx = queues.deactivate.indexOf(packName);
		if (deactivateIdx >= 0) {
			queues.deactivate.splice(deactivateIdx, 1);
			await updateQueueFile();
			return;
		}
		queues.activate.push(packName);
		await updateQueueFile();
	},

	/**
	 * @param {string} packName
	 */
	async queueDeactivateContentPack(packName) {
		if (queues.deactivate.indexOf(packName) >= 0) {
			return;
		}
		const activateIdx = queues.deactivate.indexOf(packName);
		if (activateIdx >= 0) {
			queues.activate.splice(activateIdx, 1);
			await updateQueueFile();
			return;
		}
		queues.deactivate.push(packName);
		await updateQueueFile();
	},
};

async function updateQueueFile() {
	await promisify(fs.writeFile)(queueFile, JSON.stringify(queues), {
		encoding: 'utf8',
	});
}

/**
 * @param {string} baseFolder
 * @param {PathData} pathData
 * @param {Object.<string,string} parts
 */
async function importParts(baseFolder, pathData, parts) {
	for (const partKey of Object.keys(parts)) {
		parts[partKey] = await importImage(baseFolder, pathData, parts[partKey]);
	}
}

/**
 * @param {string} baseFolder
 * @param {PathData} pathData
 * @param {Object.<string,Array<string|{img: string}>>} heads
 */
async function importHeads(baseFolder, pathData, heads) {
	for (const headGroupKey of Object.keys(heads)) {
		if (heads[headGroupKey] instanceof Array) {
			heads[headGroupKey] = await Promise.all(
				heads[headGroupKey].map(importNsfwAble.bind(null, baseFolder, pathData))
			);
		} else {
			const headDir = joinNormalize(
				baseFolder,
				heads[headGroupKey].folder || ''
			);
			heads[headGroupKey].all = await Promise.all(
				heads[headGroupKey].all.map(
					importNsfwAble.bind(null, headDir, pathData)
				)
			);
		}
	}
}

/**
 * @param {string} baseFolder
 * @param {PathData} pathData
 * @param {Array<Object>} poses
 */
async function importPoses(baseFolder, pathData, poses) {
	for (const pose of poses) {
		const poseDir = joinNormalize(baseFolder, pose.folder || '');
		if ('static' in pose) {
			pose.static = await importImage(baseFolder, pathData, pose.static);
		} else if ('variant' in pose) {
			pose.variant = await Promise.all(
				pose.variant.map(importNsfwAble.bind(null, poseDir, pathData))
			);
		} else if ('left' in pose) {
			pose.left = await Promise.all(
				pose.left.map(importNsfwAble.bind(null, poseDir, pathData))
			);
			pose.right = await Promise.all(
				pose.right.map(importNsfwAble.bind(null, poseDir, pathData))
			);
		}
	}
}

/**
 * @param {string} baseFolder
 * @param {PathData} pathData
 * @param {string|{img: string}} value
 * @returns {string|{img: string}}
 */
async function importNsfwAble(baseFolder, pathData, value) {
	if (typeof value === 'string') {
		return await importImage(baseFolder, pathData, value);
	} else {
		return {
			...value,
			img: await importImage(baseFolder, pathData, value.img),
		};
	}
}

/**
 * @param {string} baseFolder
 * @param {PathData} pathData
 * @param {string} subUrl
 * @returns {Promise<string>}
 */
function importImage(baseFolder, pathData, subUrl) {
	const url = joinNormalize(baseFolder, subUrl, pathData.paths);
	return new Promise(async (resolve, reject) => {
		const query = request(url);
		let filePath;
		let retPath;
		if (url.startsWith(pathData.baseFetch)) {
			const relativePath = join('/', url.slice(pathData.baseFetch.length));
			retPath = '.' + relativePath.replace('\\', '/');
			filePath = join(pathData.baseTarget, relativePath);
			console.log('saving: ' + url + ' as ' + filePath);
			await mkdirp(dirname(filePath));
		} else {
			const baseName = `${sha256(url)}_${basename(url)}`;
			retPath = `./$external/${baseName}`;
			filePath = join(pathData.externalTarget, baseName);
		}
		const stream = fs.createWriteStream(filePath, { flags: 'w' });
		query.pipe(stream);
		stream.on('finish', () => {
			if (query.response.statusCode !== 200) {
				reject(
					`Resource '${url}' could not be loaded. (Responded with code ${query.response.statusCode})`
				);
			}
			resolve(retPath);
		});
		stream.on('error', err => {
			reject(err);
		});
	});
}

/**
 *
 * @param {string} base
 * @param {string} sub
 * @param {Object.<string, string>} paths
 */
function joinNormalize(base, sub, paths) {
	for (const path in paths) {
		if (sub.startsWith(path)) {
			return paths[path] + sub.slice(path.length);
		}
	}
	if (isWebUrl(sub)) return sub;
	return base + sub;
}

/**
 * @param {string} path
 * @returns {boolean}
 */
function isWebUrl(path) {
	return (
		path.startsWith('blob:') ||
		path.startsWith('http://') ||
		path.startsWith('https://') ||
		path.startsWith('://')
	);
}

/**
 * @typedef PathData
 * @type {Object}
 * @property {string} baseFetch
 * @property {string} baseTarget
 * @property {string} externalTarget
 * @property {Object.<string, string>} paths
 */
