import { getAAsset } from '@/asset-manager';
import { ISprite } from '@/store/objectTypes/sprite';
import { DeepReadonly } from '@/util/readonly';
import {
	AssetListRenderable,
	IDrawAssets,
	IDrawAssetsUnloaded,
} from './assetListRenderable';

export class Sprite extends AssetListRenderable<ISprite> {
	private assets!: IDrawAssets[];
	protected ready!: Promise<void>;
	protected canvasHeight: number = 0;
	protected canvasWidth: number = 0;

	constructor(obj: DeepReadonly<ISprite>) {
		super(obj);
		this.init();
	}

	protected get version(): number {
		return this.assets === null ? -1 : this.obj.version;
	}

	public async init() {
		let readyResolve!: () => void;
		this.ready = new Promise((resolve, reject) => {
			readyResolve = resolve;
		});
		const assets = await Promise.all(
			this.obj.assets.map(asset => getAAsset(asset))
		);
		let width = 0;
		let height = 0;
		for (const asset of assets) {
			if (asset instanceof HTMLImageElement) {
				if (asset.height > height) height = asset.height;
				if (asset.width > width) width = asset.width;
			}
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
		return this.assets || [];
	}

	public get zoom() {
		if (this.obj.enlargeWhenTalking && this.refTextbox) return 1.05;
		return 1;
	}

	public get width() {
		return this.obj.width;
	}

	public get height() {
		return this.obj.height;
	}
}
