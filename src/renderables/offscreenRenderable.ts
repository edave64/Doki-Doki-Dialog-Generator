import { CompositeModes, RenderContext } from '@/renderer/rendererContext';
import { Renderer } from '@/renderer/renderer';
import { IHitbox } from './renderable';
import { DeepReadonly } from 'ts-essentials';
import { SpriteFilter } from '@/store/sprite_options';
import { IObject } from '@/store/objects';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { rotateAround } from '@/util/rotation';
import { IPanel } from '@/store/panels';

export abstract class OffscreenRenderable<Obj extends IObject> {
	private localRenderer: Renderer | null = null;
	private lastVersion: any = null;
	private hitDetectionFallback = false;
	protected renderable: boolean = false;

	public constructor(public obj: DeepReadonly<Obj>) {}

	protected abstract readonly canvasHeight: number;
	protected abstract readonly canvasWidth: number;

	// The dimentions used to draw the local canvas onto the target. Is different from `canvasHeight` and `canvasWidth` to allow scaling
	protected abstract readonly canvasDrawHeight: number;
	protected abstract readonly canvasDrawWidth: number;
	protected abstract readonly canvasDrawPosX: number;
	protected abstract readonly canvasDrawPosY: number;
	protected abstract renderLocal(rx: RenderContext): Promise<void>;

	protected lastHq: boolean = false;

	protected readonly ready = Promise.resolve();

	public get id(): IObject['id'] {
		return this.obj.id;
	}

	protected get x(): number {
		return this.obj.x;
	}
	protected get y(): number {
		return this.obj.y;
	}
	protected get version(): number {
		return this.obj.version;
	}
	protected get flip(): boolean {
		return this.obj.flip;
	}
	protected get rotation(): number {
		return (this.obj.rotation / 180) * Math.PI;
	}
	protected get composite(): CompositeModes {
		return this.obj.composite;
	}
	protected get filters(): DeepReadonly<SpriteFilter[]> {
		return this.obj.filters;
	}
	protected get width(): number {
		return this.obj.width;
	}
	protected get height(): number {
		return this.obj.height;
	}

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
		this.lastHq = hq;
		await this.localRenderer.render(this.renderLocal.bind(this));
	}

	public needsRedraw(): boolean {
		return this.localRenderer === null || this.lastVersion !== this.version;
	}

	public getRenderRotation(): [number, { x: number; y: number } | undefined] {
		return [
			this.flip ? -this.rotation : this.rotation,
			{
				x: this.x,
				y: this.y + this.height / 2,
			},
		];
	}

	public async render(selected: boolean, rx: RenderContext) {
		const needRedraw = this.lastHq !== rx.hq || this.needsRedraw();

		if (needRedraw) await this.updateLocalCanvas(!rx.hq);

		this.lastVersion = this.version;

		if (!this.renderable) return;

		const [rotation, rotationAnchor] = this.getRenderRotation();

		rx.drawImage({
			image: this.localRenderer!,
			x: this.canvasDrawPosX,
			y: this.canvasDrawPosY,
			w: this.canvasDrawWidth,
			h: this.canvasDrawHeight,
			rotation,
			rotationAnchor,
			flip: this.flip,
			shadow: selected && rx.preview ? { blur: 20, color: 'red' } : undefined,
			composite: this.composite,
			filters: this.filters,
		});
	}

	public hitTest(hx: number, hy: number): boolean {
		if (!this.localRenderer) return false;

		const hitbox = this.getHitbox();

		const centerX = hitbox.x0 + (hitbox.x1 - hitbox.x0) / 2;
		const centerY = hitbox.y0 + (hitbox.y1 - hitbox.y0) / 2;

		// Rotate the hit backwards, to cancle the rotation of the object
		const [rotatedHitX, rotatedHitY] = rotateAround(
			hx,
			hy,
			centerX,
			centerY,
			this.flip ? this.rotation : -this.rotation
		);

		const hit =
			rotatedHitX >= hitbox.x0 &&
			rotatedHitX <= hitbox.x1 &&
			rotatedHitY >= hitbox.y0 &&
			rotatedHitY <= hitbox.y1;

		if (!hit) return false;
		// We can't do pixel perfect detection and we have a hitbox hit -> true
		if (this.hitDetectionFallback) return true;

		try {
			return this.pixelPerfectHitTest(hx, hy);
		} catch (e) {
			this.hitDetectionFallback = true;
		}

		return true;
	}

	public pixelPerfectHitTest(x: number, y: number): boolean {
		if (!this.localRenderer) return false;
		const [angle, anchor] = this.getRenderRotation();
		const [rotatedHitX, rotatedHitY] = anchor
			? rotateAround(x, y, anchor.x, anchor.y, -angle)
			: [x, y];

		const innerX = Math.round(rotatedHitX - this.canvasDrawPosX);
		const innerY = Math.round(rotatedHitY - this.canvasDrawPosY);

		const canvasDrawWidth = this.canvasDrawWidth;
		const canvasDrawHeight = this.canvasDrawHeight;

		if (
			innerX >= 0 &&
			innerX <= canvasDrawWidth &&
			innerY >= 0 &&
			innerY <= canvasDrawHeight
		) {
			const flippedX = this.flip ? this.canvasDrawWidth - innerX : innerX;
			const scaleX = this.canvasWidth / this.canvasDrawWidth;
			const scaleY = this.canvasHeight / this.canvasDrawHeight;
			const data = this.localRenderer.getDataAt(
				Math.round(flippedX * scaleX),
				Math.round(innerY * scaleY)
			);
			return data[3] !== 0;
		}
		return false;
	}

	/**
	 * Returns the hitbox of the object, *not* taking into account any rotation (as that would just inflate the hitbox and reduce accuracy)
	 * To manually apply rotation to it, rotate your hit test by `this.rotation` around the center of the hitbox.
	 */
	public getHitbox(): IHitbox {
		return {
			x0: this.x - this.width / 2,
			x1: this.x + this.width / 2,
			y0: this.y,
			y1: this.y + this.height,
		};
	}

	public updatedContent(
		_current: Store<DeepReadonly<IRootState>>,
		_panelId: IPanel['id']
	): void {}
}
