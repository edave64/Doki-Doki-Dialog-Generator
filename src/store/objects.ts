import { ActionContext, ActionTree, MutationTree } from 'vuex';
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
import { IAssetSwitch } from './content';
import {
	addFilter,
	IAddFilterAction,
	IHasSpriteFilters,
	IMoveFilterAction,
	IRemoveFilterAction,
	ISetFilterAction,
	moveFilter,
	removeFilter,
	setFilter,
	SpriteFilter,
} from './sprite_options';
import { IPanel, IPanels } from './panels';
import { CompositeModes } from '@/renderer/rendererContext';

export interface IObjectsState {
	nextPanelId: bigint;
	nextObjectId: bigint;
}

export interface IObject extends IHasSpriteFilters {
	type: ObjectTypes;
	panelId: IPanel['id'];
	id: number;
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
	nameboxWidth: null | number;
	zoom: number;
}

export type ObjectTypes =
	| 'sprite'
	| 'character'
	| 'textBox'
	| 'choice'
	| 'notification'
	| 'poem';

let lastCopyId = 0;

export const mutations: MutationTree<IPanels> = {
	create(state, { object }: ICreateObjectMutation) {
		const panel = state.panels[object.panelId];
		if (object.id > panel.lastObjId) panel.lastObjId = object.id;
		panel.objects[object.id] = object;
		const collection = object.onTop ? panel.onTopOrder : panel.order;
		collection.push(object.id);
	},
	removeFromList(state, command: IRemoveFromListMutation) {
		const panel = state.panels[command.panelId];
		const collection = command.onTop ? panel.onTopOrder : panel.order;
		const idx = collection.indexOf(command.id);
		collection.splice(idx, 1);
	},
	addToList(state, command: IAddToListMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		const collection = command.onTop ? panel.onTopOrder : panel.order;
		collection.splice(command.position, 0, command.id);
	},
	setOnTop(state, command: ISetOnTopMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.onTop = command.onTop;
	},
	setPosition(state, command: ISetObjectPositionMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.x = command.x;
		obj.y = command.y;
	},
	setFlip(state, command: ISetObjectFlipMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.flip = command.flip;
	},
	setSize(state, command: ISetSpriteSizeMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.width = command.width;
		obj.height = command.height;
	},
	setRatio(state, command: ISetSpriteRatioMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.preserveRatio = command.preserveRatio;
		obj.ratio = command.ratio;
	},
	setRotation(state, command: ISetSpriteRotationMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.rotation =
			command.rotation < 0
				? 360 - (Math.abs(command.rotation) % 360)
				: command.rotation % 360;
	},
	removeObject(state, command: IRemoveObjectMutation) {
		const panel = state.panels[command.panelId];
		delete panel.objects[command.id];
	},
	setComposition(state, command: ISetCompositionMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.composite = command.composite;
	},
	object_setFilters(state, command: ISetFiltersMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.filters = command.filters;
	},
	setLabel(state, command: ISetLabelMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.label = command.label;
	},
	setTextboxColor(state, command: ISetTextBoxColor) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.textboxColor = command.textboxColor;
	},
	setEnlargeWhenTalking(state, command: ISetEnlargeWhenTalkingMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id] as ITextBox;
		obj.enlargeWhenTalking = command.enlargeWhenTalking;
		++obj.version;
	},
	setObjectNameboxWidth(state, command: ISetNameboxWidthMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id] as ITextBox;
		obj.nameboxWidth = command.nameboxWidth;
		++obj.version;
	},
	setObjectZoom(state, command: ISetObjectZoomMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id] as ITextBox;
		obj.zoom = command.zoom;
		++obj.version;
	},
	...spriteMutations,
	...characterMutations,
	...textBoxMutations,
	...choiceMutations,
	...notificationMutations,
	...poemMutations,
};

