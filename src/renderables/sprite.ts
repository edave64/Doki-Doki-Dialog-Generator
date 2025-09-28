import type SpriteStore from '@/store/object-types/sprite';
import {
	AssetListRenderable,
	type IDrawAssets,
	type IDrawAssetsUnloaded,
} from './asset-list-renderable';

export class Sprite extends AssetListRenderable<SpriteStore> {
	protected getAssetList(): (IDrawAssets | IDrawAssetsUnloaded)[] {
		return [
			{
				assets: this.obj.assets,
				offset: [0, 0],
			},
		];
	}
}
