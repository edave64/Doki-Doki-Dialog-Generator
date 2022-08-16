import {
	ICreateObjectMutation,
	IObject,
	ISetObjectPositionMutation,
	ISetObjectFlipMutation,
	ISetSpriteRotationMutation,
	IObjectMutation,
} from '@/store/objects';
import { IPanel, IPanels } from '@/store/panels';
import { MutationTree, ActionTree } from 'vuex';
import { ISetSpriteSizeMutation } from './characters';
import { IRootState } from '..';
import { baseProps } from './baseObjectProps';
import { rotateAround } from '@/util/rotation';
import getConstants from '@/constants';
import { rendererLookup } from '@/renderables/textbox';
import { between } from '@/util/math';

export interface ITextBox extends IObject {
	type: 'textBox';
	text: string;
	talkingObjId: null | '$other$' | IObject['id'];
	talkingOther: string;
	style:
		| 'normal'
		| 'normal_plus'
		| 'corrupt'
		| 'corrupt_plus'
		| 'custom'
		| 'custom_plus'
		| 'none';
	overrideColor: boolean;
	customColor: string;
	deriveCustomColors: boolean;
	customControlsColor: string;
	customNameboxColor: string;
	customNameboxStroke: string;
	customNameboxWidth: number | null;
	controls: boolean;
	skip: boolean;
	autoQuoting: boolean;
	autoWrap: boolean;
	continue: boolean;
	resetBounds: {
		x: number;
		y: number;
		width: number;
		height: number;
		rotation: number;
	};
}

const splitTextboxSpacing = 4;

export const textBoxMutations: MutationTree<IPanels> = {
	setTalkingObject(state, command: ISetTextBoxTalkingObjMutation) {
		const obj = state.panels[command.panelId].objects[command.id] as ITextBox;
		obj.talkingObjId = command.talkingObjId;
		++obj.version;
	},
	setTalkingOther(state, command: ISetTextBoxTalkingOtherMutation) {
		const obj = state.panels[command.panelId].objects[command.id] as ITextBox;
		obj.talkingOther = command.talkingOther;
		obj.talkingObjId = '$other$';
		++obj.version;
	},
	setResetBounds(state, command: ISetResetBoundsMutation) {
		const obj = state.panels[command.panelId].objects[command.id] as ITextBox;
		obj.resetBounds = command.resetBounds;
		obj.x = command.resetBounds.x;
		obj.y = command.resetBounds.y;
		obj.height = command.resetBounds.height;
		obj.width = command.resetBounds.width;
		obj.rotation = command.resetBounds.rotation;
		++obj.version;
	},
	setTextBoxProperty<T extends TextBoxSimpleProperties>(
		state: IPanels,
		command: ISetTextBoxProperty<T>
	) {
		const obj = state.panels[command.panelId].objects[command.id] as ITextBox;
		obj[command.key] = command.value;
		++obj.version;
	},
};

