import { Module } from 'vuex';
import { ICommand } from '@/eventbus/command';
import { spriteMutations, spriteActions } from './objectTypes/sprite';
import {
	characterActions,
	characterMutations,
	fixContentPackRemovalFromCharacter,
} from './objectTypes/characters';
import { choiceMutations, choiceActions } from './objectTypes/choices';
import {
	ITextBox,
	textBoxActions,
	textBoxMutations,
	ISetTextBoxTalkingOtherMutation,
} from './objectTypes/textbox';
import {
	notificationMutations,
	notificationActions,
} from './objectTypes/notification';
import { poemMutations, poemActions } from './objectTypes/poem';
import { IRootState } from '.';
import { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAsset } from './content';
import {
	addFilter,
	IAddFilterAction,
	IHasSpriteFilters,
	IMoveFilterAction,
	IRemoveFilterAction,
	ISetFilterAction,
	ISetFiltersMutation,
	ISetCompositionMutation,
	moveFilter,
	removeFilter,
	setFilter,
} from './sprite_options';

export interface IPanel {
	id: string;
	order: string[];
	onTopOrder: string[];
}

export interface IObjectsState {
	objects: { [id: string]: IObject };
	panels: { [id: string]: IPanel };
}

export interface IObject extends IHasSpriteFilters {
	type: ObjectTypes;
	panelId: string;
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	preserveRatio: boolean;
	ratio: number;
	version: number;
	flip: boolean;
	onTop: boolean;
	label: null | string;
	textboxColor: string | null;
	enlargeWhenTalking: boolean;
}

export type ObjectTypes =
	| 'sprite'
	| 'character'
	| 'textBox'
	| 'choice'
	| 'notification'
	| 'poem';

let lastCopyId = 0;

