import { RenderContext } from '@/renderer/rendererContext';
import { getAAsset } from '@/asset-manager';
import { PoseRenderCommand } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAssetSwitch } from '@/store/content';
import { DeepReadonly } from 'ts-essentials';
import { IObject } from '@/store/objects';
import { OffscreenRenderable } from './offscreenRenderable';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { ITextBox } from '@/store/objectTypes/textbox';
import { IHitbox } from './renderable';
import { IAsset } from '@/render-utils/assets/asset';
import { IPanel } from '@/store/panels';

export abstract class AssetListRenderable<
	Obj extends IObject
> extends OffscreenRenderable<Obj> {
	protected refTextbox: ITextBox | null = null;
	protected abstract getAssetList(): Array<IDrawAssetsUnloaded | IDrawAssets>;
	protected get canvasDrawWidth(): number {
		return this.width * this.objZoom;
	}
	protected get canvasDrawHeight(): number {
		return this.height * this.objZoom;
	}
	protected get canvasDrawPosX(): number {
		return this.x - this.width / 2 + (this.height - this.canvasDrawHeight) / 2;
	}
	protected get canvasDrawPosY(): number {
		return this.y + (this.height - this.canvasDrawHeight);
	}

	protected get objZoom(): number {
		const textboxZoom =
			this.obj.enlargeWhenTalking && this.refTextbox ? 1.05 : 1;
		return textboxZoom * this.obj.zoom;
	}

	public getHitbox(): IHitbox {
		const base = super.getHitbox();
		const zoomWidthDelta = this.width * (this.objZoom - 1);
		const zoomHeightDelta = this.height * (this.objZoom - 1);

		return {
			x0: base.x0 - zoomWidthDelta / 2,
			x1: base.x1 + zoomWidthDelta / 2,
			y0: base.y0 - zoomHeightDelta,
			y1: base.y1,
		};
	}

	public updatedContent(
		_current: Store<DeepReadonly<IRootState>>,
		panelId: IPanel['id']
	): void {
		const panel = _current.state.panels.panels[panelId];
		const inPanel = [...panel.order, ...panel.onTopOrder]; // Error here? (Donic_Volpe)
		this.refTextbox = null;
		for (const key of inPanel) {
			const obj = _current.state.panels.panels[panelId].objects[
				key
			] as ITextBox;
			if (obj.type === 'textBox' && obj.talkingObjId === this.obj.id) {
				this.refTextbox = obj;
				return;
			}
		}
	}

	protected async renderLocal(rx: RenderContext): Promise<void> {
		const drawAssetsUnloaded: Array<IDrawAssetsUnloaded | IDrawAssets> =
			this.getAssetList();

		const loadedDraws = await Promise.all(
			drawAssetsUnloaded
				.filter((drawAsset) => drawAsset.assets)
				.map((drawAsset) => loadAssets(drawAsset, rx.hq))
		);
		for (const loadedDraw of loadedDraws) {
			for (const asset of loadedDraw.assets) {
				rx.drawImage({
					image: asset as IAsset,
					composite: loadedDraw.composite,
					x: loadedDraw.offset[0],
					y: loadedDraw.offset[1],
				});
			}
		}
	}
}

export interface IDrawAssetsUnloaded {
	offset: DeepReadonly<[number, number]>;
	assets: DeepReadonly<IAssetSwitch[]>;
	composite?: PoseRenderCommand<any>['composite'];
}

export interface IDrawAssets {
	loaded: true;
	offset: DeepReadonly<[number, number]>;
	assets: DeepReadonly<IAsset[]>;
	composite?: PoseRenderCommand<any>['composite'];
}

export async function loadAssets(
	unloaded: IDrawAssetsUnloaded | IDrawAssets,
	hq: boolean
): Promise<IDrawAssets> {
	if ('loaded' in unloaded) return unloaded;
	return {
		loaded: true,
		offset: unloaded.offset,
		assets: await Promise.all(
			unloaded.assets.map((asset) => getAAsset(asset, hq))
		),
		composite: unloaded.composite,
	};
}
