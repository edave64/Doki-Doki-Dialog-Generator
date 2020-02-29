import { RenderContext } from '@/renderer/rendererContext';
import { getAAsset } from '@/asset-manager';
import { IRenderable } from './renderable';
import { IDragable } from './dragable';
import { ErrorAsset } from './error-asset';
import { ISprite } from '@/store/objectTypes/sprite';
import eventBus, { InvalidateRenderEvent } from '@/eventbus/event-bus';
import { DeepReadonly } from '@/util/readonly';

const BaseXPosition = 640;

export class Sprite implements IRenderable, IDragable {
	public ratio: number = 0;
	public lockedRatio: boolean = true;
	private asset: HTMLImageElement | null = null;

	public get id(): string {
		return this.obj.id;
	}
	public get infront(): boolean {
		return this.obj.onTop;
	}

	public constructor(public readonly obj: DeepReadonly<ISprite>) {}

	public async render(selected: boolean, rx: RenderContext) {
		const assets = await Promise.all(
			this.obj.assets.map(asset => getAAsset(asset))
		);
		const x = this.obj.x - this.obj.width / 2;
		for (const asset of assets) {
			rx.drawImage({
				image: asset,
				x,
				y: this.obj.y,
				w: this.obj.width,
				h: this.obj.height,
				shadow: selected && rx.preview ? { blur: 20, color: 'red' } : undefined,
				flip: this.obj.flip,
				opacity: this.obj.opacity,
			});
		}
	}

	public hitTest(hx: number, hy: number): boolean {
		const hitX = hx - this.obj.x + this.obj.width / 2;
		const hitY = hy - this.obj.y;
		return (
			hitX >= 0 &&
			hitX <= this.obj.width &&
			hitY >= 0 &&
			hitY <= this.obj.height
		);
	}
}
