import EventBus, {
	AssetFailureEvent,
	CustomAssetFailureEvent,
} from './eventbus/event-bus';
import { ErrorAsset } from './render-utils/assets/error-asset';
import { IAssetSwitch } from './store/content';
import environment from './environments/environment';
import { IAsset } from './render-utils/assets/asset';
import { ImageAsset } from './render-utils/assets/image-asset';

let webpSupportPromise: Promise<boolean> | undefined;

/**
 * True if the browser supports WebP
 */
export function isWebPSupported(): Promise<boolean> {
	if (webpSupportPromise) return webpSupportPromise;
	if (!environment.supports.allowWebP) {
		return Promise.resolve(false);
	}
		const losslessCode =
			'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAQAAAAfQ//73v/+BiOh/AAA=';
	// Safari claims to support webp, but fails to load some of them. This is one such example.
	const transparentCode =
		'data:image/webp;base64,UklGRogAAABXRUJQVlA4THwAAAAv/8SzAA/wGbPPmH3GbP7jAQSSNu9f+rzDwYj+G23bpt3Gx3xD8353j73f5b87+e9OALmT/+7kvzv5704CuJP/7uS/O/nvTgK4k//u5L87+e9OAriT/+7kvzv5704CuJP/7uS/O/nvTgK4k//u5L87+e9O/rsTwe7kvzsL';
	return (webpSupportPromise = (async () => {
		const ret = await Promise.all([
			canLoadImg(losslessCode, 1, 2),
			canLoadImg(transparentCode, 720, 1280),
		]);
		return ret[0] && ret[1];
	})());
}

function canLoadImg(
	url: string,
	height: number,
	width: number
): Promise<boolean> {
	return new Promise((resolve, _reject) => {
		const img = document.createElement('img');
		img.addEventListener('load', () => {
			resolve(img.width === 2 && img.height === 1);
		});
		img.addEventListener('error', () => {
			resolve(false);
		});
		img.src = url;
	});
}

let heifSupportPromise: Promise<boolean> | undefined;

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

class AssetCache {
	private cache = new Map<string, Promise<IAsset>>();
	get(url: string) {
		const lookup = this.cache.get(url);
		if (lookup) return lookup;
		const promise = imagePromise(url);
		this.cache.set(url, promise);
		return promise;
	}

	remove(url: string) {
		this.cache.delete(url);
	}
}

class TmpAssetCache {
	private cache = new Map<string, WeakRef<Promise<IAsset>>>();
	get(url: string) {
		const lookup = this.cache.get(url)?.deref();
		if (lookup) return lookup;
		const promise = requestAssetByUrl(url);
		this.cache.set(url, new WeakRef(promise));
		return promise;
	}

	remove(url: string) {
		this.cache.delete(url);
	}
}

let assetCache: AssetCache | TmpAssetCache | null = null;

function getAssetCache(): AssetCache | TmpAssetCache {
	if (assetCache) return assetCache;
	return ((window as any).assetCache = assetCache =
		environment.supports.assetCaching && typeof WeakRef !== 'undefined'
			? new AssetCache()
			: new TmpAssetCache());
}

const customAssets: { [id: string]: Promise<IAsset> | undefined } = {};

export function getAAsset(
	asset: IAssetSwitch,
	hq: boolean = true
): Promise<IAsset> {
	return getAssetByUrl(environment.supports.lq && !hq ? asset.lq : asset.hq);
}

export function getAssetByUrl(url: string): Promise<IAsset> {
	return customAssets[url] || getAssetCache().get(url);
}

export const baseUrl = (import.meta as any).env.BASE_URL || '.';

export async function getBuildInAsset(
	asset: string,
	hq: boolean = true
): Promise<IAsset> {
	const url = `${baseUrl}/assets/${asset}${hq ? '' : '.lq'}${
		(await isWebPSupported()) ? '.webp' : '.png'
	}`.replace(/\/+/, '/');
	return await getAssetCache().get(url);
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

async function requestAssetByUrl(url: string): Promise<IAsset> {
	return (async (): Promise<IAsset> => {
		try {
			return await imagePromise(url);
		} catch (e) {
			// Webp files sometimes fail to load on safari. Fallback to png
			if (url.endsWith('.webp')) {
				try {
					return await imagePromise(url.replace(/\.webp$/, '.png'));
				} catch (e) {
					EventBus.fire(new AssetFailureEvent(url));
					getAssetCache().remove(url);
					return new ErrorAsset();
				}
			} else {
				EventBus.fire(new AssetFailureEvent(url));
				getAssetCache().remove(url);
				return new ErrorAsset();
			}
		}
	})();
}

function imagePromise(url: string): Promise<ImageAsset> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.addEventListener('load', () => {
			resolve(new ImageAsset(img));
			if (!environment.supports.assetCaching) {
				document.body.removeChild(img);
			}
		});
		img.addEventListener('error', (e) => {
			reject(e);
			if (!environment.supports.assetCaching) {
				document.body.removeChild(img);
			}
		});
		img.crossOrigin = 'Anonymous';
		img.src = url;
		img.style.display = 'none';
		document.body.appendChild(img);
	});
}
