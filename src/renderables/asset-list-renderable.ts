import { getAAsset } from '@/asset-manager';
import { IAsset } from '@/render-utils/assets/asset';
import { ErrorAsset } from '@/render-utils/assets/error-asset';
import { IRootState } from '@/store';
import { IAssetSwitch } from '@/store/content';
import { ITextBox } from '@/store/object-types/textbox';
import { IObject } from '@/store/objects';
import { IPanel } from '@/store/panels';
import { PoseRenderCommand } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { DeepReadonly } from 'ts-essentials';
import { Store } from 'vuex';
import { Renderable } from './renderable';

export abstract class AssetListRenderable<
	Obj extends IObject
> extends Renderable<Obj> {
	protected refTextbox: ITextBox | null = null;
	protected abstract getAssetList(): Array<IDrawAssetsUnloaded | IDrawAssets>;

	private lastUploadCount = 0;
	private lastHq: boolean = false;
	private missingAsset = false;
	protected canSkipLocal = false;
	protected transformIsLocal = false;

	public prepareRender(
		panel: DeepReadonly<IPanel>,
		store: Store<IRootState>,
		renderables: Map<IObject['id'], DeepReadonly<Renderable<never>>>,
		lq: boolean
	): void | Promise<unknown> {
		super.prepareRender(panel, store, renderables, lq);
		let reloadAssets = !lq === this.lastHq;
		if (this.missingAsset) {
			const uploadCount = Object.keys(store.state.uploadUrls).length;
			reloadAssets = uploadCount !== this.lastUploadCount;
			this.lastUploadCount = uploadCount;
		}
		if (this.isAssetListOutdated()) {
			this.assetList = this.getAssetList();
			reloadAssets = true;
		}
		if (!reloadAssets) return;
		this.lastHq = !lq;
		this.canSkipLocal = this.assetList.length <= 1;
		return this.loadAssets(!lq);
	}

	public getAssetsSize(): DOMPointReadOnly {
		let width = 0;
		let height = 0;
		for (const assets of this.assetList) {
			if (!('loadedAssets' in assets)) continue;
			for (const asset of assets.loadedAssets) {
				width = Math.max(width, assets.offset[0] + asset.width);
				height = Math.max(height, assets.offset[1] + asset.height);
			}
		}
		return new DOMPointReadOnly(width, height);
	}

	protected loadAssets(hq: boolean): Promise<unknown> | void {
		const promises: Promise<unknown>[] = [];
		this.missingAsset = false;
		for (const assetEntry of this.assetList) {
			if ('loadedAssets' in assetEntry && !assetEntry.hasMissing) continue;
			promises.push(
				(async (
					assetEntry: IDrawAssets | IDrawAssetsUnloaded
				): Promise<unknown> => {
					const assets = await Promise.all(
						assetEntry.assets.map((asset) => getAAsset(asset, hq))
					);
					const out = assetEntry as IDrawAssets;
					out.loadedAssets = assets;
					out.hasMissing = assets.some((x) => x instanceof ErrorAsset);
					this.missingAsset ||= out.hasMissing;
					return;
				})(assetEntry)
			);
		}
		if (promises.length === 0) return;
		return Promise.all(promises);
	}
	protected assetList: (IDrawAssetsUnloaded | IDrawAssets)[] = [];
	protected abstract isAssetListOutdated(): boolean;

	protected renderLocal(ctx: CanvasRenderingContext2D, hq: boolean) {
		console.log('rerendering local');

		for (const loadedDraw of this.assetList) {
			if (!('loadedAssets' in loadedDraw)) continue;
			for (const asset of loadedDraw.loadedAssets) {
				if (!this.canSkipLocal) {
					ctx.globalCompositeOperation = loadedDraw.composite ?? 'source-over';
				}
				asset.paintOnto(ctx, {
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
	hasMissing: boolean;
	offset: DeepReadonly<[number, number]>;
	assets: DeepReadonly<IAssetSwitch[]>;
	loadedAssets: DeepReadonly<IAsset[]>;
	composite?: PoseRenderCommand<any>['composite'];
}
