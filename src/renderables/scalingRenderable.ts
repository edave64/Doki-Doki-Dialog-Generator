import { OffscreenRenderable } from './offscreenRenderable';
import { IObject } from '@/store/objects';
import { RenderContext } from '@/renderer/rendererContext';
import { IHitbox } from './renderable';
import getConstants from '@/constants';
import { DeepReadonly } from 'ts-essentials';

export abstract class ScalingRenderable<
	Obj extends IObject
> extends OffscreenRenderable<Obj> {
	protected lastWidth = -1;
	protected lastHeight = -1;
	protected lastX = -1;
	protected lastY = -1;
	protected lastFlip: boolean | null = null;

	protected readonly canvasHeight: number;
	protected readonly canvasWidth: number;
	protected readonly canvasDrawHeight: number;
	protected readonly canvasDrawWidth: number;
	protected readonly canvasDrawPosX = 0;
	protected readonly canvasDrawPosY = 0;

	public constructor(obj: DeepReadonly<Obj>) {
		super(obj);
		const constants = getConstants().Base;
		this.canvasHeight = constants.screenHeight;
		this.canvasWidth = constants.screenWidth;
		this.canvasDrawHeight = constants.screenHeight;
		this.canvasDrawWidth = constants.screenWidth;
	}

	public getRenderRotation(): [number, { x: number; y: number } | undefined] {
		return [0, undefined];
	}

	public needsRedraw(): boolean {
		if (super.needsRedraw()) return true;
		return (
			this.width !== this.lastWidth ||
			this.height !== this.lastHeight ||
			this.x !== this.lastX ||
			this.y !== this.lastY ||
			this.flip !== this.lastFlip
		);
	}

	public async updateLocalCanvas(hq: boolean) {
		this.lastWidth = this.width;
		this.lastHeight = this.height;
		this.lastX = this.x;
		this.lastY = this.y;
		this.lastFlip = this.flip;
		await super.updateLocalCanvas(hq);
	}

	protected async renderLocal(rx: RenderContext): Promise<void> {
		const constants = getConstants().Base;
		if (this.rotation === 0) return await this.draw(rx);
		await rx.customTransform(async (trx) => {
			const hitbox = this.getHitbox();
			const centerX = hitbox.x0 + (hitbox.x1 - hitbox.x0) / 2;
			const centerY = hitbox.y0 + (hitbox.y1 - hitbox.y0) / 2;

			const flipNormalizedCenterX = this.flip
				? constants.screenWidth - centerX
				: centerX;

			trx.translate(flipNormalizedCenterX, centerY);
			trx.rotate(this.rotation);
			trx.translate(-flipNormalizedCenterX, -centerY);
		}, this.draw.bind(this));
	}

	public getHitbox(): IHitbox {
		const vCentered = this.centeredVertically;
		const w2 = this.width / 2;
		const h2 = this.height / 2;
		return {
			x0: this.x - w2,
			x1: this.x + w2,
			y0: vCentered ? this.y - h2 : this.y,
			y1: vCentered ? this.y + h2 : this.y + this.height,
		};
	}

	protected abstract draw(rx: RenderContext): Promise<void>;

	protected get centeredVertically(): boolean {
		return false;
	}
}
