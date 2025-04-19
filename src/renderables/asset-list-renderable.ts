import { getAAsset } from '@/asset-manager';
import type { IAsset } from '@/render-utils/assets/asset';
import { ErrorAsset } from '@/render-utils/assets/error-asset';
import type { IRootState } from '@/store';
import type { IAssetSwitch } from '@/store/content';
import type { ITextBox } from '@/store/object-types/textbox';
import type { IObject } from '@/store/objects';
import type { IPanel } from '@/store/panels';
import type { PoseRenderCommand } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import type { DeepReadonly } from 'ts-essentials';
import { Store } from 'vuex';
import { Renderable } from './renderable';

/**
 * An abstraction over objects that are just a bunch of images drawn on top of each other. (Sprites and characters)
 */
export abstract class AssetListRenderable<
	Obj extends IObject,
> extends Renderable<Obj> {
	protected refTextbox: ITextBox | null = null;
	protected abstract getAssetList(): Array<IDrawAssetsUnloaded | IDrawAssets>;

	private lastUploadCount = 0;
	private lastHq: boolean = false;
	private missingAsset = false;
	private _canSkipLocal = false;
	protected get canSkipLocal() {
		return this._canSkipLocal;
	}
	protected get transformIsLocal() {
		return false;
	}

	public override prepareData(
		panel: DeepReadonly<IPanel>,
		store: Store<DeepReadonly<IRootState>>
	): void {
		super.prepareData(panel, store);
		if (this.missingAsset) {
			const uploadCount = Object.keys(store.state.uploadUrls).length;
			if (uploadCount !== this.lastUploadCount) {
				// Force asset invalidation
				this.lastHq = null!;
			}
			this.lastUploadCount = uploadCount;
		}
	}

	public prepareRender(lq: boolean): void | Promise<unknown> {
		super.prepareRender(lq);
		let reloadAssets = false;
		if (this.isAssetListOutdated()) {
			this.assetList = this.getAssetList();
			// reloadAssets = true;
			// Check if there are any new assets in here.
			// TODO: This currently only exists because character.ts can't be bothered to implement the
			//       assetListOutdated check properly. In theory, this is not correct, it just detects if there are any
			//       assets that weren't in the sprite previously. If one pose has just one asset fewer, like an
			//       accessory, or has the same assets with different offsets, it will not update the local canvas.
			reloadAssets ||= !!this.assetList.find(
				(x) => !('loadedAssets' in x) || x.hasMissing
			);
		}
		if (!lq !== this.lastHq) {
			for (let i = 0; i < this.assetList.length; ++i) {
				const asset = this.assetList[i];
				if (
					'loadedAssets' in asset &&
					!asset.assets.every((x) => x.hq === x.lq)
				) {
					// LQ/HQ mode has changed, and the some assets have different URLs in lq and hq mode:
					// Demote those assets back to unloaded.
					this.assetList[i] = {
						assets: asset.assets,
						offset: asset.offset,
						composite: asset.composite,
					} as IDrawAssetsUnloaded;
					reloadAssets = true;
				}
			}
		}
		this.lastHq = !lq;
		if (!reloadAssets) return;
		this.localCanvasInvalid = true;
		this._canSkipLocal = this.assetList.length <= 1;
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
			if ('loadedAssets' in assetEntry && !assetEntry.hasMissing)
				continue;
			promises.push(
				(async (
					assetEntry: IDrawAssets | IDrawAssetsUnloaded
				): Promise<unknown> => {
					const assets = await Promise.all(
						assetEntry.assets.map((asset) => getAAsset(asset, hq))
					);
					const out = assetEntry as IDrawAssets;
					out.loadedAssets = assets;
					out.hasMissing = assets.some(
						(x) => x instanceof ErrorAsset
					);
					this.missingAsset ||= out.hasMissing;
					return;
				})(assetEntry)
			);
		}
		if (promises.length === 0) return;
		return Promise.all(promises);
	}
	protected assetList: (IDrawAssetsUnloaded | IDrawAssets)[] = [];
	protected isAssetListOutdated(): boolean {
		return this.assetList.length === 0;
	}

	protected override renderLocal(ctx: CanvasRenderingContext2D): void {
		console.log('rerendering local');

		for (const loadedDraw of this.assetList) {
			if (!('loadedAssets' in loadedDraw)) continue;
			for (const asset of loadedDraw.loadedAssets) {
				if (!this.canSkipLocal) {
					ctx.globalCompositeOperation =
						loadedDraw.composite ?? 'source-over';
				}
				if (asset instanceof ErrorAsset) {
					asset.paintOnto(ctx, {
						x: loadedDraw.offset[0],
						y: loadedDraw.offset[1],
						h: this.height,
						w: this.width,
					});
				} else {
					asset.paintOnto(ctx, {
						x: loadedDraw.offset[0],
						y: loadedDraw.offset[1],
					});
				}
			}
		}
	}
}

export interface IDrawAssetsUnloaded {
	offset: DeepReadonly<[number, number]>;
	assets: DeepReadonly<IAssetSwitch[]>;
	composite?: PoseRenderCommand<unknown>['composite'];
}

export interface IDrawAssets {
	hasMissing: boolean;
	offset: DeepReadonly<[number, number]>;
	assets: DeepReadonly<IAssetSwitch[]>;
	loadedAssets: DeepReadonly<IAsset[]>;
	composite?: PoseRenderCommand<unknown>['composite'];
}
