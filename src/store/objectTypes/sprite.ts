import { ICommand } from '@/eventbus/command';
import { getAAsset } from '@/asset-manager';
import { IObjectsState, ICreateObjectMutation, IObject } from '@/store/objects';
import { MutationTree, ActionTree } from 'vuex';
import { IRootState } from '..';
import { IAssetSwitch } from '../content';
import { baseProps } from './baseObjectProps';
import { ImageAsset } from '@/render-utils/assets/image-asset';

export interface ISprite extends IObject {
	type: 'sprite';
	assets: IAssetSwitch[];
}

export const spriteMutations: MutationTree<IObjectsState> = {};

let lastSpriteId = 0;

export const spriteActions: ActionTree<IObjectsState, IRootState> = {
	async createSprite({ commit, rootState }, command: ICreateSpriteAction) {
		const asset = await getAAsset(command.assets[0], false);
		debugger;
		if (!(asset instanceof ImageAsset)) return;
		commit('create', {
			object: {
				...baseProps(),
				assets: command.assets,
				height: asset.height,
				width: asset.width,
				id: 'sprite_' + ++lastSpriteId,
				panelId: rootState.panels.currentPanel,
				onTop: false,
				preserveRatio: true,
				ratio: asset.width / asset.height,
				type: 'sprite',
				y: 0,
				enlargeWhenTalking: rootState.ui.defaultCharacterTalkingZoom,
			} as ISprite,
		} as ICreateObjectMutation);
	},
};

export interface ICreateSpriteAction extends ICommand {
	readonly assets: IAssetSwitch[];
}
