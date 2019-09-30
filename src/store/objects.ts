import { Module } from 'vuex';
import { ICommand } from '@/eventbus/command';
import { characterCommandHandlers } from './objectTypes/character';
import {
	spriteCommandHandlers,
	ISprite,
	ICreateSpriteCommand,
} from './objectTypes/sprite';
import {
	objectCommandHandlers,
	IObject,
	ICreateObjectCommand,
	IDeleteObjectCommand,
	IRestoreObjectCommand,
} from './objectTypes/general';

export interface IObjectsState {
	objects: { [id: string]: IObject };
	order: string[];
	onTopOrder: string[];
}

export type ObjectTypes = 'sprite' | 'character';

export default {
	namespaced: true,
	state: {
		objects: {},
		order: [],
		onTopOrder: [],
	},
	mutations: {
		create(state, command: ICreateObjectMutation) {
			state.objects[command.object.id] = command.object;
			if (command.object.onTop) {
				state.onTopOrder.push(command.object.id);
			} else {
				state.order.push(command.object.id);
			}
		},
		removeFromList(state, command: IRemoveFromListMutation) {
			const collection = command.onTop ? state.onTopOrder : state.order;
			const idx = collection.indexOf(command.id);
			collection.splice(idx, 1);
		},
		addToList(state, command: IAddToListMutation) {
			const collection = command.onTop ? state.onTopOrder : state.order;
			const idx = collection.indexOf(command.id);
			collection.splice(idx, 1);
		},
		setOnTop(state, command: ISetOnTopMutation) {
			const obj = state.objects[command.id];
			obj.onTop = command.onTop;
		},
		setPosition(state, command: ISetObjectPositionMutation) {
			const obj = state.objects[command.id];
			obj.x = command.x;
			obj.y = command.y;
		},
		removeObject(state, command: IRemoveObjectMutation) {
			delete state.objects[command.id];
		},
	},
	actions: {
		removeObject({ state, commit }, command: IRemoveObjectAction) {
			const obj = state.objects[command.id];
			commit('objects/removeFromList', {
				id: command.id,
				onTop: obj.onTop,
			} as IRemoveFromListMutation);
			commit('objects/removeObjects', {
				id: command.id,
			} as IRemoveObjectMutation);
		},
		setOnTop({ state, commit }, command: IObjectSetOnTopAction) {
			const obj = state.objects[command.id];
			if (obj.onTop === command.onTop) return;
			commit('removeFromList', {
				id: command.id,
				onTop: obj.onTop,
			} as IRemoveFromListMutation);
			commit('addToList', {
				id: command.id,
				position: (command.onTop ? state.onTopOrder : state.order).length,
				onTop: command.onTop,
			} as IRemoveFromListMutation);
		},
		shiftLayer({ state, commit }, command: IObjectShiftLayerAction) {
			const obj = state.objects[command.id];
			const collection = obj.onTop ? state.onTopOrder : state.order;
			const position = collection.indexOf(obj.id);

			let newPosition = position + command.delta;
			if (newPosition < 0) {
				newPosition = 0;
			}
			if (newPosition > collection.length) {
				newPosition = collection.length;
			}
			commit('removeFromList', {
				id: command.id,
				onTop: obj.onTop,
			} as IRemoveFromListMutation);
			commit('addToList', {
				id: command.id,
				position: newPosition,
				onTop: obj.onTop,
			} as IAddToListMutation);
		},
	},
} as Module<IObjectsState, never>;

export interface ICreateObjectMutation {
	readonly object: IObject;
}

export interface IObjectMutation {
	readonly id: string;
}

export interface ISetObjectPositionMutation extends IObjectMutation {
	readonly x: number;
	readonly y: number;
}

export interface ISetOnTopMutation extends IObjectMutation {
	readonly onTop: boolean;
}

export interface IRemoveFromListMutation extends IObjectMutation {
	readonly onTop: boolean;
}

export interface IAddToListMutation extends IObjectMutation {
	readonly onTop: boolean;
	readonly position: number;
}

export interface IObjectShiftLayerAction extends ICommand {
	readonly delta: number;
}

export interface IObjectSetOnTopAction extends ICommand {
	readonly onTop: boolean;
}

export interface IRemoveObjectMutation extends ICommand {}
export interface IRemoveObjectAction extends ICommand {}

function create(state: IObjectsState, command: ICreateObjectCommand) {
	const newObj: IObject = {
		id: command.objId,
		flip: false,
		version: 0,
		x: 640,
		y: 0,
		opacity: 100,
		type: command.objType,
		onTop: command.onTop,
	};

	switch (command.objType) {
		case 'character':
		// newObj = characterCommandHandlers.create(newObj);
		// break;
		case 'sprite':
			spriteCommandHandlers.create(newObj as ISprite, command as any);
			break;
	}

	state.objects[newObj.id] = newObj;

	if (command.onTop) {
		state.onTopOrder.push(newObj.id);
	} else {
		state.order.push(newObj.id);
	}
}

function restore(state: IObjectsState, command: IRestoreObjectCommand) {
	state.objects[command.object.id] = command.object;
	const collection = command.object.onTop ? state.onTopOrder : state.order;
	collection.splice(command.position, 0, command.object.id);
}
