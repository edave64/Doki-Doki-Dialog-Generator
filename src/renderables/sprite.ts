import { getAAsset } from '@/asset-manager';
import { ISprite } from '@/store/object-types/sprite';
import { DeepReadonly } from 'ts-essentials';
import {
	AssetListRenderable,
	IDrawAssets,
	IDrawAssetsUnloaded,
} from './asset-list-renderable';

export class Sprite extends AssetListRenderable<ISprite> {
	private assets!: IDrawAssets[];
	protected ready: Promise<void> = null!;
	protected canvasHeight: number = 0;
	protected canvasWidth: number = 0;
	protected needAssetUpdate = true;

	constructor(obj: DeepReadonly<ISprite>) {
		super(obj);
		this.init();
	}

	protected get version(): number {
		return this.assets === null ? -1 : this.obj.version;
	}

	public async init() {
		await this.reloadAssets();
	}

	protected async reloadAssets(): Promise<void> {
		let readyResolve!: () => void;
		this.ready = new Promise((resolve, _reject) => {
			readyResolve = resolve;
		});
		const assets = await Promise.all(
			this.obj.assets.map((asset) => getAAsset(asset))
		);
		let width = 0;
		let height = 0;
		for (const asset of assets) {
			if (asset.height > height) height = asset.height;
			if (asset.width > width) width = asset.width;
		}
		this.canvasWidth = width;
		this.canvasHeight = height;
		this.assets = [
			{
				loaded: true,
				assets,
				offset: [0, 0],
			},
		];
		readyResolve();
	}

	protected getAssetList(): (IDrawAssets | IDrawAssetsUnloaded)[] {
		return this.assets ?? [];
	}
}
