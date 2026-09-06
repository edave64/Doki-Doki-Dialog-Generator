/**
 * Loads assets from urls for use in canvas painting, keeps them cached, and loads webP images if supported.
 */

import MissingImage from '@/assets/missing_image.svg';
import environment from '@/environments/environment';
import { allowLq, assetUrl } from './config';
import EventBus, { AssetFailureEvent } from './eventbus/event-bus';
import type { IAsset } from './render-utils/assets/asset';
import { ImageAsset } from './render-utils/assets/image-asset';
import type { IAssetSwitch } from './store/content';
import { isWebPSupported } from './util/format-support';

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

// Kept in here, asset-manager depends on it, and it depends on asset-manager.
// So other constructs would create circular dependencies.
export class ErrorAsset implements IAsset {
	public readonly width = 300;
	public readonly height = 300;

	paintOnto(
		fsCtx: CanvasRenderingContext2D,
		opts: { x?: number; y?: number; w?: number; h?: number } = {}
	): void {
		if (missing_image) {
			missing_image.paintOnto(fsCtx, opts);
		}
	}
}

let missing_image: ImageAsset | null = null;

// No point in caching, no-one else should reference this and we are caching it in a var.
imagePromise(MissingImage, true).then((x) => {
	if (x instanceof ImageAsset) missing_image = x;
});
