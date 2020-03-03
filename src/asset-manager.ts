import EventBus, {
	AssetFailureEvent,
	CustomAssetFailureEvent,
} from './eventbus/event-bus';
import { ErrorAsset } from './models/error-asset';
import { IAsset } from './store/content';

let webpSupportPromise: Promise<boolean>;

export function isWebPSupported(): Promise<boolean> {
	if (!webpSupportPromise) {
		webpSupportPromise = new Promise((resolve, reject) => {
			const losslessCode =
				'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAQAAAAfQ//73v/+BiOh/AAA=';
			const img = document.createElement('img');
			img.addEventListener('load', () => {
				// tslint:disable-next-line: no-magic-numbers
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

export async function getAAsset(
	asset: IAsset,
	hq: boolean = true
): Promise<HTMLImageElement | ErrorAsset> {
	const url = hq ? asset.hq : asset.lq;

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
export const baseUrl = process.env.BASE_URL === '' ? '.' : process.env.BASE_URL;

export async function getAsset(
	asset: string,
	hq: boolean = true
): Promise<HTMLImageElement | ErrorAsset> {
	if (customAssets[asset]) {
		return customAssets[asset];
	}

	const url = `${baseUrl}/assets/${asset}${hq ? '' : '.lq'}${
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
		img.addEventListener('error', error => {
			EventBus.fire(new CustomAssetFailureEvent(error));
			reject(`Failed to load "${url}"`);
		});
		img.crossOrigin = 'Anonymous';
		img.src = url;
		img.style.display = 'none';
		document.body.appendChild(img);
	});
	return url;
}

export function registerAssetWithURL(
	asset: string,
	url: string
): Promise<HTMLImageElement> {
	return (customAssets[asset] = new Promise((resolve, reject) => {
		const img = new Image();
		img.addEventListener('load', () => {
			resolve(img);
		});
		img.addEventListener('error', error => {
			EventBus.fire(new CustomAssetFailureEvent(error));
			reject(`Failed to load "${url}"`);
		});
		img.crossOrigin = 'Anonymous';
		img.src = url;
		img.style.display = 'none';
		document.body.appendChild(img);
	}));
}