export default {
	namespaced: true,
	state: {
		objects: {},
		panels: {},
	},
	mutations: {
		create(state, { object }: ICreateObjectMutation) {
			if (!state.panels[object.panelId]) {
				state.panels[object.panelId] = {
					id: object.panelId,
					onTopOrder: [],
					order: [],
				};
			}
			const panel = state.panels[object.panelId];
			const collection = object.onTop ? panel.onTopOrder : panel.order;
			state.objects[object.id] = object;
			collection.push(object.id);
		},
		removeFromList(state, command: IRemoveFromListMutation) {
			const obj = state.objects[command.id];
			const panel = state.panels[obj.panelId];
			const collection = command.onTop ? panel.onTopOrder : panel.order;
			const idx = collection.indexOf(command.id);
			collection.splice(idx, 1);
		},
		addToList(state, command: IAddToListMutation) {
			const obj = state.objects[command.id];
			const panel = state.panels[obj.panelId];
			const collection = command.onTop ? panel.onTopOrder : panel.order;
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
		setSize(state, command: ISetSpriteSizeMutation) {
			const obj = state.objects[command.id];
			obj.width = command.width;
			obj.height = command.height;
		},
		setRatio(state, command: ISetSpriteRatioMutation) {
			const obj = state.objects[command.id];
			obj.preserveRatio = command.preserveRatio;
			obj.ratio = command.ratio;
		},
		setRotation(state, command: ISetSpriteRotationMutation) {
			const obj = state.objects[command.id];
			obj.rotation =
				command.rotation < 0
					? 360 - (Math.abs(command.rotation) % 360)
					: command.rotation % 360;
		},
		removeObject(state, command: IRemoveObjectMutation) {
			const obj = state.objects[command.id];
			delete state.objects[command.id];
			const panel = state.panels[obj.panelId];
			if (panel.onTopOrder.length === 0 && panel.order.length === 0) {
				delete state.panels[obj.panelId];
			}
		},
		setComposition(state, command: ISetCompositionMutation) {
			const obj = state.objects[command.id];
			obj.composite = command.composite;
		},
		setFilters(state, command: ISetFiltersMutation) {
			const obj = state.objects[command.id];
			obj.filters = command.filters;
		},
		setLabel(state, command: ISetLabelMutation) {
			const obj = state.objects[command.id];
			obj.label = command.label;
		},
		setTextboxColor(state, command: ISetTextBoxColor) {
			const obj = state.objects[command.id];
			obj.textboxColor = command.textboxColor;
		},
		setEnlargeWhenTalking(state, command: ISetEnlargeWhenTalkingMutation) {
			const obj = state.objects[command.id] as ITextBox;
			obj.enlargeWhenTalking = command.enlargeWhenTalking;
			++obj.version;
		},
		...spriteMutations,
		...characterMutations,
		...textBoxMutations,
		...choiceMutations,
		...notificationMutations,
		...poemMutations,
	},
	actions: {
		removeObject({ state, commit, rootState }, command: IRemoveObjectAction) {
			const obj = state.objects[command.id];
			const panel = state.panels[obj.panelId];
			if (rootState.ui.selection === command.id) {
				commit('ui/setSelection', null, { root: true });
			}
			for (const key of [...panel.onTopOrder, ...panel.order]) {
				const otherObject = state.objects[key] as ITextBox;
				if (obj.id === key || otherObject.type !== 'textBox') continue;

				if (otherObject.talkingObjId !== obj.id) continue;

				commit('setTalkingOther', {
					id: otherObject.id,
					talkingOther: obj.label || '',
				} as ISetTextBoxTalkingOtherMutation);
			}
			commit('removeFromList', {
				id: command.id,
				onTop: obj.onTop,
			} as IRemoveFromListMutation);
			commit('removeObject', {
				id: command.id,
			} as IRemoveObjectMutation);
		},
		setPosition({ state, commit, dispatch }, command: ISetPositionAction) {
			const obj = state.objects[command.id];
			if (obj.type === 'character') {
				dispatch('setCharacterPosition', command as ISetPositionAction);
			} else {
				commit('setPosition', command as ISetObjectPositionMutation);
			}
		},
		setOnTop({ state, commit }, command: IObjectSetOnTopAction) {
			const obj = state.objects[command.id];
			const panel = state.panels[obj.panelId];
			if (obj.onTop === command.onTop) return;
			commit('removeFromList', {
				id: command.id,
				onTop: obj.onTop,
			} as IRemoveFromListMutation);
			commit('addToList', {
				id: command.id,
				position: (command.onTop ? panel.onTopOrder : panel.order).length,
				onTop: command.onTop,
			} as IRemoveFromListMutation);
			commit('setOnTop', {
				id: command.id,
				onTop: command.onTop,
			} as ISetOnTopMutation);
		},
		shiftLayer({ state, commit }, command: IObjectShiftLayerAction) {
			const obj = state.objects[command.id];
			const panel = state.panels[obj.panelId];
			const collection = obj.onTop ? panel.onTopOrder : panel.order;
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
		setPreserveRatio({ commit, state }, command: ISetRatioAction) {
			const obj = state.objects[command.id];
			const ratio = command.preserveRatio ? obj.width / obj.height : 0;
			commit('setRatio', {
				id: command.id,
				preserveRatio: command.preserveRatio,
				ratio,
			} as ISetSpriteRatioMutation);
		},
		setWidth({ commit, state }, command: ISetWidthAction) {
			const obj = state.objects[command.id];
			const height = !obj.preserveRatio
				? obj.height
				: command.width / obj.ratio;
			commit('setSize', {
				id: command.id,
				height,
				width: command.width,
			} as ISetSpriteSizeMutation);
		},
		setHeight({ commit, state }, command: ISetHeightAction) {
			const obj = state.objects[command.id];
			const width = !obj.preserveRatio ? obj.width : command.height * obj.ratio;
			commit('setSize', {
				id: command.id,
				height: command.height,
				width,
			} as ISetSpriteSizeMutation);
		},
		fixContentPackRemoval(context, oldContent: ContentPack<IAsset>) {
			Object.values(context.state.objects).map(obj => {
				switch (obj.type) {
					case 'character':
						fixContentPackRemovalFromCharacter(context, obj.id, oldContent);
						return;
					case 'sprite':
						return;
					case 'textBox':
						return;
				}
			});
		},
		copyObjects(
			{ commit, state },
			{ sourcePanelId, targetPanelId }: ICopyObjectsAction
		) {
			const sourceOrders = state.panels[sourcePanelId];
			if (!sourceOrders) return;
			const allSourceIds = [...sourceOrders.onTopOrder, ...sourceOrders.order];
			const transationTable = new Map<string, string>();
			for (const sourceId of allSourceIds) {
				const targetId = `copy_${++lastCopyId}`;
				transationTable.set(sourceId, targetId);
			}
			for (const sourceId of allSourceIds) {
				const oldObject = state.objects[sourceId];
				const newObject: IObject = JSON.parse(JSON.stringify(oldObject));
				if ('talkingObjId' in newObject) {
					const newTextbox = newObject as ITextBox;
					if (
						newTextbox.talkingObjId !== null &&
						transationTable.has(newTextbox.talkingObjId)
					) {
						newTextbox.talkingObjId = transationTable.get(
							newTextbox.talkingObjId
						)!;
					}
				}
				commit('create', {
					object: {
						...newObject,
						id: transationTable.get(sourceId)!,
						panelId: targetPanelId,
					},
				} as ICreateObjectMutation);
			}
		},
		copyObjectToClipboard(
			{ commit, state },
			{ id }: ICopyObjectToClipboardAction
		) {
			const oldObject = state.objects[id];
			commit('ui/setClipboard', JSON.stringify(oldObject), { root: true });
		},
		pasteObjectFromClipboard({ commit, rootState }) {
			if (!rootState.ui.clipboard) return;
			const oldObject = JSON.parse(rootState.ui.clipboard);
			commit('create', {
				object: {
					...oldObject,
					id: `copy_${++lastCopyId}`,
					panelId: rootState.panels.currentPanel,
				},
			} as ICreateObjectMutation);
		},
		deleteAllOfPanel({ state, dispatch }, { panelId }: IDeleteAllOfPanel) {
			const panel = state.panels[panelId];
			for (const id of [...panel.onTopOrder, ...panel.order]) {
				dispatch('removeObject', { id } as IRemoveObjectAction);
			}
		},
		addFilter({ state, commit }, action: IAddFilterAction) {
			addFilter(
				action,
				(id: string) => state.objects[id],
				mutation => commit('setFilters', mutation)
			);
		},
		removeFilter({ state, commit }, action: IRemoveFilterAction) {
			removeFilter(
				action,
				(id: string) => state.objects[id],
				mutation => commit('setFilters', mutation)
			);
		},
		moveFilter({ state, commit }, action: IMoveFilterAction) {
			moveFilter(
				action,
				(id: string) => state.objects[id],
				mutation => commit('setFilters', mutation)
			);
		},
		setFilter({ state, commit }, action: ISetFilterAction) {
			setFilter(
				action,
				(id: string) => state.objects[id],
				mutation => commit('setFilters', mutation)
			);
		},
		...spriteActions,
		...characterActions,
		...textBoxActions,
		...choiceActions,
		...notificationActions,
		...poemActions,
	},
} as Module<IObjectsState, IRootState>;

export interface ICreateObjectMutation {
	readonly object: IObject;
}

export interface IDeleteAllOfPanel {
	readonly panelId: string;
}

export interface IObjectMutation {
	readonly id: string;
}

export interface ISetSpriteSizeMutation extends ICommand {
	readonly width: number;
	readonly height: number;
}

export interface ISetSpriteRatioMutation extends ICommand {
	readonly preserveRatio: boolean;
	readonly ratio: number;
}

export interface ISetSpriteRotationMutation extends ICommand {
	readonly rotation: number;
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

export interface IRemoveFromListMutation extends IObjectMutation {
	readonly onTop: boolean;
}

export interface IAddToListMutation extends IObjectMutation {
	readonly onTop: boolean;
	readonly position: number;
}

export interface ISetLabelMutation extends ICommand {
	readonly label: string;
}

export interface ISetTextBoxColor extends ICommand {
	readonly textboxColor: string | null;
}

export interface ISetEnlargeWhenTalkingMutation extends ICommand {
	readonly enlargeWhenTalking: boolean;
}

export interface IObjectShiftLayerAction extends ICommand {
	readonly delta: number;
}

export interface IObjectSetOnTopAction extends ICommand {
	readonly onTop: boolean;
}

export interface ISetWidthAction extends ICommand {
	readonly width: number;
}

export interface ISetHeightAction extends ICommand {
	readonly height: number;
}

export interface ISetRatioAction extends ICommand {
	readonly preserveRatio: boolean;
}

export interface IRemoveObjectMutation extends ICommand {}
export interface IRemoveObjectAction extends ICommand {}

export interface ISetPositionAction extends ICommand {
	readonly x: number;
	readonly y: number;
}

export interface IObjectContentPackRemovalAction extends ICommand {
	readonly oldPack: ContentPack<IAsset>;
}

export interface ICopyObjectsAction {
	readonly sourcePanelId: string;
	readonly targetPanelId: string;
}

export interface ICopyObjectToClipboardAction {
	readonly id: string;
}

export interface IPasteFromClipboardAction {
	readonly panelId: string;
}
