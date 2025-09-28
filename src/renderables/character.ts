import type { IAssetSwitch } from '@/store/content';
import type CharacterStore from '@/store/object-types/character';
import type { Panel } from '@/store/panels';
import { state } from '@/store/root';
import type { Character as CharacterModel } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import type { DeepReadonly } from 'ts-essentials';
import {
	AssetListRenderable,
	type IDrawAssets,
	type IDrawAssetsUnloaded,
} from './asset-list-renderable';

/**
 * Renders a character (Like Monika, Sayori, etc.) to the scene.
 */
export class Character extends AssetListRenderable<CharacterStore> {
	private data: DeepReadonly<CharacterModel<IAssetSwitch>>;

	public constructor(obj: DeepReadonly<CharacterStore>) {
		super(obj);
		this.data = state.content.characters.get(this.obj.characterType)!;
	}

	public prepareData(panel: DeepReadonly<Panel>) {
		super.prepareData(panel);
	}

	public prepareRender(lq: boolean): void | Promise<unknown> {
		return super.prepareRender(lq);
	}

	protected isAssetListOutdated(): boolean {
		return true;
	}

	protected getAssetList(): Array<IDrawAssetsUnloaded | IDrawAssets> {
		const pose = this.obj.poseData;
		const currentHeads = this.obj.headsData;
		const drawAssetsNew: Array<IDrawAssetsUnloaded | IDrawAssets> = [];
		const oldAssets = this.assetList ?? [];

		for (const renderCommand of pose.renderCommands) {
			let newAssets: IDrawAssetsUnloaded['assets'] | null = null;
			switch (renderCommand.type) {
				case 'head': {
					if (!currentHeads) continue;
					const headVariant:
						| DeepReadonly<IAssetSwitch[]>
						| undefined =
						currentHeads.variants[this.obj.posePositions.head || 0];
					if (headVariant == null) continue;
					newAssets = headVariant;
					break;
				}
				case 'image':
					newAssets = renderCommand.images;
					break;
				case 'pose-part': {
					const posePosition = pose.positions[renderCommand.part];

					if (!posePosition || posePosition.length === 0) {
						break;
					}
					const partAssets =
						posePosition[
							this.obj.posePositions[renderCommand.part] || 0
						];

					if (!partAssets) break;
					newAssets = partAssets;
					break;
				}
			}
			if (newAssets) {
				const oldEntry = oldAssets.find((x) => x.assets === newAssets);
				// Reuse old entry
				if (oldEntry) {
					drawAssetsNew.push({
						...oldEntry,
						offset: renderCommand.offset,
						composite: renderCommand.composite,
					});
				} else {
					drawAssetsNew.push({
						assets: newAssets,
						offset: renderCommand.offset,
						composite: renderCommand.composite,
					});
				}
			}
		}
		return drawAssetsNew;
	}
}
