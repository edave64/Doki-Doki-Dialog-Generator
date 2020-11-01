import { RenderContext } from '@/renderer/rendererContext';
import { Renderer } from '@/renderer/renderer';
import { IHitbox } from './renderable';
import { DeepReadonly } from '@/util/readonly';
import { SpriteFilter } from '@/store/sprite_options';
import { screenHeight, screenWidth } from '@/constants/base';
import { CompositeModes } from '@/renderer/rendererContext';

export abstract class OffscreenRenderable {
	private hq: boolean = false;
	private localRenderer: Renderer | null = null;
	private lastVersion: any = null;
	private hitDetectionFallback = false;
	protected renderable: boolean = false;

	protected constructor() {}

	/**
	 * A scalable offscreenRenderable has a canvas size independent of the
	 * display size. * Non-scalable renderables have canvases as big as the
	 * screen, and are applied without scaling
	 */
	protected abstract readonly scaleable: boolean;
	protected get centeredVertically(): boolean {
		return false;
	}
	protected abstract readonly canvasHeight: number;
	protected abstract readonly canvasWidth: number;
	protected abstract renderLocal(rx: RenderContext): Promise<void>;

	private lastWidth = -1;
	private lastHeight = -1;
	private lastX = -1;
	private lastY = -1;
	private lastFlip: boolean | null = null;

	protected abstract readonly x: number;
	protected abstract readonly y: number;
	protected abstract readonly version: any;
	protected abstract readonly flip: boolean;
	protected abstract readonly composite: CompositeModes;
	protected abstract readonly filters: DeepReadonly<SpriteFilter[]>;
	protected readonly ready = Promise.resolve();

	public async updateLocalCanvas(hq: boolean) {
		await this.ready;
		const width = this.canvasWidth;
		const height = this.canvasHeight;
		if (height === 0 && width === 0) {
			this.renderable = false;
			return;
		}
		this.renderable = true;
		this.localRenderer = new Renderer(width, height);
		this.hq = hq;
		await this.localRenderer.render(this.renderLocal.bind(this));
	}

	public get width() {
		return this.canvasWidth;
	}

	public get height() {
		return this.canvasHeight;
	}

	public async render(selected: boolean, rx: RenderContext) {
		let needRedraw =
			this.localRenderer === null ||
			this.lastVersion !== this.version ||
			this.hq !== rx.hq;

		if (!this.scaleable) {
			needRedraw =
				needRedraw ||
				this.width !== this.lastWidth ||
				this.height !== this.lastHeight ||
				this.x !== this.lastX ||
				this.y !== this.lastY ||
				this.flip !== this.lastFlip;
			this.lastWidth = this.width;
			this.lastHeight = this.height;
			this.lastX = this.x;
			this.lastY = this.y;
			this.lastFlip = this.flip;
		}

		if (needRedraw) {
			await this.updateLocalCanvas(!rx.hq);
		}

		this.hq = rx.hq;
		this.lastVersion = this.version;

		if (!this.renderable) return;

		const w = this.scaleable ? this.width : screenWidth;
		const h = this.scaleable ? this.height : screenHeight;
		const x = this.scaleable ? this.x - w / 2 : 0;
		const y = this.scaleable ? this.y : 0;

		rx.drawImage({
			image: this.localRenderer!,
			x,
			y,
			w,
			h,
			flip: this.flip,
			shadow: selected && rx.preview ? { blur: 20, color: 'red' } : undefined,
			composite: this.composite,
			filters: this.filters,
		});
	}

	public hitTest(hx: number, hy: number): boolean {
		if (!this.localRenderer) return false;

		const scaledX = hx - (this.x - this.width / 2);
		const scaledY =
			hy - (this.centeredVertically ? this.y - this.height / 2 : this.y);

		if (scaledX < 0 || scaledX > this.width) return false;
		if (scaledY < 0 || scaledY > this.height) return false;

		if (!this.hitDetectionFallback) {
			try {
				if (this.scaleable) {
					const flippedX = this.flip ? this.width - scaledX : scaledX;
					const scaleX = this.localRenderer.width / this.width;
					const scaleY = this.localRenderer.height / this.height;
					const data = this.localRenderer.getDataAt(
						Math.round(flippedX * scaleX),
						Math.round(scaledY * scaleY)
					);
					return data[3] !== 0;
				} else {
					const data = this.localRenderer.getDataAt(
						Math.round(this.flip ? screenWidth - hx : hx),
						Math.round(hy)
					);
					return data[3] !== 0;
				}
			} catch (e) {
				// On chrome for android, the hit test tends to fail because of cross-origin shenanigans, even though
				// we only ever load from one origin. ¯\_(ツ)_/¯
				// So we have a fallback that doesn't read the contents of the canvas. This looses accuracy, but at
				// least works always.
				if (e instanceof DOMException && e.message.includes('cross-origin')) {
					this.hitDetectionFallback = true;
				} else {
					throw e;
				}
			}
		}

		return true;
	}

	public getHitbox(): IHitbox {
		return {
			x0: this.x - this.width / 2,
			x1: this.x + this.width / 2,
			y0: this.y,
			y1: this.y + this.height,
		};
	}
}
