import {
	Background,
	transparent,
	color,
	IBackground,
} from './models/background';
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
import EventBus, { AssetFailureEvent } from './event-bus';
import { ErrorAsset } from './models/error-asset';

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

const assetCache: {
	[url: string]: Promise<HTMLImageElement | ErrorAsset> | undefined;
} = {};
const customAssets: { [id: string]: Promise<HTMLImageElement> } = {};

export async function getAsset(
	asset: string,
	hq: boolean = true
): Promise<HTMLImageElement | ErrorAsset> {
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
				EventBus.fire(new AssetFailureEvent(url));
				assetCache[url] = undefined;
				resolve(new ErrorAsset());
			});
			img.crossOrigin = 'Anonymous';
			img.src = url;
			img.style.display = 'none';
			document.body.appendChild(img);
		});
	}

	return assetCache[url]!;
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

export const backgrounds: IBackground[] = [
	new VariantBackground('Clubroom', '/backgrounds/', [
		['club'],
		{
			nsfw: true,
			images: ['club-skill'],
		},
	]),
	new Background('closet', 'Closet'),
	new Background('corridor', 'Corridor'),
	new Background('class', 'Classroom'),
	new Background('residential', 'Street'),
	new Background('house', 'House'),
	new Background('bedroom', 'Bedroom'),
	new Background('kitchen', 'Kitchen'),
	new VariantBackground("Sayori's bedroom", '', [
		['/backgrounds/sayori_bedroom'],
		['/cg/sayori_kill/s_kill_bg'],
		['/cg/sayori_kill/s_kill_bg2'],
	]),
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
	new Background('../cg/sayori_1/s_cg1', 'Sayori dressing'),
	new VariantBackground('Sayori bumped head', '/cg/sayori_2/', [
		['s_cg2_base1'],
		['s_cg2_base1', 's_cg2_exp1'],
		['s_cg2_base1', 's_cg2_exp2'],
		['s_cg2_base1', 's_cg2_exp3'],
		['s_cg2_base1', 's_cg2_exp1', 's_cg2_exp3'],
		['s_cg2_base1', 's_cg2_exp2', 's_cg2_exp3'],
		['s_cg2_base2'],
		['s_cg2_base2', 's_cg2_exp1'],
		['s_cg2_base2', 's_cg2_exp2'],
		['s_cg2_base2', 's_cg2_exp3'],
		['s_cg2_base2', 's_cg2_exp1', 's_cg2_exp3'],
		['s_cg2_base2', 's_cg2_exp2', 's_cg2_exp3'],
	]),
	new Background('../cg/sayori_3/s_cg3', 'Sayori hug'),
	new VariantBackground('Yuri reading', '/cg/yuri_1/', [
		['y_cg1_base'],
		['y_cg1_base', 'y_cg1_exp2'],
		['y_cg1_base', 'y_cg1_exp1'],
		['y_cg1_base', 'y_cg1_exp1', 'y_cg1_exp2'],
		['y_cg1_base', 'y_cg1_exp3'],
	]),
	new VariantBackground('Yuri against the wall', '/cg/yuri_2/', [
		['y_cg2_bg1'],
		['y_cg2_bg1', 'y_cg2_base', 'y_cg2_nochoc'],
		['y_cg2_bg1', 'y_cg2_base', 'y_cg2_exp2', 'y_cg2_nochoc'],
		['y_cg2_bg1', 'y_cg2_base', 'y_cg2_exp3', 'y_cg2_nochoc'],
		['y_cg2_bg1', 'y_cg2_base'],
		['y_cg2_bg1', 'y_cg2_base', 'y_cg2_exp2'],
		['y_cg2_bg1', 'y_cg2_base', 'y_cg2_exp3'],
		['y_cg2_bg2'],
		['y_cg2_bg2', 'y_cg2_base', 'y_cg2_nochoc'],
		['y_cg2_bg2', 'y_cg2_base', 'y_cg2_exp2', 'y_cg2_nochoc'],
		['y_cg2_bg2', 'y_cg2_base', 'y_cg2_exp3', 'y_cg2_nochoc'],
		['y_cg2_bg2', 'y_cg2_base'],
		['y_cg2_bg2', 'y_cg2_base', 'y_cg2_exp2'],
		['y_cg2_bg2', 'y_cg2_base', 'y_cg2_exp3'],
	]),
	new VariantBackground('Yuri with towel', '/cg/yuri_3/', [
		['y_cg3_base'],
		['y_cg3_base', 'y_cg3_exp1'],
	]),
	new VariantBackground(
		"Yuri's death",
		'/cg/yuri_kill/',
		[['1a'], ['1b'], ['1c'], ['2a'], ['2b'], ['2c'], ['3a'], ['3b'], ['3c']],
		true
	),
	new VariantBackground('The spaceroom', '/cg/monika/', [
		['monika_room'],
		['monika_room_highlight'],
		['monika_bg'],
		['monika_bg_highlight'],
		['room'],
		['monika_bg_glitch'],
		['monika_bg_glitch', 'monika_glitch1'],
		['monika_bg_glitch', 'monika_glitch2'],
		['monika_bg_glitch', 'monika_glitch3'],
		['monika_bg_glitch', 'monika_glitch4'],
		['monika_scare'],
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
	nsfw?: boolean;
	headAnchor?: [number, number];
}

interface IStaticPose<H> extends IPose<H> {
	static: string;
}

interface IVariantPose<H> extends IPose<H> {
	variant: string[];
}

interface ITwoSidedPose<H> extends IPose<H> {
	left: string[];
	right: string[];
}

export type Pose<H extends Heads> =
	| IStaticPose<H>
	| IVariantPose<H>
	| ITwoSidedPose<H>;

export interface ICharacter<H extends Heads> {
	id: string;
	internalId: string;
	name: string;
	folder?: string;
	nsfw?: boolean;
	heads: H;
	poses: Array<Pose<H>>;
}
