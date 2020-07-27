import { RenderContext } from './rendererContext';
import { RenderAbortedException } from './renderAbortedException';
import environment from '@/environments/environment';
import { screenWidth, screenHeight } from '@/constants/base';

export class Renderer {
	private previewCanvas: HTMLCanvasElement;
	private runningContext: RenderContext | null = null;

	public constructor(w: number = screenWidth, h: number = screenHeight) {
		this.previewCanvas = document.createElement('canvas');
		this.previewCanvas.width = w;
		this.previewCanvas.height = h;
	}

	public async render(
		renderCallback: (rc: RenderContext) => Promise<void>,
		hq: boolean = true,
		preview: boolean = true
	): Promise<boolean> {
		if (this.runningContext) {
			this.runningContext.abort();
		}

		const ctx = this.previewCanvas.getContext('2d')!;
		ctx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
		const context = (this.runningContext = new RenderContext(ctx, hq, preview));
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

		return environment.saveToFile(downloadCanvas, filename);
	}

	public async renderToBlob(
		renderCallback: (rc: RenderContext) => Promise<void>
	): Promise<Blob> {
		const downloadCanvas = document.createElement('canvas');
		downloadCanvas.width = this.previewCanvas.width;
		downloadCanvas.height = this.previewCanvas.height;

		const ctx = downloadCanvas.getContext('2d')!;
		ctx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
		await renderCallback(new RenderContext(ctx, true, false));
		return await new Promise<Blob>((resolve, reject) => {
			downloadCanvas.toBlob(blob => {
				if (blob) resolve(blob);
				else reject();
			});
		});
	}

	public getDataAt(x: number, y: number): Uint8ClampedArray {
		const ctx = this.previewCanvas.getContext('2d');

		return ctx!.getImageData(x, y, 1, 1).data;
	}
}
