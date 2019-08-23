import { RenderContext } from './rendererContext';

export class Renderer {
	private fs: HTMLCanvasElement;

	public constructor() {
		this.fs = document.createElement('canvas');
		this.fs.width = 1280;
		this.fs.height = 720;
	}

	public async render(
		renderCallback: (rc: RenderContext) => Promise<void>,
		hq: boolean = true
	) {
		const fsCtx = this.fs.getContext('2d')!;
		fsCtx.clearRect(0, 0, this.fs.width, this.fs.height);
		await renderCallback(new RenderContext(fsCtx, hq));
	}

	public get width(): number {
		return this.fs.width;
	}

	public get height(): number {
		return this.fs.height;
	}

	public paintOnto(
		c: CanvasRenderingContext2D,
		x: number,
		y: number,
		w: number,
		h: number
	) {
		c.drawImage(this.fs, x, y, w, h);
	}

	public download(filename: string) {
		const url = this.fs.toDataURL();

		if (undefined === window.navigator.msSaveOrOpenBlob) {
			const e = document.createElement('a');
			e.setAttribute('href', url);
			e.setAttribute('download', filename);
			document.body.appendChild(e);
			e.click();
			document.body.removeChild(e);
		} else {
			// IE-specific code
			window.navigator.msSaveBlob(this.dataURItoBlob(url), filename);
		}
	}

	private dataURItoBlob(dataURI: string) {
		const binary = atob(dataURI.split(',')[1]);
		const array = [];
		for (let i = 0; i < binary.length; i++) {
			array.push(binary.charCodeAt(i));
		}
		return new Blob([new Uint8Array(array)], { type: 'image/png' });
	}
}
