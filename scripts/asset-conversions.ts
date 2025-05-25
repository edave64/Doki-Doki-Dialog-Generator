import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const webp = {
	type: 'none' as 'none' | 'cwebp' | 'ffmpeg',
	location: '',
};

const pngOptimizer = {
	type: 'zopflipng' as 'none' | 'zopflipng' | 'oxipng',
	location: '',
};

const pngQuantizer = {
	type: 'pngquant' as 'none' | 'pngquant',
	location: '',
};

async function run() {
	await runDetection();
	// const assetFolder = await scanFolder('./public/assets/');
	// const queue = queueAssetConversions(assetFolder);
	// for (let i = 0; i < 10; ++i) runner(queue);
}

async function runDetection() {
	console.log('Detecting available tools');
	console.log('=========================');
	await detectWebP();
	await detectOptimizer();
	await detectQuantizer();
}

async function detectWebP() {
	const outParam = { command: '' };
	if (await detectTool('cwebp', ' -version', outParam)) {
		webp.type = 'cwebp';
		webp.location = outParam.command;
		console.log(`[ OK ] WebP: cwebp installed (${outParam.command})`);
		return;
	}
	if (
		await detectTool(
			'ffmpeg',
			' -h encoder=libwebp',
			outParam,
			(stdout) => !stdout.includes('not recognized')
		)
	) {
		webp.type = 'ffmpeg';
		webp.location = outParam.command;
		console.log(`[ OK ] WebP: ffmpeg installed (${outParam.command})`);
		return;
	}
	console.log(
		'[SKIP] WebP: none - To enable WebP, install either cwebp or ffmpeg (Or place portable versions in this folder).'
	);
}

async function detectOptimizer() {
	const outParam = { command: '' };
	if (await detectTool('zopflipng', ' -h', outParam)) {
		pngOptimizer.type = 'zopflipng';
		pngOptimizer.location = outParam.command;
		console.log(
			`[ OK ] PNG optimizer: zopflipng found (${outParam.command})`
		);
		return;
	}
	if (await detectTool('oxipng', ' -h', outParam)) {
		pngOptimizer.type = 'oxipng';
		pngOptimizer.location = outParam.command;
		console.log(`[ OK ] PNG optimizer: oxipng found (${outParam.command})`);
		return;
	}
	console.log(
		'[SKIP] PNG optimizer: none - To improve PNG compression, install either zopflipng or oxipng (Or place portable versions in this folder).'
	);
}

async function detectQuantizer() {
	const outParam = { command: '' };
	if (await detectTool('pngquant', ' -h', outParam)) {
		pngQuantizer.type = 'pngquant';
		pngQuantizer.location = outParam.command;
		console.log(
			`[ OK ] PNG quantizer: pngquant found (${outParam.command})`
		);
		return;
	}
	console.log(
		'[SKIP] PNG quantizer: none - To allow lower quality PNGs, install pngquant (Or place portable versions in this folder).'
	);
}

async function detectTool(
	baseCommand: string,
	detectCommand: string,
	outParam: { command: string },
	tester?: (stdout: string) => boolean
): Promise<boolean> {
	try {
		const ret = await runOnConsole(baseCommand + detectCommand);
		if (tester && !tester(ret)) throw new Error();
		outParam.command = baseCommand;
		return true;
	} catch {}
	try {
		const ret = await runOnConsole('./' + baseCommand + detectCommand);
		if (tester && !tester(ret)) throw new Error();
		outParam.command = './' + baseCommand;
		return true;
	} catch {}
	return false;
}

type IFolder = {
	name: string;
	subfolders: IFolder[];
	files: string[];
};

