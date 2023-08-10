import { ActionContext } from 'vuex';
import { spriteMutations } from './objectTypes/sprite';
import {
	characterMutations,
	fixContentPackRemovalFromCharacter,
} from './objectTypes/characters';
import { choiceMutations } from './objectTypes/choices';
import {
	ITextBox,
	textBoxMutations,
	ISetTextBoxTalkingOtherMutation,
} from './objectTypes/textbox';
import { notificationMutations } from './objectTypes/notification';
import { poemMutations, poemActions } from './objectTypes/poem';
import { IRootthis } from '.';
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
import { IPanel, IPanels, PanelType } from './panels';
import { CompositeModes } from '@/renderer/rendererContext';
import { defineStore } from 'pinia';
import { useUiStore } from './ui';

export interface IObjectsthis {
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

export const mutations = {
	create(this: PanelType, { object }: ICreateObjectMutation) {
		const panel = this.panels[object.panelId];
		if (object.id > panel.lastObjId) panel.lastObjId = object.id;
		panel.objects[object.id] = object;
		const collection = object.onTop ? panel.onTopOrder : panel.order;
		collection.push(object.id);
	},
	removeFromList(this: PanelType, command: IRemoveFromListMutation) {
		const panel = this.panels[command.panelId];
		const collection = command.onTop ? panel.onTopOrder : panel.order;
		const idx = collection.indexOf(command.id);
		collection.splice(idx, 1);
	},
	addToList(this: PanelType, command: IAddToListMutation) {
		const panel = this.panels[command.panelId];
		const collection = command.onTop ? panel.onTopOrder : panel.order;
		collection.splice(command.position, 0, command.id);
	},
	setOnTop(this: PanelType, command: ISetOnTopMutation) {
		const panel = this.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.onTop = command.onTop;
	},
	setPosition(this: PanelType, command: ISetObjectPositionMutation) {
		const panel = this.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.x = command.x;
		obj.y = command.y;
	},
	setFlip(this: PanelType, command: ISetObjectFlipMutation) {
		const panel = this.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.flip = command.flip;
	},
	setSize(this: PanelType, command: ISetSpriteSizeMutation) {
		const panel = this.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.width = command.width;
		obj.height = command.height;
	},
	setRatio(this: PanelType, command: ISetSpriteRatioMutation) {
		const panel = this.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.preserveRatio = command.preserveRatio;
		obj.ratio = command.ratio;
	},
	setRotation(this: PanelType, command: ISetSpriteRotationMutation) {
		const panel = this.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.rotation =
			command.rotation < 0
				? 360 - (Math.abs(command.rotation) % 360)
				: command.rotation % 360;
	},
	removeObject(this: PanelType, command: IRemoveObjectMutation) {
		const panel = this.panels[command.panelId];
		delete panel.objects[command.id];
	},
	setComposition(this: PanelType, command: ISetCompositionMutation) {
		const panel = this.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.composite = command.composite;
	},
	object_setFilters(this: PanelType, command: ISetFiltersMutation) {
		const panel = this.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.filters = command.filters;
	},
	setLabel(this: PanelType, command: ISetLabelMutation) {
		const panel = this.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.label = command.label;
	},
	setTextboxColor(this: PanelType, command: ISetTextBoxColor) {
		const panel = this.panels[command.panelId];
		const obj = panel.objects[command.id];
		obj.textboxColor = command.textboxColor;
	},
	setEnlargeWhenTalking(
		this: PanelType,
		command: ISetEnlargeWhenTalkingMutation
	) {
		const panel = this.panels[command.panelId];
		const obj = panel.objects[command.id] as ITextBox;
		obj.enlargeWhenTalking = command.enlargeWhenTalking;
		++obj.version;
	},
	setObjectNameboxWidth(this: PanelType, command: ISetNameboxWidthMutation) {
		const panel = this.panels[command.panelId];
		const obj = panel.objects[command.id] as ITextBox;
		obj.nameboxWidth = command.nameboxWidth;
		++obj.version;
	},
	setObjectZoom(this: PanelType, command: ISetObjectZoomMutation) {
		const panel = this.panels[command.panelId];
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

export const actions = {
	removeObject(this: PanelType, command: IRemoveObjectAction) {
		const panel = this.panels[command.panelId];
		const obj = panel.objects[command.id];
		if (rootthis.ui.selection === command.id) {
			commit('ui/setSelection', null, { root: true });
		}
		for (const key of [...panel.onTopOrder, ...panel.order]) {
			const otherObject = panel.objects[key] as ITextBox;
			if (obj.id === key || otherObject.type !== 'textBox') continue;

			if (otherObject.talkingObjId !== obj.id) continue;

			commit('setTalkingOther', {
				id: otherObject.id,
				talkingOther: obj.label ?? '',
				panelId: command.panelId,
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
	setPosition(this: PanelType, command: ISetPositionAction) {
		const panel = this.panels[command.panelId];
		const obj = panel.objects[command.id];
		if (obj.type === 'character') {
			dispatch('setCharacterPosition', command as ISetPositionAction);
		} else {
			commit('setPosition', command as ISetObjectPositionMutation);
		}
	},
	setOnTop(this: PanelType, command: IObjectSetOnTopAction) {
		const panel = this.panels[command.panelId];
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
	shiftLayer(this: PanelType, command: IObjectShiftLayerAction) {
		const panel = this.panels[command.panelId];
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
	setPreserveRatio(this: PanelType, command: ISetRatioAction) {
		const panel = this.panels[command.panelId];
		const obj = panel.objects[command.id];
		const ratio = command.preserveRatio ? obj.width / obj.height : 0;
		commit('setRatio', {
			panelId: command.panelId,
			id: command.id,
			preserveRatio: command.preserveRatio,
			ratio,
		} as ISetSpriteRatioMutation);
	},
	setWidth(this: PanelType, command: ISetWidthAction) {
		const panel = this.panels[command.panelId];
		const obj = panel.objects[command.id];
		const height = !obj.preserveRatio ? obj.height : command.width / obj.ratio;
		commit('setSize', {
			panelId: command.panelId,
			id: command.id,
			height,
			width: command.width,
		} as ISetSpriteSizeMutation);
	},
	setHeight(this: PanelType, command: ISetHeightAction) {
		const panel = this.panels[command.panelId];
		const obj = panel.objects[command.id];
		const width = !obj.preserveRatio ? obj.width : command.height * obj.ratio;
		this.commit('setSize', {
			panelId: command.panelId,
			id: command.id,
			height: command.height,
			width,
		} as ISetSpriteSizeMutation);
	},
	copyObjects(
		this: PanelType,
		{ sourcePanelId, targetPanelId }: ICopyObjectsAction
	) {
		const sourcePanel = this.panels[sourcePanelId];
		const targetPanel = this.panels[targetPanelId];
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
			this.create({
				object: {
					...newObject,
					id: transationTable.get(sourceId)!,
					panelId: targetPanelId,
				},
			} as ICreateObjectMutation);
		}
	},
	copyObjectToClipboard(
		this: PanelType,
		{ id, panelId }: ICopyObjectToClipboardAction
	) {
		const oldObject = this.panels[panelId].objects[id];
		const ui = useUiStore();
		ui.clipboard = JSON.stringify(oldObject);
	},
	pasteObjectFromClipboard(this: PanelType) {
		const ui = useUiStore();
		if (ui.clipboard == null) return;
		const oldObject = JSON.parse(ui.clipboard);
		this.create({
			object: {
				...oldObject,
				id: this.panels[this.currentPanel].lastObjId + 1,
				panelId: this.currentPanel,
			},
		} as ICreateObjectMutation);
	},
	object_addFilter(this: PanelType, action: IAddFilterAction) {
		addFilter(
			action,
			() => this.panels[action.panelId].objects[action.id!],
			(mutation) => this.object_setFilters(mutation)
		);
	},
	object_removeFilter(this: PanelType, action: IRemoveFilterAction) {
		removeFilter(
			action,
			() => this.panels[action.panelId].objects[action.id!],
			(mutation) => this.object_setFilters(mutation)
		);
	},
	object_moveFilter(this: PanelType, action: IMoveFilterAction) {
		moveFilter(
			action,
			() => this.panels[action.panelId].objects[action.id!],
			(mutation) => this.object_setFilters(mutation)
		);
	},
	object_setFilter(this: PanelType, action: ISetFilterAction) {
		setFilter(
			action,
			() => this.panels[action.panelId].objects[action.id!],
			(mutation) => this.object_setFilters(mutation)
		);
	},
	//...spriteActions,
	//...characterActions,
	//...textBoxActions,
	//...choiceActions,
	//...notificationActions,
	//...poemActions,
};

export function fixContentPackRemoval(
	context: ActionContext<IPanels, IRootthis>,
	oldContent: ContentPack<IAssetSwitch>
) {
	const panels = context.this.panels;
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
