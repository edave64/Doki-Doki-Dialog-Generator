import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

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
async function scanFolder(folderName) {
	/** @type {IFolder[]} */
	const subFolders = [];
	/** @type {string[]} */
	const subFiles = [];
	const files = await fs.readdir(folderName);

	await Promise.all(
		files.map(async (file) => {
			const stat = await fs.lstat(path.join(folderName, file));

			if (stat.isDirectory()) {
				if (file === 'mask') return;
				subFolders.push(
					await scanFolder(path.join(folderName, file) + '/')
				);
			} else {
				subFiles.push(file);
			}
		})
	);

	return {
		name: folderName,
		files: subFiles,
		subfolders: subFolders,
	};
}

/**
 * @param {IFolder} folder
 * @returns {string[]}
 */
function queueAssetConversions(folder) {
	let ret = [];
	for (const subfolder of folder.subfolders) {
		ret = ret.concat(queueAssetConversions(subfolder));
	}

	const allPNGs = folder.files
		.filter((file) => file.endsWith('.png') && !file.endsWith('.lq.png'))
		.map((file) => file.slice(0, -4));

	const pngsWithoutLQ = allPNGs.filter(
		(png) => !folder.files.includes(png + '.lq.png')
	);
	if (pngsWithoutLQ.length > 0) {
		for (const pngWithoutLQ of pngsWithoutLQ) {
			console.log(pngWithoutLQ);
			ret.push(async () => {
				await runOnConsole(
					`pngquant --ext .lq.tmp.png ${folder.name}/${pngWithoutLQ}.png`
				);
				await runOnConsole(
					`zopflipng ${folder.name}/${pngWithoutLQ}.lq.tmp.png ${folder.name}/${pngWithoutLQ}.lq.png`
				);
				await runOnConsole(
					`rm ${folder.name}/${pngWithoutLQ}.lq.tmp.png`
				);
			});
		}
	}

	const pngsWithoutHQWebp = allPNGs.filter(
		(png) => !folder.files.includes(png + '.webp')
	);
	for (const png of pngsWithoutHQWebp) {
		ret.push(() =>
			runOnConsole(
				`cwebp -lossless ${path.join(folder.name, png)}.png -o ${path.join(
					folder.name,
					png
				)}.webp`
			)
		);
	}

	const pngsWithoutLQWebp = allPNGs.filter(
		(png) => !folder.files.includes(png + '.lq.webp')
	);
	for (const png of pngsWithoutLQWebp) {
		ret.push(() =>
			runOnConsole(
				`cwebp ${path.join(folder.name, png)}.png -o ${path.join(
					folder.name,
					png
				)}.lq.webp`
			)
		);
	}

	return ret;
}

function runOnConsole(command) {
	return new Promise((resolve, reject) => {
		console.log(command);
		exec(command, (error) => {
			if (error) {
				console.error(error);
				reject();
			}
			resolve();
		});
	});
}

/**
 * @param {string[]} queue
 */
async function runner(queue) {
	const next = queue.shift();
	if (!next) return;

	await next();
	runner(queue);
}

async function run() {
	const assetFolder = await scanFolder('./public/assets/');
	const queue = queueAssetConversions(assetFolder);
	console.log(queue);
	for (let i = 0; i < 10; ++i) runner(queue);
}

await run();
