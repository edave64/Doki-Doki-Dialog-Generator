import { getAAsset } from '@/asset-manager';
import getConstants from '@/constants';
import { ImageAsset } from '@/render-utils/assets/image-asset';
import type { ICreateObjectMutation, IObject } from '@/store/objects';
import type { ActionTree, MutationTree } from 'vuex';
import type { IRootState } from '..';
import type { IAssetSwitch } from '../content';
import type { IPanel, IPanels } from '../panels';
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
				panelId: command.panelId,
				onTop: false,
				type: 'sprite',
				y: getConstants().Base.screenHeight / 2,
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
