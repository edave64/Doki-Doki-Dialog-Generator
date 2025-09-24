import getConstants from '@/constants';
import { rendererLookup } from '@/renderables/textbox';
import type {
	ICreateObjectMutation,
	IObject,
	IObjectMutation,
	ISetLinkMutation,
	ISetObjectFlipMutation,
	ISetObjectPositionMutation,
	ISetObjectScaleMutation,
	ISetObjectSkewMutation,
	ISetSpriteRotationMutation,
} from '@/store/objects';
import type { IPanel, IPanels } from '@/store/panels';
import { between } from '@/util/math';
import type { ActionTree, MutationTree } from 'vuex';
import type { IRootState } from '..';
import { baseProps } from './base-object-props';
import type { ISetSpriteSizeMutation } from './characters';

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
		skewX: number;
		skewY: number;
		scaleX: number;
		scaleY: number;
	};
}

const splitTextboxSpacing = 4;

export const textBoxMutations: MutationTree<IPanels> = {
	setTalkingObject(state, command: ISetTextBoxTalkingObjMutation) {
		const obj = state.panels[command.panelId].objects[
			command.id
		] as ITextBox;
		obj.talkingObjId = command.talkingObjId;
		++obj.version;
	},
	setTalkingOther(state, command: ISetTextBoxTalkingOtherMutation) {
		const obj = state.panels[command.panelId].objects[
			command.id
		] as ITextBox;
		obj.talkingOther = command.talkingOther;
		obj.talkingObjId = '$other$';
		++obj.version;
	},
	setResetBounds(state, command: ISetResetBoundsMutation) {
		const obj = state.panels[command.panelId].objects[
			command.id
		] as ITextBox;
		obj.resetBounds = command.resetBounds;
		obj.x = command.resetBounds.x;
		obj.y = command.resetBounds.y;
		obj.height = command.resetBounds.height;
		obj.width = command.resetBounds.width;
		obj.rotation = command.resetBounds.rotation;
		obj.skewX = command.resetBounds.skewX;
		obj.skewY = command.resetBounds.skewY;
		obj.scaleX = command.resetBounds.scaleX;
		obj.scaleY = command.resetBounds.scaleY;
		++obj.version;
	},
	setTextBoxProperty<T extends TextBoxSimpleProperties>(
		state: IPanels,
		command: ISetTextBoxProperty<T>
	) {
		const obj = state.panels[command.panelId].objects[
			command.id
		] as ITextBox;
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
			scaleX: 1,
			scaleY: 1,
			skewX: 0,
			skewY: 0,
		};
		commit('create', {
			object: {
				...baseProps(),
				...resetBounds,
				panelId: command.panelId,
				id,
				onTop: true,
				type: 'textBox',
				continue: true,
				controls: true,
				skip: true,
				autoQuoting: true,
				autoWrap: true,
				style,
				overrideColor: false,
				customColor: constants.TextBoxCustom.textboxDefaultColor,
				deriveCustomColors: true,
				customControlsColor:
					constants.TextBoxCustom.controlsDefaultColor,
				customNameboxColor: constants.TextBoxCustom.nameboxDefaultColor,
				customNameboxWidth: null,
				customNameboxStroke:
					constants.TextBoxCustom.nameboxStrokeDefaultColor,
				talkingObjId: null,
				talkingOther: '',
				text: command.text ?? 'Click here to edit the textbox',
				resetBounds,
				overflow: false,
			} as ITextBox,
		} as ICreateObjectMutation);
		return id;
	},

	setStyle({ state, commit }, command: ISetTextBoxStyleAction) {
		const constants = getConstants();
		const obj = state.panels[command.panelId].objects[
			command.id
		] as ITextBox;
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
		const obj = state.panels[command.panelId].objects[
			command.id
		] as ITextBox;
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
		commit('setObjectScale', {
			panelId: command.panelId,
			id: command.id,
			scaleX: obj.resetBounds.scaleX,
			scaleY: obj.resetBounds.scaleY,
		} as ISetObjectScaleMutation);
		commit('setObjectSkew', {
			panelId: command.panelId,
			id: command.id,
			skewX: obj.resetBounds.skewX,
			skewY: obj.resetBounds.skewY,
		} as ISetObjectSkewMutation);
	},

	async splitTextbox({ commit, state, dispatch }, command: ISplitTextbox) {
		const obj = state.panels[command.panelId].objects[
			command.id
		] as ITextBox;
		if (obj.type !== 'textBox') return;

		const newWidth = (obj.width - splitTextboxSpacing) / 2;
		const centerDistance = newWidth / 2 + splitTextboxSpacing / 2;

		let transform = new DOMMatrixReadOnly().translate(obj.x, obj.y);
		if (obj.rotation !== 0) {
			transform = transform.rotate(0, 0, obj.rotation);
		}
		if (obj.skewX !== 0) {
			transform = transform.skewX(obj.skewX);
		}
		if (obj.skewY !== 0) {
			transform = transform.skewY(obj.skewY);
		}
		if (obj.flip) {
			transform = transform.flipX();
		}
		transform = transform.scale(obj.scaleX, obj.scaleY);

		const boxOneCoords = transform.transformPoint(
			new DOMPointReadOnly(-centerDistance, 0)
		);

		const boxTwoCoords = transform.transformPoint(
			new DOMPointReadOnly(centerDistance, 0)
		);

		commit('setResetBounds', {
			id: command.id,
			panelId: command.panelId,
			resetBounds: {
				x: boxOneCoords.x,
				y: boxOneCoords.y,
				width: newWidth,
				height: obj.height,
				rotation: obj.rotation,
				scaleX: obj.scaleX,
				scaleY: obj.scaleY,
				skewX: obj.skewX,
				skewY: obj.skewY,
			},
		} as ISetResetBoundsMutation);
		const newStyle = obj.style === 'custom_plus' ? 'custom_plus' : 'custom';
		if (obj.style !== newStyle) {
			await dispatch('setStyle', {
				...command,
				style: newStyle,
			} as ISetTextBoxStyleAction);
		}
		const id = (await dispatch('createTextBox', {
			panelId: command.panelId,
			resetBounds: {
				x: boxTwoCoords.x,
				y: boxTwoCoords.y,
				width: newWidth,
				height: obj.height,
				rotation: obj.rotation,
				scaleX: obj.scaleX,
				scaleY: obj.scaleY,
				skewX: obj.skewX,
				skewY: obj.skewY,
			},
		} as ICreateTextBoxAction)) as number;
		await dispatch('setStyle', {
			panelId: command.panelId,
			id,
			style: newStyle,
		} as ISetTextBoxStyleAction);
		if (obj.flip) {
			commit('setFlip', {
				id,
				panelId: command.panelId,
				flip: obj.flip,
			} as ISetObjectFlipMutation);
		}
		commit('setLink', {
			id,
			panelId: command.panelId,
			link: obj.linkedTo,
			rotation: obj.rotation,
			scaleX: obj.scaleX,
			scaleY: obj.scaleY,
			skewX: obj.skewX,
			skewY: obj.skewY,
			x: boxTwoCoords.x,
			y: boxTwoCoords.y,
		} as ISetLinkMutation);
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

export type TextBoxSimpleProperties =
	| Exclude<keyof ITextBox, keyof IObject>
	| 'overflow'
	| 'talkingObjId'
	| 'talkingOther'
	| 'resetBounds';

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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ISplitTextbox extends IObjectMutation {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IResetTextboxBounds extends IObjectMutation {}