export const actions: ActionTree<IPanels, IRootState> = {
	removeObject({ state, commit, rootState }, command: IRemoveObjectAction) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		if (rootState.ui.selection === command.id) {
			commit('ui/setSelection', null, { root: true });
		}
		for (const key of [...panel.onTopOrder, ...panel.order]) {
			const otherObject = panel.objects[key] as ITextBox;
			if (obj.id === key || otherObject.type !== 'textBox') continue;

			if (otherObject.talkingObjId !== obj.id) continue;

			commit('setTalkingOther', {
				id: otherObject.id,
				talkingOther: obj.label || '',
			} as ISetTextBoxTalkingOtherMutation);
		}
		commit('removeFromList', {
			id: command.id,
			panelId: command.panelId,
			onTop: obj.onTop,
		} as IRemoveFromListMutation);
		commit('removeObject', {
			id: command.id,
			panelId: command.panelId,
		} as IRemoveObjectMutation);
	},
	setPosition({ state, commit, dispatch }, command: ISetPositionAction) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		if (obj.type === 'character') {
			dispatch('setCharacterPosition', command as ISetPositionAction);
		} else {
			commit('setPosition', command as ISetObjectPositionMutation);
		}
	},
	setOnTop({ state, commit }, command: IObjectSetOnTopAction) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		if (obj.onTop === command.onTop) return;
		commit('removeFromList', {
			panelId: command.panelId,
			id: command.id,
			onTop: obj.onTop,
		} as IRemoveFromListMutation);
		commit('addToList', {
			id: command.id,
			panelId: command.panelId,
			position: (command.onTop ? panel.onTopOrder : panel.order).length,
			onTop: command.onTop,
		} as IRemoveFromListMutation);
		commit('setOnTop', {
			panelId: command.panelId,
			id: command.id,
			onTop: command.onTop,
		} as ISetOnTopMutation);
	},
	shiftLayer({ state, commit }, command: IObjectShiftLayerAction) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
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
			panelId: command.panelId,
			id: command.id,
			onTop: obj.onTop,
		} as IRemoveFromListMutation);
		commit('addToList', {
			panelId: command.panelId,
			id: command.id,
			position: newPosition,
			onTop: obj.onTop,
		} as IAddToListMutation);
	},
	setPreserveRatio({ commit, state }, command: ISetRatioAction) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		const ratio = command.preserveRatio ? obj.width / obj.height : 0;
		commit('setRatio', {
			panelId: command.panelId,
			id: command.id,
			preserveRatio: command.preserveRatio,
			ratio,
		} as ISetSpriteRatioMutation);
	},
	setWidth({ commit, state }, command: ISetWidthAction) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		const height = !obj.preserveRatio ? obj.height : command.width / obj.ratio;
		commit('setSize', {
			panelId: command.panelId,
			id: command.id,
			height,
			width: command.width,
		} as ISetSpriteSizeMutation);
	},
	setHeight({ commit, state }, command: ISetHeightAction) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		const width = !obj.preserveRatio ? obj.width : command.height * obj.ratio;
		commit('setSize', {
			panelId: command.panelId,
			id: command.id,
			height: command.height,
			width,
		} as ISetSpriteSizeMutation);
	},
	copyObjects(
		{ commit, state },
		{ sourcePanelId, targetPanelId }: ICopyObjectsAction
	) {
		const sourceOrders = state.panels[sourcePanelId];
		if (!sourceOrders) return;
		const sourcePanel = state.panels[sourcePanelId];
		const targetPanel = state.panels[targetPanelId];
		const allSourceIds = [...sourceOrders.onTopOrder, ...sourceOrders.order];
		const transationTable = new Map<IObject['id'], IObject['id']>();
		let lastObjId = targetPanel.lastObjId;
		for (const sourceId of allSourceIds) {
			const targetId = ++lastObjId;
			transationTable.set(sourceId, targetId);
		}
		for (const sourceId of allSourceIds) {
			const oldObject = state.panels[sourcePanelId].objects[sourceId];
			const newObject: IObject = JSON.parse(JSON.stringify(oldObject));
			if ('talkingObjId' in newObject) {
				const newTextbox = newObject as ITextBox;
				if (
					newTextbox.talkingObjId !== null &&
					newTextbox.talkingObjId !== '$other$' &&
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
		{ id, panelId }: ICopyObjectToClipboardAction
	) {
		const oldObject = state.panels[panelId].objects[id];
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
	object_addFilter({ state, commit }, action: IAddFilterAction) {
		addFilter(
			action,
			() => state.panels[action.panelId].objects[action.id!],
			(mutation) => commit('object_setFilters', mutation)
		);
	},
	object_removeFilter({ state, commit }, action: IRemoveFilterAction) {
		removeFilter(
			action,
			() => state.panels[action.panelId].objects[action.id!],
			(mutation) => commit('object_setFilters', mutation)
		);
	},
	object_moveFilter({ state, commit }, action: IMoveFilterAction) {
		moveFilter(
			action,
			() => state.panels[action.panelId].objects[action.id!],
			(mutation) => commit('object_setFilters', mutation)
		);
	},
	object_setFilter({ state, commit }, action: ISetFilterAction) {
		setFilter(
			action,
			() => state.panels[action.panelId].objects[action.id!],
			(mutation) => commit('object_setFilters', mutation)
		);
	},
	...spriteActions,
	...characterActions,
	...textBoxActions,
	...choiceActions,
	...notificationActions,
	...poemActions,
};

export function fixContentPackRemoval(
	context: ActionContext<IPanels, IRootState>,
	oldContent: ContentPack<IAssetSwitch>
) {
	const panels = context.state.panels;
	for (const panelId in panels) {
		const panel = panels[panelId];
		for (const objectId in panel.objects) {
			const obj = panel.objects[objectId];
			if (obj.type === 'character') {
				fixContentPackRemovalFromCharacter(
					context,
					obj.panelId,
					obj.id,
					oldContent
				);
				return;
			}
		}
	}
}

export interface ICreateObjectMutation {
	readonly object: IObject;
}

export interface IDeleteAllOfPanel {
	readonly panelId: IPanel['id'];
}

export interface IObjectMutation {
	readonly panelId: IPanel['id'];
	readonly id: IObject['id'];
}

export interface ISetSpriteSizeMutation extends IObjectMutation {
	readonly width: number;
	readonly height: number;
}

export interface ISetSpriteRatioMutation extends IObjectMutation {
	readonly preserveRatio: boolean;
	readonly ratio: number;
}

export interface ISetSpriteRotationMutation extends IObjectMutation {
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

export interface ISetLabelMutation extends IObjectMutation {
	readonly label: string;
}

export interface ISetTextBoxColor extends IObjectMutation {
	readonly textboxColor: string | null;
}

export interface ISetEnlargeWhenTalkingMutation extends IObjectMutation {
	readonly enlargeWhenTalking: boolean;
}

export interface ISetNameboxWidthMutation extends IObjectMutation {
	readonly nameboxWidth: null | number;
}

export interface ISetObjectZoomMutation extends IObjectMutation {
	readonly zoom: number;
}

export interface ISetCompositionMutation extends IObjectMutation {
	readonly composite: CompositeModes;
}

export interface ISetFiltersMutation extends IObjectMutation {
	readonly filters: SpriteFilter[];
}

export interface IObjectShiftLayerAction extends IObjectMutation {
	readonly delta: number;
}

export interface IObjectSetOnTopAction extends IObjectMutation {
	readonly onTop: boolean;
}

export interface ISetWidthAction extends IObjectMutation {
	readonly width: number;
}

export interface ISetHeightAction extends IObjectMutation {
	readonly height: number;
}

export interface ISetRatioAction extends IObjectMutation {
	readonly preserveRatio: boolean;
}

export interface IRemoveObjectMutation extends IObjectMutation {}
export interface IRemoveObjectAction extends IObjectMutation {}

export interface ISetPositionAction extends IObjectMutation {
	readonly x: number;
	readonly y: number;
}

export interface IObjectContentPackRemovalAction extends IObjectMutation {
	readonly oldPack: ContentPack<IAssetSwitch>;
}

export interface ICopyObjectsAction {
	readonly sourcePanelId: IPanel['id'];
	readonly targetPanelId: IPanel['id'];
}

export interface ICopyObjectToClipboardAction {
	readonly id: IObject['id'];
	readonly panelId: IPanel['id'];
}

export interface IPasteFromClipboardAction {
	readonly panelId: IPanel['id'];
}
