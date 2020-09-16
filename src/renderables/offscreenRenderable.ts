import { RenderContext } from '@/renderer/rendererContext';
import { Renderer } from '@/renderer/renderer';
import { IRenderable, IHitbox } from './renderable';
import { DeepReadonly } from '@/util/readonly';
import { SpriteFilter } from '@/store/sprite_options';

export abstract class OffscreenRenderable implements IRenderable {
	private hq: boolean = false;
	private localRenderer: Renderer | null = null;
	private lastVersion: any = null;
	private hitDetectionFallback = false;

	protected constructor() {}

	protected abstract readonly canvasHeight: number;
	protected abstract readonly canvasWidth: number;
	protected abstract renderLocal(rx: RenderContext): Promise<void>;

	protected abstract readonly x: number;
	protected abstract readonly y: number;
	protected abstract readonly version: any;
	protected abstract readonly flip: boolean;
	protected abstract readonly composite: CanvasRenderingContext2D['globalCompositeOperation'];
	protected abstract readonly filters: DeepReadonly<SpriteFilter[]>;

	public async updateLocalCanvas(hq: boolean) {
		this.localRenderer = new Renderer(this.canvasWidth, this.canvasHeight);
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
		if (
			this.localRenderer === null ||
			this.lastVersion !== this.version ||
			this.hq !== rx.hq
		) {
			await this.updateLocalCanvas(!rx.hq);
		}

		const w = this.width;
		const h = this.height;
		const x = this.x - w / 2;
		const y = this.y;

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
		const scaledY = hy - this.y;

		if (scaledX < 0 || scaledX > this.width) return false;
		if (scaledY < 0 || scaledY > this.height) return false;

		if (!this.hitDetectionFallback) {
			try {
				const flippedX = this.flip ? this.width - scaledX : scaledX;
				const scaleX = this.localRenderer.width / this.width;
				const scaleY = this.localRenderer.height / this.height;
				const data = this.localRenderer.getDataAt(
					Math.round(flippedX * scaleX),
					Math.round(scaledY * scaleY)
				);
				// tslint:disable-next-line: no-magic-numbers
				return data[3] !== 0;
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
