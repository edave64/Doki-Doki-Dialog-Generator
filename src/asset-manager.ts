import EventBus, { AssetFailureEvent, CustomAssetFailureEvent } from "./eventbus/event-bus";
import { ErrorAsset } from "./models/error-asset";
import { IAsset } from "./store/content";
import environment from "./environments/environment";

let webpSupportPromise: Promise<boolean>;
let heifSupportPromise: Promise<boolean>;

export function isWebPSupported(): Promise<boolean> {
	if (!webpSupportPromise) {
		webpSupportPromise = new Promise((resolve, _reject) => {
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

export function isHeifSupported(): Promise<boolean> {
	if (!heifSupportPromise) {
		heifSupportPromise = new Promise((resolve, _reject) => {
			const losslessCode =
				'data:image/heic;base64,AAAAGGZ0eXBoZWljAAAAAG1pZjFoZWljAAAAsW1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAHBpY3QAXABjAGMAcwBsAGEAAAAADnBpdG0AAAAAAAEAAAAQaWxvYwAAAABEQAAAAAAAI2lpbmYAAAAAAAEAAAAVaW5mZQIAAAAAAQAAaHZjMQAAAABDaXBycAAAACdpcGNvAAAAH2h2Y0NmzGx1ci0AAAAAAABv9HP+//v9bjr3AAAAABRpcG1hAAAAAAAAAAEAAQGBAAAACG1kYXQ=';
			const img = document.createElement('img');
			img.addEventListener('load', () => {
				console.log('Heif no error. ' + (img.width === 2 && img.height === 1));
				resolve(img.width === 2 && img.height === 1);
			});
			img.addEventListener('error', () => {
				console.log('Heif not supported');
				resolve(false);
			});
			img.src = losslessCode;
		});
	}
	return heifSupportPromise;
}

const assetCache: {
	[url: string]: Promise<HTMLImageElement | ErrorAsset> | undefined;
} = {};
const customAssets: { [id: string]: Promise<HTMLImageElement> } = {};

export function getAAsset(
	asset: IAsset,
	hq: boolean = true
): Promise<HTMLImageElement | ErrorAsset> {
	return getAssetByUrl(environment.supports.lq && !hq ? asset.lq : asset.hq);
}

export async function getAssetByUrl(
	url: string
): Promise<HTMLImageElement | ErrorAsset> {
	if (!assetCache[url]) {
		assetCache[url] = new Promise((resolve, _reject) => {
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

export const baseUrl = import.meta.env.BASE_URL || '.';

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
	return await getAssetByUrl(url);
}

export function registerAsset(asset: string, file: File): string {
	const url = URL.createObjectURL(file);
	// noinspection JSIgnoredPromiseFromCall
	registerAssetWithURL(asset, url);
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
