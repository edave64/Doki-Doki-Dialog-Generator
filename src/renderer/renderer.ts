import { RenderContext } from './rendererContext';
import { RenderAbortedException } from './renderAbortedException';

export class Renderer {
	private previewCanvas: HTMLCanvasElement;
	private runningContext: RenderContext | null = null;

	public constructor(w: number = 1280, h: number = 720) {
		this.previewCanvas = document.createElement('canvas');
		this.previewCanvas.width = w;
		this.previewCanvas.height = h;
	}

	public async render(
		renderCallback: (rc: RenderContext) => Promise<void>,
		hq: boolean = true
	): Promise<boolean> {
		if (this.runningContext) {
			this.runningContext.abort();
		}

		const ctx = this.previewCanvas.getContext('2d')!;
		ctx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
		const context = (this.runningContext = new RenderContext(ctx, hq, true));
		try {
			await renderCallback(this.runningContext);
		} catch (e) {
			if (e instanceof RenderAbortedException) {
				return false;
			}
			throw e;
		} finally {
			if (context === this.runningContext) {
				this.runningContext = null;
			}
		}
		return true;
	}

	public get width(): number {
		return this.previewCanvas.width;
	}

	public get height(): number {
		return this.previewCanvas.height;
	}

	public paintOnto(
		c: CanvasRenderingContext2D,
		x: number,
		y: number,
		w?: number,
		h?: number
	) {
		if (w && h) {
			c.drawImage(this.previewCanvas, x, y, w, h);
		} else {
			c.drawImage(this.previewCanvas, x, y);
		}
	}

	public async download(
		renderCallback: (rc: RenderContext) => Promise<void>,
		filename: string
	): Promise<string> {
		const downloadCanvas = document.createElement('canvas');
		downloadCanvas.width = this.previewCanvas.width;
		downloadCanvas.height = this.previewCanvas.height;

		const ctx = downloadCanvas.getContext('2d')!;
		ctx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
		await renderCallback(new RenderContext(ctx, true, false));

		let url;
		if (undefined === window.navigator.msSaveOrOpenBlob) {
			const a = document.createElement('a');
			a.setAttribute('download', filename);
			url = await this.createObjectURL(downloadCanvas);
			a.setAttribute('href', url);
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		} else {
			url = downloadCanvas.toDataURL();
			const blob = this.dataURItoBlob(url);

			if (window.URL && window.URL.createObjectURL) {
				url = URL.createObjectURL(blob);
			}

			// IE-specific code
			window.navigator.msSaveBlob(blob, filename);
		}

		return url;
	}

	public createObjectURL(canvas: HTMLCanvasElement): Promise<string> {
		return new Promise((resolve, reject) => {
			if (canvas.toBlob && window.URL && window.URL.createObjectURL) {
				canvas.toBlob(blob => {
					if (!blob) {
						reject();
						return;
					}
					resolve(URL.createObjectURL(blob));
				}, 'image/png');
			} else if (window.URL && window.URL.createObjectURL) {
				const url = canvas.toDataURL();
				const blob = this.dataURItoBlob(url);
				resolve(URL.createObjectURL(blob));
			} else {
				resolve(canvas.toDataURL());
			}
		});
	}

	public getDataAt(x: number, y: number): Uint8ClampedArray {
		const ctx = this.previewCanvas.getContext('2d');

		return ctx!.getImageData(x, y, 1, 1).data;
	}

	private dataURItoBlob(dataURI: string) {
		const binStr = atob(dataURI.split(',')[1]);
		const len = binStr.length;
		const arr = new Uint8Array(len);

		for (let i = 0; i < len; i++) {
			arr[i] = binStr.charCodeAt(i);
		}

		return new Blob([arr], { type: 'image/png' });
	}
}
