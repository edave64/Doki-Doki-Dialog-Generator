import { ICommand } from '@/eventbus/command';
import { getAsset } from '@/asset-manager';
import { IObjectsState, ICreateObjectMutation, IObject } from '@/store/objects';
import { MutationTree, ActionTree } from 'vuex';

export interface ISprite extends IObject {
	type: 'sprite';
	assetName: string;
	width: number;
	height: number;
	preserveRatio: boolean;
	ratio: number;
}

export const spriteMutations: MutationTree<IObjectsState> = {
	setSize(state, command: ISetSpriteSizeMutation) {
		const obj = state.objects[command.id] as ISprite;
		obj.width = command.width;
		obj.height = command.height;
	},
	setRatio(state, command: ISetSpriteRatioMutation) {
		const obj = state.objects[command.id] as ISprite;
		obj.preserveRatio = command.preserveRatio;
		obj.ratio = command.ratio;
	},
};

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
	setPreserveRatio({ commit, state }, command: ISetSpriteRatioAction) {
		const obj = state.objects[command.id] as ISprite;
		const ratio = command.preserveRatio ? obj.width / obj.height : 0;
		commit('setRatio', {
			id: command.id,
			preserveRatio: command.preserveRatio,
			ratio,
		} as ISetSpriteRatioMutation);
	},
	setWidth({ commit, state }, command: ISetSpriteWidthAction) {
		const obj = state.objects[command.id] as ISprite;
		const height = !obj.preserveRatio ? obj.height : command.width / obj.ratio;
		commit('setSize', {
			id: command.id,
			height,
			width: command.width,
		} as ISetSpriteSizeMutation);
	},
	setHeight({ commit, state }, command: ISetSpriteHeightAction) {
		const obj = state.objects[command.id] as ISprite;
		const width = !obj.preserveRatio ? obj.width : command.height * obj.ratio;
		commit('setSize', {
			id: command.id,
			height: command.height,
			width,
		} as ISetSpriteSizeMutation);
	},
};

export interface ISetSpriteSizeMutation extends ICommand {
	readonly width: number;
	readonly height: number;
}

export interface ISetSpriteRatioMutation extends ICommand {
	readonly preserveRatio: boolean;
	readonly ratio: number;
}

export interface ISetSpriteWidthAction extends ICommand {
	readonly width: number;
}

export interface ISetSpriteHeightAction extends ICommand {
	readonly height: number;
}

export interface ISetSpriteRatioAction extends ICommand {
	readonly preserveRatio: boolean;
}

export interface ICreateSpriteAction extends ICommand {
	readonly assetName: string;
}
