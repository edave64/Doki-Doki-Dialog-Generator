let webpSupportPromise: Promise<boolean>;

export function isWebPSupported(): Promise<boolean> {
	if (!webpSupportPromise) {
		webpSupportPromise = new Promise((resolve, reject) => {
			const losslessCode =
				'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAQAAAAfQ//73v/+BiOh/AAA=';
			const img = document.createElement('img');
			img.addEventListener('load', () => {
				resolve(img.width === 2 && img.height === 1);
			});
			img.addEventListener('error', () => {
				resolve(false);
			});
			img.src = losslessCode;
		});
	}
	return webpSupportPromise;
}

const assetCache: { [url: string]: Promise<HTMLImageElement> } = {};

export async function getAsset(
	asset: string,
	hq: boolean = true
): Promise<HTMLImageElement> {
	const url = `/assets/${asset}${hq ? '' : '.lq'}${
		(await isWebPSupported()) ? '.webp' : '.png'
	}`;

	if (!assetCache[url]) {
		assetCache[url] = new Promise((resolve, reject) => {
			const img = new Image();
			img.addEventListener('load', () => {
				resolve(img);
			});
			img.addEventListener('error', () => {
				reject(`Failed to load "${url}"`);
			});
			img.src = url;
		});
	}

	return assetCache[url];
}

export class Background {
	public readonly path: string;
	public constructor(path: string, public readonly name: string) {
		this.path = '/backgrounds/' + path;
	}
}

export const backgrounds = [
	new Background('club', 'Clubroom'),
	new Background('closet', 'Closet'),
	new Background('corridor', 'Corridor'),
	new Background('class', 'Classroom'),
	new Background('residential', 'Street'),
	new Background('house', 'House'),
	new Background('bedroom', 'Bedroom'),
	new Background('kitchen', 'Kitchen'),
	new Background('sayori_bedroom', "Sayori's bedroom"),
	new Background('club-skill', 'Clubroom with hanging Sayori poster'),
	new Background('bsod', 'Blue screen of death'),
	new Background('unused-house', 'Unused house found in game files'),
	new Background('transparent', 'Transparent'),
];

export const poses = {
	sayori: {
		left: ['sayori/1l', 'sayori/2l', 'sayori/1bl', 'sayori/2bl'],
		right: ['sayori/1r', 'sayori/2r', 'sayori/1br', 'sayori/2br'],
		head: [
			'sayori/a',
			'sayori/b',
			'sayori/c',
			'sayori/d',
			'sayori/e',
			'sayori/f',
			'sayori/g',
			'sayori/h',
			'sayori/i',
			'sayori/j',
			'sayori/k',
			'sayori/l',
			'sayori/m',
			'sayori/n',
			'sayori/o',
			'sayori/p',
			'sayori/q',
			'sayori/r',
			'sayori/s',
			'sayori/t',
			'sayori/u',
			'sayori/v',
			'sayori/w',
			'sayori/x',
			'sayori/y',
		],
	},
	yuri: {
		left: [
			'yuri/1l',
			'yuri/1l',
			'yuri/2l',
			'yuri/1bl',
			'yuri/1bl',
			'yuri/2bl',
			'yuri/3',
			'yuri/3b',
		],
		right: [
			'yuri/1r',
			'yuri/2r',
			'yuri/2r',
			'yuri/1br',
			'yuri/2br',
			'yuri/2br',
			'blank',
			'blank',
		],
		head: [
			'yuri/a',
			'yuri/a2',
			'yuri/b',
			'yuri/b2',
			'yuri/c',
			'yuri/c2',
			'yuri/d',
			'yuri/d2',
			'yuri/e',
			'yuri/e2',
			'yuri/f',
			'yuri/g',
			'yuri/h',
			'yuri/i',
			'yuri/j',
			'yuri/k',
			'yuri/l',
			'yuri/m',
			'yuri/n',
			'yuri/o',
			'yuri/p',
			'yuri/q',
			'yuri/r',
			'yuri/s',
			'yuri/t',
			'yuri/u',
			'yuri/v',
			'yuri/w',
			'yuri/y1',
			'yuri/y2',
			'yuri/y3',
			'yuri/y4',
			'yuri/y5',
			'yuri/y6',
			'yuri/y7',
			'yuri/hisui',
		],
	},
	natsuki: {
		left: ['natsuki/1l', 'natsuki/2l', 'natsuki/1bl', 'natsuki/2bl'],
		right: ['natsuki/1r', 'natsuki/2r', 'natsuki/1br', 'natsuki/2br'],
		head: [
			'natsuki/a',
			'natsuki/b',
			'natsuki/c',
			'natsuki/d',
			'natsuki/e',
			'natsuki/f',
			'natsuki/g',
			'natsuki/h',
			'natsuki/i',
			'natsuki/j',
			'natsuki/k',
			'natsuki/l',
			'natsuki/m',
			'natsuki/n',
			'natsuki/o',
			'natsuki/p',
			'natsuki/q',
			'natsuki/r',
			'natsuki/s',
			'natsuki/t',
			'natsuki/u',
			'natsuki/v',
			'natsuki/w',
			'natsuki/x',
			'natsuki/y',
			'natsuki/z',
			'natsuki/1t',
			'natsuki/scream',
			'natsuki/2t',
			'natsuki/2ta',
			'natsuki/2tb',
			'natsuki/2tc',
			'natsuki/2td',
			'natsuki/2te',
			'natsuki/2tf',
			'natsuki/2tg',
			'natsuki/2th',
			'natsuki/2ti',
			'natsuki/2bta',
			'natsuki/2btb',
			'natsuki/2btc',
			'natsuki/2btd',
			'natsuki/2bte',
			'natsuki/2btf',
			'natsuki/2btg',
			'natsuki/2bth',
			'natsuki/2bti',
			'natsuki/corrupt',
			'natsuki/crying',
		],
	},
	monika: {
		left: ['monika/1l', 'monika/2l'],
		right: ['monika/1r', 'monika/2r'],
		head: [
			'monika/a',
			'monika/b',
			'monika/c',
			'monika/d',
			'monika/e',
			'monika/f',
			'monika/g',
			'monika/h',
			'monika/i',
			'monika/j',
			'monika/k',
			'monika/l',
			'monika/m',
			'monika/n',
			'monika/o',
			'monika/p',
			'monika/q',
			'monika/r',
		],
	},
};
