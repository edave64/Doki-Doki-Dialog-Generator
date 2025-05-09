/**
 * Loads assets from urls for use in canvas painting, keeps them cached, and loads webP images if supported.
 */

import { allowLq, allowWebP, assetUrl } from './config';
import environment from './environments/environment';
import EventBus, { AssetFailureEvent } from './eventbus/event-bus';
import type { IAsset } from './render-utils/assets/asset';
import { ErrorAsset } from './render-utils/assets/error-asset';
import { ImageAsset } from './render-utils/assets/image-asset';
import type { IAssetSwitch } from './store/content';

let webpSupportPromise: Promise<boolean> | undefined;

/**
 * True if the browser supports WebP
 */
export function isWebPSupported(): Promise<boolean> {
	if (webpSupportPromise) return webpSupportPromise;
	if (!environment.supports.allowWebP || !allowWebP) {
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

/**
 * Tests if an image from a given URL loads, or fails to.
 * Used for testing browser capability.
 */
function canLoadImg(
	url: string,
	height: number,
	width: number
): Promise<boolean> {
	return new Promise((resolve) => {
		const img = document.createElement('img');
		img.addEventListener('load', () => {
			resolve(img.width === width && img.height === height);
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
	return (heifSupportPromise = (async () => {
		const losslessCode =
			'data:image/heic;base64,AAAAGGZ0eXBoZWljAAAAAG1pZjFoZWljAAAAsW1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAHBpY3QAXABjAGMAcwBsAGEAAAAADnBpdG0AAAAAAAEAAAAQaWxvYwAAAABEQAAAAAAAI2lpbmYAAAAAAAEAAAAVaW5mZQIAAAAAAQAAaHZjMQAAAABDaXBycAAAACdpcGNvAAAAH2h2Y0NmzGx1ci0AAAAAAABv9HP+//v9bjr3AAAAABRpcG1hAAAAAAAAAAEAAQGBAAAACG1kYXQ=';
		return await canLoadImg(losslessCode, 1, 2);
	})());
}

/**
 * A cache that stores assets and keeps them loaded
 */
export class AssetCache {
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

/**
 * A cache that weakly stores assets only until the browser garbage collects them on it's own.
 * This is especially used on Safari, which imposes strict memory limits for images.
 */
export class TmpAssetCache {
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
	return (window.assetCache = assetCache =
		environment.supports.assetCaching || typeof WeakRef === 'undefined'
			? new AssetCache()
			: new TmpAssetCache());
}

const customUrl: { [upload_url: string]: string } = {};

export function getAAsset(
	asset: IAssetSwitch,
	hq: boolean = true
): Promise<IAsset> {
	return getAssetByUrl(environment.supports.lq && !hq ? asset.lq : asset.hq);
}

export function getAAssetUrl(asset: IAssetSwitch, hq: boolean = true): string {
	const url = environment.supports.lq && allowLq && !hq ? asset.lq : asset.hq;
	if (customUrl[url]) return customUrl[url];
	return url;
}

export function getAssetByUrl(url: string): Promise<IAsset> {
	if (customUrl[url]) url = customUrl[url];
	return getAssetCache().get(url);
}

export async function getBuildInAsset(
	asset: string,
	hq: boolean = true
): Promise<IAsset> {
	const url = `${assetUrl}${asset}${
		environment.supports.lq && allowLq && !hq ? '.lq' : ''
	}${(await isWebPSupported()) ? '.webp' : '.png'}`.replace(/\/+/, '/');
	return await getAssetCache().get(url);
}

export async function getBuildInAssetUrl(
	asset: string,
	hq: boolean = true
): Promise<string> {
	return `${assetUrl}${asset}${
		environment.supports.lq && allowLq && !hq ? '.lq' : ''
	}${(await isWebPSupported()) ? '.webp' : '.png'}`.replace(/\/+/, '/');
}

export function registerAssetWithURL(asset: string, url: string) {
	customUrl[asset] = url;
}

async function requestAssetByUrl(url: string): Promise<IAsset> {
	const isCustom = !!customUrl[url];
	if (isCustom) url = customUrl[url];
	return await (async (): Promise<IAsset> => {
		try {
			return await imagePromise(url);
		} catch {
			// Webp files sometimes fail to load on safari. Fallback to png
			if (url.endsWith('.webp') && !isCustom) {
				try {
					return await imagePromise(url.replace(/\.webp$/, '.png'));
				} catch {
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

export function imagePromise(url: string, noCache = false): Promise<IAsset> {
	return new Promise((resolve) => {
		const img = new Image();
		img.addEventListener('load', () => {
			resolve(new ImageAsset(img));
			if (noCache || !environment.supports.assetCaching) {
				document.body.removeChild(img);
			}
		});
		img.addEventListener('error', () => {
			resolve(new ErrorAsset());
			if (noCache || !environment.supports.assetCaching) {
				document.body.removeChild(img);
			}
		});
		img.crossOrigin = 'Anonymous';
		img.src = url;
		img.style.display = 'none';
		document.body.appendChild(img);
	});
}
