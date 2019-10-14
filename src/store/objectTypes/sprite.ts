import { ICommand } from '@/eventbus/command';
import { getAsset } from '@/asset-manager';
import {
	IObjectsState,
	ICreateObjectMutation,
	IObject,
	ISetSpriteSizeMutation,
	ISetSpriteRatioMutation,
} from '@/store/objects';
import { MutationTree, ActionTree } from 'vuex';

export interface ISprite extends IObject {
	type: 'sprite';
	assetName: string;
}

export const spriteMutations: MutationTree<IObjectsState> = {};

let lastSpriteId = 0;

export const spriteActions: ActionTree<IObjectsState, never> = {
	async createSprite({ state, commit }, command: ICreateSpriteAction) {
		const asset = await getAsset(command.assetName, false);
		if (!(asset instanceof HTMLImageElement)) return;
		commit('create', {
			object: {
				assetName: command.assetName,
				flip: false,
				height: asset.height,
				width: asset.width,
				id: 'sprite_' + ++lastSpriteId,
				onTop: false,
				opacity: 100,
				preserveRatio: true,
				ratio: asset.width / asset.height,
				type: 'sprite',
				version: 0,
				x: 640,
				y: 0,
			} as ISprite,
		} as ICreateObjectMutation);
	},
};

export interface ICreateSpriteAction extends ICommand {
	readonly assetName: string;
}
