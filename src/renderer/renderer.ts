import { RenderContext } from './rendererContext';
import { RenderAbortedException } from './renderAbortedException';
import environment from '@/environments/environment';
import getConstants from '@/constants';

export class Renderer {
	private readonly previewCanvas: HTMLCanvasElement;
	private runningContext: RenderContext | null = null;

	public constructor(w?: number, h?: number) {
		const constants = getConstants();
		this.previewCanvas = document.createElement('canvas');
		this.previewCanvas.width = w ?? constants.Base.screenWidth;
		this.previewCanvas.height = h ?? constants.Base.screenHeight;
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
		const context = (this.runningContext = RenderContext.makeWithContext(
			this.previewCanvas,
			ctx,
			hq,
			preview
		));
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
		opts: { x: number; y: number; w?: number; h?: number }
	) {
		if (opts.w && opts.h) {
			c.drawImage(this.previewCanvas, opts.x, opts.y, opts.w, opts.h);
		} else {
			c.drawImage(this.previewCanvas, opts.x, opts.y);
		}
	}

	public async download(
		renderCallback: (rc: RenderContext) => Promise<void>,
		filename: string
	): Promise<string> {
		const downloadCanvas = await this.drawToCanvas(renderCallback);
		return await environment.saveToFile(downloadCanvas, filename);
	}

	public async renderToBlob(
		renderCallback: (rc: RenderContext) => Promise<void>
	): Promise<Blob> {
		const downloadCanvas = await this.drawToCanvas(renderCallback);

		return await new Promise<Blob>((resolve, reject) => {
			downloadCanvas.toBlob((blob) => {
				if (blob) resolve(blob);
				else reject();
			});
		});
	}

	private async drawToCanvas(
		renderCallback: (rc: RenderContext) => Promise<void>
	): Promise<HTMLCanvasElement> {
		const downloadCanvas = document.createElement('canvas');
		downloadCanvas.width = this.previewCanvas.width;
		downloadCanvas.height = this.previewCanvas.height;

		const ctx = downloadCanvas.getContext('2d')!;
		ctx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
		await renderCallback(
			RenderContext.makeWithContext(downloadCanvas, ctx, true, false)
		);
		return downloadCanvas;
	}

	public getDataAt(x: number, y: number): Uint8ClampedArray {
		const ctx = this.previewCanvas.getContext('2d');

		return ctx!.getImageData(x, y, 1, 1).data;
	}
}
