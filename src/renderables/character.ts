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
import { IAssetSwitch } from '@/store/content';
import { DeepReadonly } from 'ts-essentials';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import {
	AssetListRenderable,
	IDrawAssetsUnloaded,
} from './assetListRenderable';
import { IPanel } from '@/store/panels';

export class Character extends AssetListRenderable<ICharacter> {
	public constructor(
		obj: DeepReadonly<ICharacter>,
		private data: DeepReadonly<CharacterModel<IAssetSwitch>>
	) {
		super(obj);
	}

	public updatedContent(
		store: Store<DeepReadonly<IRootState>>,
		panelId: IPanel['id']
	): void {
		super.updatedContent(store, panelId);
		this.data = getData(store, this.obj);
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
		}
		return drawAssetsUnloaded;
	}

	protected scaleable = true;
	protected get canvasHeight(): number {
		const pose = getPose(this.data, this.obj) as Pose<IAssetSwitch>;
		return pose.size[1];
	}
	protected get canvasWidth(): number {
		const pose = getPose(this.data, this.obj) as Pose<IAssetSwitch>;
		return pose.size[0];
	}

	public get closeZoom(): number {
		let zoom = 1;
		if (this.obj.close) zoom *= 2;
		return zoom;
	}

	public get width() {
		return this.obj.width * this.closeZoom;
	}

	public get height() {
		return this.obj.height * this.closeZoom;
	}
}
