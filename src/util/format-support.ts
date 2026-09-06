import { allowWebP } from '@/config';

let webpSupportPromise: Promise<boolean> | undefined;

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

/**
 * True if the browser supports WebP
 */
export function isWebPSupported(): Promise<boolean> {
	if (webpSupportPromise) return webpSupportPromise;
	if (!allowWebP) {
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
