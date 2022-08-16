import EventBus, {
	AssetFailureEvent,
	CustomAssetFailureEvent,
} from './eventbus/event-bus';
import { ErrorAsset } from './render-utils/assets/error-asset';
import { IAssetSwitch } from './store/content';
import environment from './environments/environment';
import { IAsset } from './render-utils/assets/asset';
import { ImageAsset } from './render-utils/assets/image-asset';

let webpSupportPromise: Promise<boolean>;

/**
 * True if the browser supports WebP
 */
export function isWebPSupported(): Promise<boolean> {
	if (webpSupportPromise) return webpSupportPromise;
	return (webpSupportPromise = new Promise((resolve, _reject) => {
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
	}));
}

let heifSupportPromise: Promise<boolean>;

/**
 * True if the browser supports HEIF.
 */
export function isHeifSupported(): Promise<boolean> {
	if (heifSupportPromise) return heifSupportPromise;
	return (heifSupportPromise = new Promise((resolve, _reject) => {
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
	}));
}

const assetCache: {
	[url: string]: Promise<IAsset> | undefined;
} = {};
const customAssets: { [id: string]: Promise<IAsset> | undefined } = {};

export function getAAsset(
	asset: IAssetSwitch,
	hq: boolean = true
): Promise<IAsset> {
	return getAssetByUrl(environment.supports.lq && !hq ? asset.lq : asset.hq);
}

export async function getAssetByUrl(url: string): Promise<IAsset> {
	if (assetCache[url]) return assetCache[url]!;
	return (assetCache[url] = (async (): Promise<IAsset> => {
		try {
			return await imagePromise(url);
		} catch (e) {
			// Webp files sometimes fail to load on safari. Fallback to png
			if (url.endsWith('.webp')) {
				try {
					return await imagePromise(url.replace(/\.webp$/, '.png'));
				} catch (e) {
					EventBus.fire(new AssetFailureEvent(url));
					assetCache[url] = undefined;
					return new ErrorAsset();
				}
			} else {
				EventBus.fire(new AssetFailureEvent(url));
				assetCache[url] = undefined;
				return new ErrorAsset();
			}
		}
	})());
}

export const baseUrl = (import.meta as any).env.BASE_URL || '.';

export async function getAsset(
	asset: string,
	hq: boolean = true
): Promise<IAsset> {
	if (customAssets[asset]) return customAssets[asset]!;

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
): Promise<IAsset> {
	return (customAssets[asset] = new Promise((resolve, reject) => {
		const img = new Image();
		img.addEventListener('load', () => {
			resolve(new ImageAsset(img));
		});
		img.addEventListener('error', (error) => {
			EventBus.fire(new CustomAssetFailureEvent(error));
			reject(`Failed to load "${url}"`);
		});
		img.crossOrigin = 'Anonymous';
		img.src = url;
		img.style.display = 'none';
		if (environment.supports.assetCaching) {
			document.body.appendChild(img);
		} else {
			customAssets[asset] = undefined;
		}
	}));
}

function imagePromise(url: string): Promise<ImageAsset> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.addEventListener('load', () => {
			resolve(new ImageAsset(img));
		});
		img.addEventListener('error', (e) => {
			reject(e);
		});
		img.crossOrigin = 'Anonymous';
		img.src = url;
		img.style.display = 'none';
		document.body.appendChild(img);
	});
}
