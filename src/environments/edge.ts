import { Browser } from './browser';

export class OldEdge extends Browser {
	public saveToFile(
		downloadCanvas: HTMLCanvasElement,
		filename: string,
		format: string = 'image/png',
		quality: number = 1
	): Promise<string> {
		let url = downloadCanvas.toDataURL(format, quality);
		const blob = this.dataURItoBlob(url, format);

		if (window.URL != null && window.URL.createObjectURL != null) {
			url = URL.createObjectURL(blob);
		}

		// IE-specific code
		(window.navigator as any).msSaveBlob(blob, filename);
		return Promise.resolve(url);
	}
}
