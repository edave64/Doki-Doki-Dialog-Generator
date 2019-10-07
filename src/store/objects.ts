import { Module } from 'vuex';
import { ICommand } from '@/eventbus/command';
import { spriteMutations, spriteActions } from './objectTypes/sprite';
import { characterActions, characterMutations } from './objectTypes/characters';

export interface IObjectsState {
	objects: { [id: string]: IObject };
	order: string[];
	onTopOrder: string[];
}

export interface IObject {
	type: ObjectTypes;
	id: string;
	x: number;
	y: number;
	opacity: number;
	version: number;
	flip: boolean;
	onTop: boolean;
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
			collection.splice(command.position, 0, command.id);
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
		setFlip(state, command: ISetObjectFlipMutation) {
			const obj = state.objects[command.id];
			obj.flip = command.flip;
		},
		setOpacity(state, command: ISetObjectOpacityMutation) {
			const obj = state.objects[command.id];
			obj.opacity = command.opacity;
		},
		removeObject(state, command: IRemoveObjectMutation) {
			delete state.objects[command.id];
		},
		...spriteMutations,
		...characterMutations,
	},
	actions: {
		removeObject({ state, commit }, command: IRemoveObjectAction) {
			const obj = state.objects[command.id];
			commit('removeFromList', {
				id: command.id,
				onTop: obj.onTop,
			} as IRemoveFromListMutation);
			commit('removeObjects', {
				id: command.id,
			} as IRemoveObjectMutation);
		},
		setPosition({ state, commit, dispatch }, command: ISetPositionAction) {
			const obj = state.objects[command.id];
			if (obj.type === 'sprite') {
				commit('setPosition', command as ISetObjectPositionMutation);
			} else {
				dispatch('setCharacterPosition', command as ISetPositionAction);
			}
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
			commit('setOnTop', {
				id: command.id,
				onTop: command.onTop,
			} as ISetOnTopMutation);
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
		...spriteActions,
		...characterActions,
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

export interface ISetObjectFlipMutation extends IObjectMutation {
	readonly flip: boolean;
}

export interface ISetObjectOpacityMutation extends IObjectMutation {
	readonly opacity: number;
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

export interface ISetPositionAction extends ICommand {
	readonly x: number;
	readonly y: number;
}
