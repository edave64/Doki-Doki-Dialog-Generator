import { ISprite } from '@/store/object-types/sprite';
import {
	AssetListRenderable,
	IDrawAssets,
	IDrawAssetsUnloaded,
} from './asset-list-renderable';

export class Sprite extends AssetListRenderable<ISprite> {
	protected getAssetList(): (IDrawAssets | IDrawAssetsUnloaded)[] {
		return [
			{
				assets: this.obj.assets,
				offset: [0, 0],
			},
		];
	}
}
