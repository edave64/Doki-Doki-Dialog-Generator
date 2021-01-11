import { RenderContext } from '@/renderer/rendererContext';
import { getAAsset } from '@/asset-manager';
import { PoseRenderCommand } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAsset } from '@/store/content';
import { ErrorAsset } from '../models/error-asset';
import { DeepReadonly } from '@/util/readonly';
import { IObject } from '@/store/objects';
import { OffscreenRenderable } from './offscreenRenderable';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { ITextBox } from '@/store/objectTypes/textbox';

export abstract class AssetListRenderable<
	Obj extends IObject
> extends OffscreenRenderable<Obj> {
	protected refTextbox: ITextBox | null = null;
	protected abstract getAssetList(): Array<IDrawAssetsUnloaded | IDrawAssets>;
	protected get canvasDrawWidth(): number {
		return this.width * this.textboxZoom;
	}
	protected get canvasDrawHeight(): number {
		return this.height * this.textboxZoom;
	}
	protected get canvasDrawPosX(): number {
		return this.x - this.width / 2 + (this.height - this.canvasDrawHeight) / 2;
	}
	protected get canvasDrawPosY(): number {
		return this.y + (this.height - this.canvasDrawHeight);
	}

	protected get textboxZoom(): number {
		return this.obj.enlargeWhenTalking && this.refTextbox ? 1.05 : 1;
	}

	public updatedContent(
		_current: Store<DeepReadonly<IRootState>>,
		panelId: string
	): void {
		const panel = _current.state.objects.panels[panelId];
		const inPanel = [...panel.order, ...panel.onTopOrder];
		this.refTextbox = null;
		for (const key of inPanel) {
			const obj = _current.state.objects.objects[key] as ITextBox;
			if (obj.type === 'textBox' && obj.talkingObjId === this.obj.id) {
				this.refTextbox = obj;
				return;
			}
		}
	}

	protected async renderLocal(rx: RenderContext): Promise<void> {
		const drawAssetsUnloaded: Array<
			IDrawAssetsUnloaded | IDrawAssets
		> = this.getAssetList();

		const loadedDraws = await Promise.all(
			drawAssetsUnloaded
				.filter(drawAsset => drawAsset.assets)
				.map(drawAsset => loadAssets(drawAsset, rx.hq))
		);
		for (const loadedDraw of loadedDraws) {
			for (const asset of loadedDraw.assets) {
				rx.drawImage({
					image: asset,
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
	assets: DeepReadonly<IAsset[]>;
	composite?: PoseRenderCommand<any>['composite'];
}

export interface IDrawAssets {
	loaded: true;
	offset: DeepReadonly<[number, number]>;
	assets: DeepReadonly<Array<HTMLImageElement | ErrorAsset>>;
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
			unloaded.assets.map(asset => getAAsset(asset, hq))
		),
		composite: unloaded.composite,
	};
}
