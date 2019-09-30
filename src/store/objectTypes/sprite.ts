import { IObject, ICreateObjectCommand } from './general';
import {
	CommandDirection,
	ICommand,
	reverseGenerators,
} from '@/eventbus/command';
import { getAsset } from '@/asset-manager';
import { ErrorAsset } from '@/models/error-asset';
import {
	IObjectsState,
	ICreateObjectMutation,
	IAddToListMutation,
} from '../objects';
import { MutationTree, ActionTree } from 'vuex';

export interface ISprite extends IObject {
	type: 'sprite';
	assetName: string;
	width: number;
	height: number;
	preserveRatio: boolean;
	ratio: number;
}

export const mustations: MutationTree<IObjectsState> = {};

export const actions: ActionTree<IObjectsState, never> = {
	async createSprite({ state, commit }, command: ICreateSpriteCommand) {
		const asset = await getAsset(command.assetName, false);
		if (!(asset instanceof HTMLImageElement)) return;
		commit('objects/create', {
			object: {
				assetName: command.assetName,
				flip: false,
				height: asset.height,
				width: asset.width,
				id: command.id,
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
		commit('objects/addToList', {
			id: command.id,
			onTop: false,
			position: state.order.length,
		} as IAddToListMutation);
	},
};

export const spriteCommandHandlers = {
	create(obj: ISprite, command: ICreateSpriteCommand) {
		obj.width = command.typeData.width;
		obj.height = command.typeData.height;
		obj.assetName = command.typeData.assetName;
		obj.preserveRatio = true;
		obj.ratio = obj.width / obj.height;
	},

	setSize(obj: ISprite, command: ISetSpriteSizeCommand) {
		obj.width = command.width;
		obj.height = command.height;
	},

	setRatioLock(obj: ISprite, command: ISetSpriteRatioLockCommand) {
		obj.preserveRatio = command.lock;
		obj.ratio = command.ratio;
	},
};

export interface ICreateSpriteCommand extends ICreateObjectCommand {
	readonly assetName: string;
	readonly width: number;
	readonly height: number;
}

let lastSpriteId = 0;

export async function createSprite(
	assetName: string,
	undoable: boolean = true
): Promise<ICreateSpriteCommand> {
	const asset = await getAsset(assetName, false);
	const width = asset instanceof ErrorAsset ? 0 : asset.width;
	const height = asset instanceof ErrorAsset ? 0 : asset.height;

	return {
		target: 'obj',
		objId: 'obj_sprite_' + ++lastSpriteId,
		undoable,
		compactable: false,
		desc: 'created sprite',
		direction: CommandDirection.Apply,
		objType: 'sprite',
		onTop: false,
		reverseData: null,
		type: 'create',
		typeData: {
			assetName,
			width,
			height,
		},
	};
}

interface ISetSpriteSizeCommand extends ICommand {
	type: 'setSize';
	width: number;
	height: number;
	reverseData: {
		width: number;
		height: number;
	};
}

export function createSetWidthCommand(
	store: any,
	objId: string,
	width: number,
	compactable: boolean = true,
	undoable: boolean = true
): ISetSpriteSizeCommand {
	const objs = store.state.objects as IObjectsState;
	const obj = objs.objects[objId] as ISprite;
	let height = obj.height;

	if (obj.preserveRatio) {
		height = width / obj.ratio;
	}

	return {
		type: 'setSize',
		desc: `Set ${obj.type} size`,
		direction: CommandDirection.Apply,
		compactable,
		target: objId,
		undoable,
		width,
		height,
		reverseData: {
			width: obj.width,
			height: obj.height,
		},
	};
}

export function createSetHeightCommand(
	store: any,
	objId: string,
	height: number,
	compactable: boolean = true,
	undoable: boolean = true
): ISetSpriteSizeCommand {
	const objs = store.state.objects as IObjectsState;
	const obj = objs.objects[objId] as ISprite;
	let width = obj.width;

	if (obj.preserveRatio) {
		width = width * obj.ratio;
	}

	return {
		type: 'setSize',
		desc: `Set ${obj.type} size`,
		direction: CommandDirection.Apply,
		compactable,
		target: objId,
		undoable,
		width,
		height,
		reverseData: {
			width: obj.width,
			height: obj.height,
		},
	};
}

reverseGenerators.setSize = (((input: ISetSpriteSizeCommand) => ({
	compactable: input.compactable,
	desc: input.desc,
	direction: input.direction,
	target: input.target,
	type: 'setSize',
	undoable: input.undoable,
	height: input.reverseData.height,
	width: input.reverseData.width,
	reverseData: {
		height: input.height,
		width: input.width,
	},
})) as ((input: ISetSpriteSizeCommand) => ISetSpriteSizeCommand)) as any;

interface ISetSpriteRatioLockCommand extends ICommand {
	type: 'setRatioLock';
	lock: boolean;
	ratio: number;
	reverseData: {
		lock: boolean;
		ratio: number;
	};
}

export function createRatioLockCommand(
	store: any,
	objId: string,
	lock: boolean,
	compactable: boolean = true,
	undoable: boolean = true
): ISetSpriteRatioLockCommand {
	const objs = store.state.objects as IObjectsState;
	const obj = objs.objects[objId] as ISprite;

	return {
		type: 'setRatioLock',
		desc: `Set ${obj.type} ratio lock`,
		direction: CommandDirection.Apply,
		compactable,
		target: objId,
		undoable,
		lock,
		ratio: !lock ? 0 : obj.width / obj.height,
		reverseData: {
			lock: obj.preserveRatio,
			ratio: obj.ratio,
		},
	};
}

reverseGenerators.setRatioLock = (((input: ISetSpriteRatioLockCommand) => ({
	compactable: input.compactable,
	desc: input.desc,
	direction: input.direction,
	target: input.target,
	type: 'setRatioLock',
	undoable: input.undoable,
	lock: input.reverseData.lock,
	ratio: input.reverseData.ratio,
	reverseData: {
		lock: input.lock,
		ratio: input.ratio,
	},
})) as ((
	input: ISetSpriteRatioLockCommand
) => ISetSpriteRatioLockCommand)) as any;
