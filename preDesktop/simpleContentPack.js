const fs = require('fs');
const { promisify } = require('util');
const { extname, join } = require('path');
const { characterPath } = require('./constants');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function simpleContentPack(req, res) {
	// simple character fallback
	const readdir = promisify(fs.readdir);
	const stat = promisify(fs.stat);
	const folderName = req.params.folder;
	const id = folderName.startsWith('.') ? folderName.slice(1) : folderName;
	if (id.includes('/') || id.includes('\\') || id === '..' || id === '.') {
		throw new Error(
			'Protection error: queued activate contains a restricted characters!'
		);
	}
	const folder = join(characterPath, folderName);
	const content = await readdir(folder);
	content.sort();
	const entries = await Promise.all(
		content.map(async name => ({ name, stat: await stat(join(folder, name)) }))
	);

	/** @type {Object.<string,{lefts: string[], rights: string[], joins: string[]}>} */
	const styles = {};
	const heads = [];

	let chibi;
	let firstHead;
	let firstPose;

	for (const entry of entries) {
		const name = entry.name;
		const stat = entry.stat;
		if (stat.isDirectory()) continue;
		if (
			!['.webp', '.png', '.svg', '.bmp', '.jpeg', '.jpg', '.gif'].includes(
				extname(name)
			)
		) {
			continue;
		}

		const basename = name.slice(0, -extname(name).length);
		if (basename.toLowerCase() === 'chibi') {
			chibi = name;
			continue;
		}

		if (basename[0].match(/[0-9]/)) {
			if (!firstPose) firstPose = name;
			const unnumbered = basename.replace(/^[0-9]+/, '');
			const last = basename[basename.length - 1];
			let style;
			let side;
			if (last === 'l') {
				style = unnumbered.slice(0, -1);
				side = 'lefts';
			} else if (last === 'r') {
				style = unnumbered.slice(0, -1);
				side = 'rights';
			} else {
				style = unnumbered;
				side = 'joins';
			}
			getStyle(styles, style)[side].push(name);
		} else {
			if (!firstHead) firstHead = name;
			heads.push(name);
		}
	}

	const poses = Object.keys(styles)
		.sort()
		.map(styleKey => {
			const style = styles[styleKey];
			const ret = [];
			if (style.lefts.length > 0 || style.rights.length > 0) {
				ret.push({
					name: styleKey + '-joined',
					style: styleKey,
					compatibleHeads: ['general'],
					left: style.lefts,
					right: style.rights,
				});
			}
			for (const join of style.joins) {
				ret.push({
					name: styleKey + '-joined-' + join,
					style: styleKey,
					compatibleHeads: ['general'],
					static: join,
				});
			}
			return ret;
		});

	const json = {
		id,
		packId: id,
		packCredits: '',
		name: id,
		internalId: id,
		chibi: chibi || firstHead || firstPose,
		folder: './',
		styles: Object.keys(styles)
			.sort()
			.map(style => ({
				name: style,
				label: style,
			})),
		heads: {
			general: heads,
		},
		poses: poses.reduce((acc, x) => acc.concat(x), []),
	};

	res.contentType('json');
	res.send(JSON.stringify(json));
}

/**
 * @param {Object.<string,{lefts: string[], rights: string[], joins: string[]}>} styles
 * @param {string} style
 * @returns {{lefts: string[], rights: string[], joins: string[]}}
 */
function getStyle(styles, style) {
	if (!styles[style]) {
		styles[style] = {
			lefts: [],
			rights: [],
			joins: [],
		};
	}
	return styles[style];
}

module.exports = simpleContentPack;
