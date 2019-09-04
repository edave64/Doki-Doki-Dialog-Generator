import { Background, transparent, color } from './models/background';
import Sayori from './characters/sayori.json';
import Yuri from './characters/yuri.json';
import Monika from './characters/monika.json';
import Natsuki from './characters/natsuki.json';
import FeMC from './characters/femc.json';
import MC from './characters/mc.json';
import MCChad from './characters/mc_chad.json';
import MCClassic from './characters/mc_classic.json';
import Amy from './characters/amy.json';
import AmyClassic from './characters/amy_classic.json';
import { VariantBackground } from './models/variant-background';

export const characterOrder = ([
	Monika,
	Natsuki,
	Sayori,
	Yuri,
	FeMC,
	MC,
	MCChad,
	MCClassic,
	Amy,
	AmyClassic,
] as any) as Array<ICharacter<any>>;

export const characters: { [name: string]: ICharacter<any> } = {
	[Sayori.id]: Sayori as any,
	[Yuri.id]: Yuri as any,
	[Natsuki.id]: Natsuki as any,
	[Monika.id]: Monika as any,
	[FeMC.id]: FeMC as any,
	[MC.id]: MC as any,
	[MCChad.id]: MCChad as any,
	[MCClassic.id]: MCClassic as any,
	[Amy.id]: Amy as any,
	[AmyClassic.id]: AmyClassic as any,
};

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
const customAssets: { [id: string]: Promise<HTMLImageElement> } = {};

export async function getAsset(
	asset: string,
	hq: boolean = true
): Promise<HTMLImageElement> {
	if (customAssets[asset]) {
		return customAssets[asset];
	}

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

export function registerAsset(asset: string, file: File): string {
	const url = URL.createObjectURL(file);
	customAssets[asset] = new Promise((resolve, reject) => {
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
	return url;
}

export const backgrounds = [
	new VariantBackground('Clubroom', '/backgrounds/', [
		['club'],
		['club-skill'],
	]),
	new Background('closet', 'Closet'),
	new Background('corridor', 'Corridor'),
	new Background('class', 'Classroom'),
	new Background('residential', 'Street'),
	new Background('house', 'House'),
	new Background('bedroom', 'Bedroom'),
	new Background('kitchen', 'Kitchen'),
	new Background('sayori_bedroom', "Sayori's bedroom"),
	new Background('bsod', 'Blue screen of death'),
	new Background('unused-house', 'Unused house found in game files'),
	new VariantBackground('Natsuki reading manga', '/cg/natsuki_1/', [
		['n_cg1_bg'],
		['n_cg1_bg', 'n_cg1_base'],
		['n_cg1_bg', 'n_cg1_base', 'n_cg1_exp1'],
		['n_cg1_bg', 'n_cg1_base', 'n_cg1_exp2'],
		['n_cg1_bg', 'n_cg1_base', 'n_cg1_exp3'],
		['n_cg1_bg', 'n_cg1_base', 'n_cg1_exp4'],
		['n_cg1_bg', 'n_cg1_base', 'n_cg1_exp5'],
	]),
	new VariantBackground('Natsuki in the closet', '/cg/natsuki_2/', [
		['n_cg2_bg'],
		['n_cg2_bg', 'n_cg2_base'],
		['n_cg2_bg', 'n_cg2_base', 'n_cg2_exp1'],
		['n_cg2_bg', 'n_cg2_base', 'n_cg2_exp2'],
	]),
	new VariantBackground('Natsuki against the wall', '/cg/natsuki_3/', [
		['n_cg3_base'],
		['n_cg3_base', 'n_cg3_exp1'],
		['n_cg3_base', 'n_cg3_exp2'],
		['n_cg3_base', 'n_cg3_cake'],
		['n_cg3_base', 'n_cg3_exp1', 'n_cg3_cake'],
		['n_cg3_base', 'n_cg3_exp2', 'n_cg3_cake'],
	]),
	color,
	transparent,
];

export interface IHeads {
	folder?: string;
	all: string[];
}

export interface Heads {
	[id: string]: IHeads | string[];
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

export type Pose<H extends Heads> = IStaticPose<H> | ITwoSidedPose<H>;

export interface ICharacter<H extends Heads> {
	id: string;
	internalId: string;
	name: string;
	folder?: string;
	heads: H;
	poses: Array<Pose<H>>;
}
