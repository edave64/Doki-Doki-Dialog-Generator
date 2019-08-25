import { GirlName } from './models/girl';
import { Background, transparent } from './models/background';

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
	const url = `${process.env.BASE_URL}/assets/${asset}${hq ? '' : '.lq'}${
		(await isWebPSupported()) ? '.webp' : '.png'
	}`.replace(/\/+/, '/');

	if (!assetCache[url]) {
		assetCache[url] = new Promise((resolve, reject) => {
			const img = new Image();
			img.addEventListener('load', () => {
				resolve(img);
			});
			img.addEventListener('error', () => {
				reject(`Failed to load "${url}"`);
			});
			img.crossOrigin = 'Anonymous';
			img.src = url;
			img.style.display = 'none';
			document.body.appendChild(img);
		});
	}

	return assetCache[url];
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
	transparent,
];

export const dokis: { [name: string]: IDoki<any> } = {};
function addDoki<T extends DokiHeads>(name: GirlName, doki: IDoki<T>) {
	dokis[name] = doki;
}

addDoki('sayori', {
	name: 'Sayori',
	folder: 'sayori',
	heads: {
		straight: [
			'a',
			'b',
			'c',
			'd',
			'e',
			'f',
			'g',
			'h',
			'i',
			'j',
			'k',
			'l',
			'm',
			'n',
			'o',
			'p',
			'q',
			'r',
			's',
			't',
			'u',
			'v',
			'w',
			'x',
			'y',
		],
		sideways: ['a2', 'b2', 'c2', 'd2'],
	},
	poses: [
		{
			compatibleHeads: ['straight'],
			left: ['1l', '2l'],
			right: ['1r', '2r'],
		},
		{
			compatibleHeads: ['sideways'],
			static: '3',
		},
		{
			compatibleHeads: ['straight'],
			left: ['1bl', '2bl'],
			right: ['1br', '2br'],
		},
	],
});
addDoki('yuri', {
	name: 'Yuri',
	folder: 'yuri',
	heads: {
		straight: [
			'a',
			'b',
			'c',
			'd',
			'e',
			'f',
			'g',
			'h',
			'i',
			'j',
			'k',
			'l',
			'm',
			'n',
			'o',
			'p',
			'q',
			'r',
			's',
			't',
			'u',
			'v',
			'w',
			'y1',
			'y2',
			'y3',
			'y4',
			'y5',
			'y6',
			'y7',
			'hisui',
		],
		sideways: ['a2', 'b2', 'c2', 'd2', 'e2'],
	},
	poses: [
		{
			compatibleHeads: ['straight'],
			left: ['1l', '2l'],
			right: ['1r', '2r'],
		},
		{
			compatibleHeads: ['sideways'],
			static: '3',
		},
		{
			compatibleHeads: ['straight'],
			left: ['1bl', '2bl'],
			right: ['1br', '2br'],
		},
		{
			compatibleHeads: ['sideways'],
			static: '3b',
		},
	],
});
addDoki('natsuki', {
	name: 'Natsuki',
	folder: 'natsuki',
	heads: {
		straight: [
			'a',
			'b',
			'c',
			'd',
			'e',
			'f',
			'g',
			'h',
			'i',
			'j',
			'k',
			'l',
			'm',
			'n',
			'o',
			'p',
			'q',
			'r',
			's',
			't',
			'u',
			'v',
			'w',
			'x',
			'y',
			'z',
			'1t',
			'scream',
			'corrupt',
			'crying',
		],
		sideways: [
			'2t',
			'2ta',
			'2tb',
			'2tc',
			'2td',
			'2te',
			'2tf',
			'2tg',
			'2th',
			'2ti',
		],
		sidewaysCasuals: [
			'2bta',
			'2btb',
			'2btc',
			'2btd',
			'2bte',
			'2btf',
			'2btg',
			'2bth',
			'2bti',
		],
	},
	poses: [
		{
			compatibleHeads: ['straight', 'sideways'],
			headInForeground: true,
			left: ['1l', '2l'],
			right: ['1r', '2r'],
		},
		{
			compatibleHeads: ['straight'],
			headAnchor: [18, 22],
			static: '3',
		},
		{
			compatibleHeads: ['straight', 'sidewaysCasuals'],
			headInForeground: true,
			left: ['1bl', '2bl'],
			right: ['1br', '2br'],
		},
		{
			compatibleHeads: ['straight'],
			headAnchor: [18, 22],
			static: '3b',
		},
	],
});
addDoki('monika', {
	name: 'Monika',
	folder: 'monika',
	heads: {
		straight: [
			'a',
			'b',
			'c',
			'd',
			'e',
			'f',
			'g',
			'h',
			'i',
			'j',
			'k',
			'l',
			'm',
			'n',
			'o',
			'p',
			'q',
			'r',
		],
		sideways: ['a2', 'b2'],
	},
	poses: [
		{
			compatibleHeads: ['straight'],
			left: ['1l', '2l'],
			right: ['1r', '2r'],
		},
		{
			compatibleHeads: ['sideways'],
			static: '3',
		},
	],
});
export interface IDokiHeads {
	folder?: string;
	all: string[];
}

export interface DokiHeads {
	[id: string]: IDokiHeads | string[];
}

interface IPose<H> {
	compatibleHeads: Array<keyof H>;
	headInForeground?: boolean;
	folder?: string;
	headAnchor?: [number, number];
}

interface IStaticPose<H> extends IPose<H> {
	static: string;
}

interface ITwoSidedPose<H> extends IPose<H> {
	left: string[];
	right: string[];
}

export type Pose<H extends DokiHeads> = IStaticPose<H> | ITwoSidedPose<H>;

export interface IDoki<H extends DokiHeads> {
	name: string;
	folder?: string;
	heads: H;
	poses: Array<Pose<H>>;
}