async function scanFolder(folderName: string): Promise<IFolder> {
	const subFolders = [] as IFolder[];
	const subFiles = [] as string[];
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

function queueAssetConversions(folder: IFolder): (() => Promise<void>)[] {
	let ret = [] as (() => Promise<void>)[];
	for (const subfolder of folder.subfolders) {
		ret = ret.concat(queueAssetConversions(subfolder));
	}

	const allPNGs = folder.files
		.filter((file) => file.endsWith('.png') && !file.endsWith('.lq.png'))
		.map((file) => file.slice(0, -4));

	if (pngQuantizer.type !== 'none') {
		const pngsWithoutLQ = allPNGs.filter(
			(png) => !folder.files.includes(png + '.lq.png')
		);
		if (pngsWithoutLQ.length > 0) {
			for (const pngWithoutLQ of pngsWithoutLQ) {
				console.log(pngWithoutLQ);
				ret.push(async () => {
					const inFile = `${folder.name}/${pngWithoutLQ}.png`;
					const outFile = `${folder.name}/${pngWithoutLQ}.lq.png`;
					if (pngOptimizer.type !== 'none') {
						const tempFile = `${folder.name}/${pngWithoutLQ}.lq.tmp.png`;
						await runPngQuantizer(inFile, tempFile);
						await runPngOptimizer(tempFile, outFile);
						await runOnConsole(`rm ${tempFile}`);
					} else {
						await runPngQuantizer(inFile, outFile);
					}
				});
			}
		}
	}

	if (webp.type !== 'none') {
		const pngsWithoutHQWebp = allPNGs.filter(
			(png) => !folder.files.includes(png + '.webp')
		);
		for (const png of pngsWithoutHQWebp) {
			const inFile = `${path.join(folder.name, png)}.png`;
			const outFile = `${path.join(folder.name, png)}.webp`;
			ret.push(async () => {
				await runWebp(inFile, outFile, true);
			});
		}

		const pngsWithoutLQWebp = allPNGs.filter(
			(png) => !folder.files.includes(png + '.lq.webp')
		);
		for (const png of pngsWithoutLQWebp) {
			const inFile = `${path.join(folder.name, png)}.png`;
			const outFile = `${path.join(folder.name, png)}.lq.webp`;
			ret.push(async () => {
				await runWebp(inFile, outFile, false);
			});
		}
	}

	return ret;
}

async function runPngQuantizer(inFile: string, outFile: string): Promise<void> {
	if (pngQuantizer.type === 'pngquant') {
		await runOnConsole(`pngquant -o ${outFile} ${inFile}`);
	} else {
		throw new Error('Not png quantizer');
	}
}

async function runWebp(
	inFile: string,
	outFile: string,
	lossless: boolean
): Promise<void> {
	if (webp.type === 'cwebp') {
		if (lossless) {
			await runOnConsole(`cwebp -lossless ${inFile} -o ${outFile}`);
		} else {
			await runOnConsole(`cwebp ${inFile} -o ${outFile}`);
		}
	} else if (webp.type === 'ffmpeg') {
		if (lossless) {
			await runOnConsole(
				`ffmpeg -i ${inFile} -c:v libwebp -lossless -q 100 -preset default -loop 0 -an -sn -dn -f webp -`
			);
		} else {
			await runOnConsole(
				`ffmpeg -i ${inFile} -c:v libwebp -q 75 -preset default -loop 0 -an -sn -dn -f webp -`
			);
		}
	} else {
		throw new Error('Not webp');
	}
}

async function runPngOptimizer(inFile: string, outFile: string): Promise<void> {
	if (pngOptimizer.type === 'zopflipng') {
		await runOnConsole(`zopflipng ${inFile} ${outFile}`);
	} else if (pngOptimizer.type === 'oxipng') {
		await runOnConsole(`oxipng -o ${outFile} ${inFile}`);
	}
}

function runOnConsole(command: string): Promise<string> {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout) => {
			if (error) {
				//console.error(error);
				reject();
			}
			resolve(stdout);
		});
	});
}

async function runner(queue: (() => Promise<void>)[]) {
	const next = queue.shift();
	if (!next) return;

	await next();
	runner(queue);
}

await run();