export const textBoxActions: ActionTree<IPanels, IRootState> = {
	createTextBox(
		{ commit, state, rootState },
		command: ICreateTextBoxAction
	): IObject['id'] {
		const constants = getConstants();
		const id = state.panels[command.panelId].lastObjId + 1;
		const style = constants.TextBox.DefaultTextboxStyle;
		const renderer = rendererLookup[style];

		const resetBounds = command.resetBounds || {
			x: renderer.defaultX,
			y: renderer.defaultY,
			width: renderer.defaultWidth,
			height: renderer.defaultHeight,
			rotation: 0,
		};
		commit('create', {
			object: {
				...baseProps(),
				...resetBounds,
				panelId: rootState.panels.currentPanel,
				id,
				onTop: true,
				type: 'textBox',
				preserveRatio: false,
				ratio: constants.TextBox.TextBoxWidth / constants.TextBox.TextBoxHeight,
				continue: true,
				controls: true,
				skip: true,
				autoQuoting: true,
				autoWrap: true,
				style,
				overrideColor: false,
				customColor: constants.TextBoxCustom.textboxDefaultColor,
				deriveCustomColors: true,
				customControlsColor: constants.TextBoxCustom.controlsDefaultColor,
				customNameboxColor: constants.TextBoxCustom.nameboxDefaultColor,
				customNameboxWidth: null,
				customNameboxStroke: constants.TextBoxCustom.nameboxStrokeDefaultColor,
				talkingObjId: null,
				talkingOther: '',
				text: command.text ?? 'Click here to edit the textbox',
				resetBounds,
			} as ITextBox,
		} as ICreateObjectMutation);
		return id;
	},

	setStyle({ state, commit }, command: ISetTextBoxStyleAction) {
		const constants = getConstants();
		const obj = state.panels[command.panelId].objects[command.id] as ITextBox;
		const oldRenderer = rendererLookup[obj.style];
		const newRenderer = rendererLookup[command.style];

		const safetyMargin = 10;

		let updatePos = false;
		const posUpdate = {
			panelId: command.panelId,
			id: command.id,
			x: obj.x,
			y: obj.y,
		};
		let updateSize = false;
		const sizeUpdate = {
			panelId: command.panelId,
			id: command.id,
			width: obj.width,
			height: obj.height,
		};

		if (!newRenderer.resizable) {
			updateSize = true;
			sizeUpdate.width = newRenderer.defaultWidth;
			sizeUpdate.height = newRenderer.defaultHeight;
		} else {
			if (oldRenderer.defaultWidth !== newRenderer.defaultWidth) {
				updateSize = true;
				sizeUpdate.width = Math.max(
					sizeUpdate.width +
						newRenderer.defaultWidth -
						oldRenderer.defaultWidth,
					safetyMargin
				);
			}
			if (oldRenderer.defaultHeight !== newRenderer.defaultHeight) {
				updateSize = true;
				sizeUpdate.height = Math.max(
					sizeUpdate.height +
						newRenderer.defaultHeight -
						oldRenderer.defaultHeight,
					safetyMargin
				);
			}
		}
		if (oldRenderer.defaultX !== newRenderer.defaultX) {
			updatePos = true;
			posUpdate.x = between(
				-sizeUpdate.width + safetyMargin,
				posUpdate.x + newRenderer.defaultX - oldRenderer.defaultX,
				constants.Base.screenWidth - safetyMargin
			);
		}
		if (oldRenderer.defaultY !== newRenderer.defaultY) {
			updatePos = true;
			posUpdate.y = between(
				-sizeUpdate.height + safetyMargin,
				posUpdate.y + newRenderer.defaultY - oldRenderer.defaultY,
				constants.Base.screenHeight - safetyMargin
			);
		}

		if (updatePos) {
			commit('setPosition', posUpdate as ISetObjectPositionMutation);
		}
		if (updateSize) {
			commit('setSize', sizeUpdate as ISetSpriteSizeMutation);
		}

		commit(
			'setTextBoxProperty',
			textboxProperty(command.panelId, command.id, 'style', command.style)
		);
	},

	resetTextboxBounds({ commit, state }, command: IResetTextboxBounds) {
		const obj = state.panels[command.panelId].objects[command.id] as ITextBox;
		commit('setPosition', {
			panelId: command.panelId,
			id: command.id,
			x: obj.resetBounds.x,
			y: obj.resetBounds.y,
		} as ISetObjectPositionMutation);
		commit('setSize', {
			panelId: command.panelId,
			id: command.id,
			height: obj.resetBounds.height,
			width: obj.resetBounds.width,
		} as ISetSpriteSizeMutation);
		commit('setRotation', {
			panelId: command.panelId,
			id: command.id,
			rotation: obj.resetBounds.rotation,
		} as ISetSpriteRotationMutation);
	},

	async splitTextbox({ commit, state, dispatch }, command: ISplitTextbox) {
		const obj = state.panels[command.panelId].objects[command.id] as ITextBox;
		if (obj.type !== 'textBox') return;

		const newWidth = (obj.width - splitTextboxSpacing) / 2;
		const centerDistance = newWidth / 2 + splitTextboxSpacing / 2;

		const baseCenter = [obj.x, obj.y];
		let boxOneCoords = [obj.x - centerDistance, obj.y];
		let boxTwoCoords = [obj.x + centerDistance, obj.y];

		if (obj.rotation !== 0) {
			boxOneCoords = rotateAround(
				boxOneCoords[0],
				boxOneCoords[1],
				baseCenter[0],
				baseCenter[1],
				(obj.rotation / 180) * Math.PI
			);
			boxTwoCoords = rotateAround(
				boxTwoCoords[0],
				boxTwoCoords[1],
				baseCenter[0],
				baseCenter[1],
				(obj.rotation / 180) * Math.PI
			);
		}

		commit('setResetBounds', {
			id: command.id,
			resetBounds: {
				x: boxOneCoords[0],
				y: boxOneCoords[1],
				width: newWidth,
				height: obj.height,
				rotation: obj.rotation,
			},
		} as ISetResetBoundsMutation);
		const newStyle = obj.style === 'custom_plus' ? 'custom_plus' : 'custom';
		if (obj.style !== newStyle) {
			commit(
				'setStyle',
				textboxProperty(command.panelId, command.id, 'style', newStyle)
			);
		}
		const id = (await dispatch('createTextBox', {
			resetBounds: {
				x: boxTwoCoords[0],
				y: boxTwoCoords[1],
				width: newWidth,
				height: obj.height,
				rotation: obj.rotation,
			},
		} as ICreateTextBoxAction)) as number;
		commit('setStyle', textboxProperty(command.panelId, id, 'style', newStyle));
		if (obj.flip) {
			commit('setFlip', {
				id,
				flip: obj.flip,
			} as ISetObjectFlipMutation);
		}
	},
};

export interface ISetTextBoxTalkingObjMutation extends IObjectMutation {
	readonly talkingObjId: ITextBox['talkingObjId'];
}

export interface ISetTextBoxTalkingOtherMutation extends IObjectMutation {
	readonly talkingOther: string;
}

export interface ISetResetBoundsMutation extends IObjectMutation {
	readonly resetBounds: ITextBox['resetBounds'];
}

export type TextBoxSimpleProperties = Exclude<
	keyof ITextBox,
	keyof IObject | 'talkingObjId' | 'talkingOther' | 'resetBounds'
>;

export function textboxProperty<T extends TextBoxSimpleProperties>(
	panelId: IPanel['id'],
	id: IObject['id'],
	key: T,
	value: ITextBox[T]
): ISetTextBoxProperty<T> {
	return { id, panelId, key, value };
}

interface ISetTextBoxProperty<T extends TextBoxSimpleProperties>
	extends IObjectMutation {
	readonly key: T;
	readonly value: ITextBox[T];
}

export interface ICreateTextBoxAction {
	readonly panelId: IPanel['id'];
	readonly text?: ITextBox['text'];
	readonly resetBounds?: ITextBox['resetBounds'];
}

export interface ISetTextBoxStyleAction extends IObjectMutation {
	readonly style: ITextBox['style'];
}

export interface ISplitTextbox extends IObjectMutation {}

export interface IResetTextboxBounds extends IObjectMutation {}
