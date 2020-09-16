import { RenderContext } from '@/renderer/rendererContext';
import { getAAsset } from '@/asset-manager';
import { PoseRenderCommand } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAsset } from '@/store/content';
import { ErrorAsset } from '../models/error-asset';
import { DeepReadonly } from '@/util/readonly';
import { ObjectRenderable } from './objectRenderable';
import { IObject } from '@/store/objects';

export abstract class AssetListRenderable<
	Obj extends IObject
> extends ObjectRenderable<Obj> {
	protected abstract getAssetList(): Array<IDrawAssetsUnloaded | IDrawAssets>;

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
