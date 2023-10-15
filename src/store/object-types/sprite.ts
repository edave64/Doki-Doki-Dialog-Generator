import { getAAsset } from '@/asset-manager';
import { ImageAsset } from '@/render-utils/assets/image-asset';
import { ICreateObjectMutation, IObject } from '@/store/objects';
import { ActionTree, MutationTree } from 'vuex';
import { IRootState } from '..';
import { IAssetSwitch } from '../content';
import { IPanel, IPanels } from '../panels';
import { baseProps } from './base-object-props';

export interface ISprite extends IObject {
	type: 'sprite';
	assets: IAssetSwitch[];
}

export const spriteMutations: MutationTree<IPanels> = {};

export const spriteActions: ActionTree<IPanels, IRootState> = {
	async createSprite(
		{ commit, rootState, state },
		command: ICreateSpriteAction
	): Promise<IObject['id'] | undefined> {
		const asset = await getAAsset(command.assets[0], false);
		if (!(asset instanceof ImageAsset)) return;
		const id = state.panels[command.panelId].lastObjId + 1;
		commit('create', {
			object: {
				...baseProps(),
				assets: command.assets,
				height: asset.height,
				width: asset.width,
				id,
				panelId: rootState.panels.currentPanel,
				onTop: false,
				preserveRatio: true,
				ratio: asset.width / asset.height,
				type: 'sprite',
				y: 0,
				enlargeWhenTalking: rootState.ui.defaultCharacterTalkingZoom,
			} as ISprite,
		} as ICreateObjectMutation);
		return id;
	},
};

export interface ICreateSpriteAction {
	readonly assets: IAssetSwitch[];
	readonly panelId: IPanel['id'];
}
