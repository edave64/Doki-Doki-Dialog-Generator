import { useViewportStore } from '@/newStore/viewport';
import { getMainSceneRenderer } from '@/renderables/main-scene-renderer';
import type { Renderable } from '@/renderables/renderable';
import type { CompositeModes } from '@/renderer/renderer-context';
import { decomposeMatrix } from '@/util/math';
import type { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import type { ActionContext, ActionTree, MutationTree } from 'vuex';
import type { IRootState } from '.';
import type { IAssetSwitch } from './content';
import {
	characterActions,
	characterMutations,
	fixContentPackRemovalFromCharacter,
} from './object-types/characters';
import { choiceActions, choiceMutations } from './object-types/choices';
import {
	notificationActions,
	notificationMutations,
} from './object-types/notification';
import { poemActions, poemMutations } from './object-types/poem';
import { spriteActions, spriteMutations } from './object-types/sprite';
import {
	type ISetTextBoxTalkingOtherMutation,
	type ITextBox,
	textBoxActions,
	textBoxMutations,
} from './object-types/textbox';
import type { IPanel, IPanels } from './panels';
import {
	addFilter,
	type IAddFilterAction,
	type IHasSpriteFilters,
	type IMoveFilterAction,
	type IRemoveFilterAction,
	type ISetFilterAction,
	moveFilter,
	removeFilter,
	setFilter,
	type SpriteFilter,
} from './sprite-options';

export interface IObjectsState {
	nextPanelId: bigint;
	nextObjectId: bigint;
}

export interface IObject extends IHasSpriteFilters {
	type: ObjectTypes;
	panelId: IPanel['id'];
	overflow?: boolean;
	id: number;
	linkedTo: number | null;
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	ratio: number;
	version: number;
	flip: boolean;
	onTop: boolean;
	label: null | string;
	textboxColor: string | null;
	enlargeWhenTalking: boolean;
	nameboxWidth: null | number;
	scaleX: number;
	scaleY: number;
	skewX: number;
	skewY: number;
	preserveRatio: boolean;
}

export type ObjectTypes =
	| 'sprite'
	| 'character'
	| 'textBox'
	| 'choice'
	| 'notification'
	| 'poem';

export interface IHasOverflow {
	overflow?: boolean;
}

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
		obj.x = roundTo2Dec(command.x);
		obj.y = roundTo2Dec(command.y);
	},
	setLink(state, command: ISetLinkMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];

		let check = panel.objects[command.link!] as IObject | undefined;
		if (!check && command.link!)
			throw new Error('Linked object does not exist.');
		if (check === obj) throw new Error('Object cannot link to itself.');
		while (check) {
			check = panel.objects[check.linkedTo!] as IObject | undefined;
			if (check === obj)
				throw new Error('Objects cannot be linked recursively.');
		}

		obj.linkedTo = command.link;
		obj.x = roundTo2Dec(command.x);
		obj.y = roundTo2Dec(command.y);
		obj.rotation = roundTo2Dec(command.rotation);
		obj.scaleX = roundTo2Dec(command.scaleX);
		obj.scaleY = roundTo2Dec(command.scaleY);
		obj.skewX = roundTo2Dec(command.skewX);
		obj.skewY = roundTo2Dec(command.skewY);
	},
	setFlip(state, command: ISetObjectFlipMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.flip = command.flip;
	},
	setSize(state, command: ISetSpriteSizeMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.width = Math.round(command.width * 100) / 100;
		obj.height = Math.round(command.height * 100) / 100;
		++obj.version;
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
		++obj.version;
	},
	setTextboxColor(state, command: ISetTextBoxColor) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.textboxColor = command.textboxColor;
		++obj.version;
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
	setObjectScale(state, command: ISetObjectScaleMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id] as ITextBox;
		obj.scaleX = command.scaleX;
		obj.scaleY = command.scaleY;
		++obj.version;
	},
	setObjectSkew(state, command: ISetObjectSkewMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id] as ITextBox;
		obj.skewX =
			command.skewX < 0
				? 180 - (Math.abs(command.skewX) % 180)
				: command.skewX % 180;
		obj.skewY =
			command.skewY < 0
				? 180 - (Math.abs(command.skewY) % 180)
				: command.skewY % 180;
		++obj.version;
	},
	setOverflow(state, command: ISetOverflowMutation) {
		const panel = state.panels[command.panelId];
		const obj = panel.objects[command.id] as ITextBox;
		if (!('overflow' in obj)) return;
		obj.overflow = command.overflow;
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
		const viewportStore = useViewportStore();

		for (const viewport of Object.values(viewportStore.viewports)) {
			if (viewport.selection === command.id) {
				viewport.selection = null;
			}
		}
		for (const key of [...panel.onTopOrder, ...panel.order]) {
			if (obj.id === key) continue;
			const otherObject = panel.objects[key] as ITextBox;
			if (otherObject.linkedTo === obj.id) {
				// TODO: This sucks. The store should not depend on the renderers. Yes, often the edited object will be
				// currently visible. But at least once I add undo, this will be a problem.
				// Also this demands that nothing ever is removed before the preview renderer sets up the scene
				// renderer.
				// Also also, iterating over all viewports twice, but at least it's not super common :/
				// Maybe during the pinia migration the matricies can be computed by the store? Obviously, it needs it.
				let otherObjRender: Renderable<IObject> | null = null;
				for (const viewport of Object.values(viewportStore.viewports)) {
					otherObjRender =
						getMainSceneRenderer(
							null!,
							viewport
						)?.getLastRenderObject(otherObject.id) ?? null;
					if (otherObjRender) break;
				}
				if (otherObjRender) {
					commit('setLink', {
						panelId: command.panelId,
						id: otherObject.id,
						link: null,
						...decomposeMatrix(otherObjRender.preparedTransform),
					} as ISetLinkMutation);
				} else {
					commit('setLink', {
						panelId: command.panelId,
						id: otherObject.id,
						link: null,
						rotation: otherObject.rotation,
						scaleX: otherObject.scaleX,
						scaleY: otherObject.scaleY,
						skewX: otherObject.skewX,
						skewY: otherObject.skewY,
						x: otherObject.x,
						y: otherObject.y,
					} as ISetLinkMutation);
				}
			}
			if (
				otherObject.type === 'textBox' &&
				otherObject.talkingObjId === obj.id
			) {
				commit('setTalkingOther', {
					id: otherObject.id,
					talkingOther: obj.label ?? '',
					panelId: command.panelId,
				} as ISetTextBoxTalkingOtherMutation);
			}
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
	copyObjects(
		{ commit, state },
		{ sourcePanelId, targetPanelId }: ICopyObjectsAction
	) {
		const sourcePanel = state.panels[sourcePanelId];
		const targetPanel = state.panels[targetPanelId];
		const allSourceIds = [...sourcePanel.onTopOrder, ...sourcePanel.order];
		const transationTable = new Map<IObject['id'], IObject['id']>();
		let lastObjId = targetPanel.lastObjId;
		for (const sourceId of allSourceIds) {
			const targetId = ++lastObjId;
			transationTable.set(sourceId, targetId);
		}
		for (const sourceId of allSourceIds) {
			const oldObject = sourcePanel.objects[sourceId];
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
		const panel = state.panels[panelId];
		const baseObject = panel.objects[id];
		const allObject = Object.values(panel.objects);
		const objects = [baseObject];
		collectLinks(baseObject);

		function collectLinks(from: IObject, direct = true) {
			if (!direct && from === baseObject)
				throw new Error('Recursively linked object');
			for (const obj of allObject) {
				if (obj.linkedTo === from.id) {
					objects.push(obj);
					collectLinks(obj, false);
				}
			}
		}
		commit('ui/setClipboard', JSON.stringify(objects), { root: true });
	},
	pasteObjectFromClipboard(
		{ commit, state, rootState },
		{ panelId }: IPasteFromClipboardAction
	) {
		if (rootState.ui.clipboard == null) return;
		const newObjects: IObject[] = JSON.parse(rootState.ui.clipboard);
		const panel = state.panels[panelId];
		const newIds = new Map<IObject['id'], IObject['id']>();
		let id = panel.lastObjId;

		for (const obj of newObjects) {
			const newId = ++id;
			newIds.set(obj.id, newId);
			obj.id = newId;
		}

		for (const obj of newObjects) {
			if (obj.linkedTo != null) {
				obj.linkedTo = newIds.get(obj.linkedTo) ?? null;
			}

			commit('create', {
				object: {
					...obj,
					panelId,
				},
			} as ICreateObjectMutation);
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
			}
		}
	}
}

function roundTo2Dec(val: number): number {
	return Math.round(val * 100) / 100;
}

export interface ICreateObjectMutation {
	readonly object: IObject;
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

export interface ISetLinkMutation extends IObjectMutation {
	readonly link: IObject['id'] | null;
	readonly x: IObject['x'];
	readonly y: IObject['y'];
	readonly scaleX: IObject['id'];
	readonly scaleY: IObject['id'];
	readonly skewX: IObject['id'];
	readonly skewY: IObject['id'];
	readonly rotation: IObject['id'];
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

export interface ISetObjectScaleMutation extends IObjectMutation {
	readonly scaleX: number;
	readonly scaleY: number;
}

export interface ISetObjectSkewMutation extends IObjectMutation {
	readonly skewX: number;
	readonly skewY: number;
}

export interface ISetCompositionMutation extends IObjectMutation {
	readonly composite: CompositeModes;
}

export interface ISetFiltersMutation extends IObjectMutation {
	readonly filters: SpriteFilter[];
}

export interface ISetOverflowMutation extends IObjectMutation {
	readonly overflow: boolean;
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IRemoveObjectMutation extends IObjectMutation {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
