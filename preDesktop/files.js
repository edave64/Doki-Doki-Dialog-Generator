const fs = require('fs');
const { promisify } = require('util');
const request = require('request');
const mkdirp = promisify(require('mkdirp'));
const { dirname, join, basename } = require('path');

const lstat = promisify(fs.lstat);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

/**
 * @param {string} sourceUrl
 * @param {string} targetPath
 */
function download(sourceUrl, targetPath) {
	return new Promise(async (resolve, reject) => {
		const query = request(sourceUrl);
		await mkdirp(dirname(targetPath));
		const stream = fs.createWriteStream(targetPath, { flags: 'w' });
		query.pipe(stream);
		stream.on('finish', () => {
			if (query.response.statusCode !== 200) {
				reject(
					`Resource '${url}' could not be loaded. (Responded with code ${query.response.statusCode})`
				);
			} else {
				resolve();
			}
		});
		stream.on('error', (err) => {
			reject(err);
		});
	});
}

/**
 * @param {fs.PathLike} path
 */
async function unlinkRec(path) {
	const stat = await estat(path);
	if (!stat) return;
	if (stat.isDirectory()) {
		await Promise.all(
			(await readdir(path)).map((element) => cleanup(join(path, element)))
		);
	}
	await unlink();
}

/**
 * @param {fs.PathLike} path
 * @returns {Promise<fs.Stats | undefined>}
 * @async
 */
async function estat(path) {
	try {
		return await lstat(path);
	} catch (e) {
		return undefined;
	}
}

function downloadJSON(url) {
	return (json = new Promise((resolve, reject) => {
		request(
			{
				url: url,
				json: true,
			},
			function (error, response, body) {
				if (error) {
					reject(error);
				} else if (response.statusCode === 200) {
					resolve(body); // Print the json response
				} else {
					reject(
						`Resource '${url}' could not be loaded. (Responded with code ${response.statusCode})`
					);
				}
			}
		);
	}));
}

module.exports = { downloadJSON, estat, unlinkRec, download };
