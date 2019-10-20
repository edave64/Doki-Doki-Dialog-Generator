import { Browser } from './browser';

export class Edge extends Browser {
	public async saveToFile(
		downloadCanvas: HTMLCanvasElement,
		filename: string
	): Promise<string> {
		let url = downloadCanvas.toDataURL();
		const blob = this.dataURItoBlob(url);

		if (window.URL && window.URL.createObjectURL) {
			url = URL.createObjectURL(blob);
		}

		// IE-specific code
		window.navigator.msSaveBlob(blob, filename);
		return url;
	}
}
