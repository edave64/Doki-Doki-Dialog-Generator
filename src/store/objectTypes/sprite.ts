import { ICommand } from '@/eventbus/command';
import { getAAsset } from '@/asset-manager';
import { IObjectsState, ICreateObjectMutation, IObject } from '@/store/objects';
import { MutationTree, ActionTree } from 'vuex';
import { IRootState } from '..';
import { IAsset } from '../content';

export interface ISprite extends IObject {
	type: 'sprite';
	assets: IAsset[];
}

export const spriteMutations: MutationTree<IObjectsState> = {};

let lastSpriteId = 0;

export const spriteActions: ActionTree<IObjectsState, IRootState> = {
	async createSprite({ commit, rootState }, command: ICreateSpriteAction) {
		const asset = await getAAsset(command.assets[0], false);
		if (!(asset instanceof HTMLImageElement)) return;
		commit('create', {
			object: {
				assets: command.assets,
				flip: false,
				height: asset.height,
				width: asset.width,
				rotation: 0,
				id: 'sprite_' + ++lastSpriteId,
				panelId: rootState.panels.currentPanel,
				onTop: false,
				opacity: 100,
				preserveRatio: true,
				ratio: asset.width / asset.height,
				type: 'sprite',
				version: 0,
				x: 640,
				y: 0,
				composite: 'source-over',
				filters: [],
			} as ISprite,
		} as ICreateObjectMutation);
	},
};

export interface ICreateSpriteAction extends ICommand {
	readonly assets: IAsset[];
}
