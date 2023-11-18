import { IRootState } from '@/store';
import { IAssetSwitch } from '@/store/content';
import {
	getData,
	getHeads,
	getPose,
	ICharacter,
} from '@/store/object-types/characters';
import { IPanel } from '@/store/panels';
import {
	Character as CharacterModel,
	Pose,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { DeepReadonly } from 'ts-essentials';
import { Store } from 'vuex';
import {
	AssetListRenderable,
	IDrawAssetsUnloaded,
} from './asset-list-renderable';

export class Character extends AssetListRenderable<ICharacter> {
	public constructor(
		obj: DeepReadonly<ICharacter>,
		private data: DeepReadonly<CharacterModel<IAssetSwitch>>
	) {
		super(obj);
	}

	public prepareRender(
		panel: DeepReadonly<IPanel>,
		store: Store<IRootState>,
		lq: boolean
	): void | Promise<unknown> {
		this.data = getData(store, this.obj);
		return super.prepareRender(panel, store, lq);
	}

	protected isAssetListOutdated(): boolean {
		return true;
	}

	protected getAssetList(): IDrawAssetsUnloaded[] {
		const pose = getPose(this.data, this.obj) as Pose<IAssetSwitch>;
		const currentHeads = getHeads(this.data, this.obj);
		const drawAssetsUnloaded: IDrawAssetsUnloaded[] = [];

		for (const renderCommand of pose.renderCommands) {
			switch (renderCommand.type) {
				case 'head':
					drawAssetsUnloaded.push({
						offset: renderCommand.offset,
						composite: renderCommand.composite,
						assets: currentHeads
							? currentHeads.variants[this.obj.posePositions.head || 0]
							: [],
					});
					break;
				case 'image':
					drawAssetsUnloaded.push({
						offset: renderCommand.offset,
						composite: renderCommand.composite,
						assets: renderCommand.images,
					});
					break;
				case 'pose-part': {
					const posePosition = pose.positions[renderCommand.part];
					// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
					if (!posePosition || posePosition.length === 0) {
						break;
					}
					const partAssets =
						posePosition[this.obj.posePositions[renderCommand.part] || 0];
					// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
					if (!partAssets) break;
					drawAssetsUnloaded.push({
						offset: renderCommand.offset,
						composite: renderCommand.composite,
						assets: partAssets,
					});
					break;
				}
			}
		}
		return drawAssetsUnloaded;
	}
}
