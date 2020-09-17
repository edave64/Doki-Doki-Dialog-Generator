import {
	ICharacter,
	getPose,
	getHeads,
	getData,
} from '@/store/objectTypes/characters';
import {
	Pose,
	Character as CharacterModel,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAsset } from '@/store/content';
import { DeepReadonly } from '@/util/readonly';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import {
	AssetListRenderable,
	IDrawAssetsUnloaded,
} from './assetListRenderable';

export class Character extends AssetListRenderable<ICharacter> {
	public constructor(
		obj: DeepReadonly<ICharacter>,
		private data: DeepReadonly<CharacterModel<IAsset>>
	) {
		super(obj);
	}

	public updatedContent(store: Store<DeepReadonly<IRootState>>): void {
		this.data = getData(store, this.obj);
	}

	protected getAssetList(): IDrawAssetsUnloaded[] {
		const pose = getPose(this.data, this.obj) as Pose<IAsset>;
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
				case 'pose-part':
					const posePosition = pose.positions[renderCommand.part];
					if (!posePosition || posePosition.length === 0) {
						break;
					}
					const partAssets =
						posePosition[this.obj.posePositions[renderCommand.part] || 0];
					if (!partAssets) break;
					drawAssetsUnloaded.push({
						offset: renderCommand.offset,
						composite: renderCommand.composite,
						assets: partAssets,
					});
					break;
			}
			console.log(renderCommand, JSON.stringify(drawAssetsUnloaded));
		}
		return drawAssetsUnloaded;
	}

	protected scaleable = true;
	protected get canvasHeight(): number {
		const pose = getPose(this.data, this.obj) as Pose<IAsset>;
		return pose.size[1];
	}
	protected get canvasWidth(): number {
		const pose = getPose(this.data, this.obj) as Pose<IAsset>;
		return pose.size[0];
	}

	public get width() {
		const zoom = this.obj.close ? 2 : 1;
		return this.obj.width * zoom;
	}

	public get height() {
		const zoom = this.obj.close ? 2 : 1;
		return this.obj.height * zoom;
	}
}
