import { ICommand } from '@/eventbus/command';
import {
	IObjectsState,
	ICreateObjectMutation,
	IObject,
	ISetObjectPositionMutation,
	ISetObjectFlipMutation,
} from '@/store/objects';
import { MutationTree, ActionTree } from 'vuex';
import { NameboxY, TextBoxWidth, TextBoxHeight } from '@/constants/textBox';
import { ISetSpriteSizeMutation } from './characters';
import { IRootState } from '..';

export interface ITextBox extends IObject {
	type: 'textBox';
	text: string;
	talkingDefault:
		| 'No-one'
		| 'Sayori'
		| 'Monika'
		| 'Natsuki'
		| 'Yuri'
		| 'MC'
		| 'FeMC'
		| 'Chad'
		| 'Amy'
		| 'Other';
	talkingOther: string;
	style: 'normal' | 'corrupt' | 'custom';
	customColor: string;
	deriveCustomColors: boolean;
	customControlsColor: string;
	customNameboxColor: string;
	customNameboxStroke: string;
	customNameboxWidth: number;
	controls: boolean;
	skip: boolean;
	autoQuoting: boolean;
	continue: boolean;
	resetBounds: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
}

const splitTextboxSpacing = 4;

export const textBoxMutations: MutationTree<IObjectsState> = {
	setText(state, command: ISetTextBoxTextMutation) {
		const obj = state.objects[command.id] as ITextBox;
		obj.text = command.text;
		++obj.version;
	},
	setTalkingDefault(state, command: ISetTextBoxTalkingDefaultMutation) {
		const obj = state.objects[command.id] as ITextBox;
		obj.talkingDefault = command.talkingDefault;
		++obj.version;
	},
	setTalkingOther(state, command: ISetTextBoxTalkingOtherMutation) {
		const obj = state.objects[command.id] as ITextBox;
		obj.talkingOther = command.talkingOther;
		obj.talkingDefault = 'Other';
		++obj.version;
	},
	setStyle(state, command: ISetTextBoxStyleMutation) {
		const obj = state.objects[command.id] as ITextBox;
		obj.style = command.style;
		++obj.version;
	},
	setControlsVisible(state, command: ISetTextBoxControlsVisibleMutation) {
		const obj = state.objects[command.id] as ITextBox;
		obj.controls = command.controls;
		++obj.version;
	},
	setControlsColor(state, command: ISetTextBoxCustomControlsColorMutation) {
		const obj = state.objects[command.id] as ITextBox;
		obj.customControlsColor = command.customControlsColor;
		++obj.version;
	},
	setDeriveCustomColors(state, command: ISetTextBoxDeriveCustomColorMutation) {
		const obj = state.objects[command.id] as ITextBox;
		obj.deriveCustomColors = command.deriveCustomColors;
		++obj.version;
	},
	setNameboxColor(state, command: ISetTextBoxNameboxColorMutation) {
		const obj = state.objects[command.id] as ITextBox;
		obj.customNameboxColor = command.customNameboxColor;
		++obj.version;
	},
	setNameboxStroke(state, command: ISetTextBoxNameboxStrokeMutation) {
		const obj = state.objects[command.id] as ITextBox;
		obj.customNameboxStroke = command.customNameboxStroke;
		++obj.version;
	},
	setNameboxWidth(state, command: ISetTextBoxNameboxWidthMutation) {
		const obj = state.objects[command.id] as ITextBox;
		obj.customNameboxWidth = command.customNameboxWidth;
		++obj.version;
	},
	setSkipable(state, command: ISetTextBoxControlsSkipMutation) {
		const obj = state.objects[command.id] as ITextBox;
		obj.skip = command.skip;
		++obj.version;
	},
	setContinueArrow(state, command: ISetTextBoxControlsContinueMutation) {
		const obj = state.objects[command.id] as ITextBox;
		obj.continue = command.continue;
		++obj.version;
	},
	setCustomColor(state, command: ISetTextBoxCustomColorMutation) {
		const obj = state.objects[command.id] as ITextBox;
		obj.customColor = command.color;
		++obj.version;
	},
	setAutoQuoting(state, command: ISetTextBoxAutoQuotingMutation) {
		const obj = state.objects[command.id] as ITextBox;
		obj.autoQuoting = command.autoQuoting;
		++obj.version;
	},
	setResetBounds(state, command: ISetResetBoundsMutation) {
		const obj = state.objects[command.id] as ITextBox;
		obj.resetBounds = command.resetBounds;
		obj.x = command.resetBounds.x;
		obj.y = command.resetBounds.y;
		obj.height = command.resetBounds.height;
		obj.width = command.resetBounds.width;
		++obj.version;
	},
};

let lastTextBoxId = 0;

export const textBoxActions: ActionTree<IObjectsState, IRootState> = {
	createTextBox({ commit, rootState }, command: ICreateTextBoxAction): string {
		const id = 'textBox_' + ++lastTextBoxId;
		const resetBounds = command.resetBounds || {
			x: 640,
			y: NameboxY,
			width: TextBoxWidth,
			height: TextBoxHeight,
		};
		commit('create', {
			object: {
				...resetBounds,
				panelId: rootState.panels.currentPanel,
				flip: false,
				id,
				onTop: true,
				opacity: 100,
				type: 'textBox',
				version: 0,
				preserveRatio: false,
				ratio: TextBoxWidth / TextBoxHeight,
				continue: true,
				controls: true,
				skip: true,
				autoQuoting: true,
				style: 'normal',
				customColor: '#ffa8d2',
				deriveCustomColors: true,
				customControlsColor: '#552222',
				customNameboxColor: '#ffeef6',
				customNameboxWidth: 168,
				customNameboxStroke: '#bb5599',
				talkingDefault: 'No-one',
				talkingOther: '',
				text: '',
				resetBounds,
			} as ITextBox,
		} as ICreateObjectMutation);
		return id;
	},

	setStyle({ commit }, command: ISetTextBoxStyleAction) {
		commit('setStyle', {
			id: command.id,
			style: command.style,
		} as ISetTextBoxStyleMutation);
	},

	resetTextboxBounds(
		{ commit, state, dispatch },
		command: IResetTextboxBounds
	) {
		const obj = state.objects[command.id] as ITextBox;
		commit('setPosition', {
			id: command.id,
			x: obj.resetBounds.x,
			y: obj.resetBounds.y,
		} as ISetObjectPositionMutation);
		commit('setSize', {
			id: command.id,
			height: obj.resetBounds.height,
			width: obj.resetBounds.width,
		} as ISetSpriteSizeMutation);
	},

	async splitTextbox({ commit, state, dispatch }, command: ISplitTextbox) {
		const obj = state.objects[command.id];
		const newWidth = (obj.width - splitTextboxSpacing) / 2;
		commit('setResetBounds', {
			id: command.id,
			resetBounds: {
				x: obj.x - newWidth / 2,
				y: obj.y,
				width: newWidth,
				height: obj.height,
			},
		} as ISetResetBoundsMutation);
		commit('setStyle', {
			id: command.id,
			style: 'custom',
		} as ISetTextBoxStyleMutation);
		const id = (await dispatch('createTextBox', {
			resetBounds: {
				x: obj.x + newWidth + splitTextboxSpacing / 2,
				y: obj.y,
				width: newWidth,
				height: obj.height,
			},
		} as ICreateTextBoxAction)) as string;
		commit('setStyle', {
			id,
			style: 'custom',
		} as ISetTextBoxStyleMutation);
		if (obj.flip) {
			commit('setFlip', {
				id,
				flip: obj.flip,
			} as ISetObjectFlipMutation);
		}
	},
};

export interface ISetTextBoxTextMutation extends ICommand {
	readonly text: string;
}

export interface ISetTextBoxTalkingDefaultMutation extends ICommand {
	readonly talkingDefault: ITextBox['talkingDefault'];
}

export interface ISetTextBoxTalkingOtherMutation extends ICommand {
	readonly talkingOther: string;
}

export interface ISetTextBoxStyleMutation extends ICommand {
	readonly style: ITextBox['style'];
}

export interface ISetTextBoxControlsVisibleMutation extends ICommand {
	readonly controls: boolean;
}

export interface ISetTextBoxDeriveCustomColorMutation extends ICommand {
	readonly deriveCustomColors: boolean;
}

export interface ISetTextBoxCustomControlsColorMutation extends ICommand {
	readonly customControlsColor: string;
}

export interface ISetTextBoxNameboxColorMutation extends ICommand {
	readonly customNameboxColor: string;
}

export interface ISetTextBoxNameboxStrokeMutation extends ICommand {
	readonly customNameboxStroke: string;
}

export interface ISetTextBoxNameboxWidthMutation extends ICommand {
	readonly customNameboxWidth: number;
}

export interface ISetTextBoxAutoQuotingMutation extends ICommand {
	readonly autoQuoting: boolean;
}

export interface ISetResetBoundsMutation extends ICommand {
	readonly resetBounds: ITextBox['resetBounds'];
}

export interface ISetTextBoxControlsSkipMutation extends ICommand {
	readonly skip: boolean;
}

export interface ISetTextBoxControlsContinueMutation extends ICommand {
	readonly continue: boolean;
}

export interface ISetTextBoxCustomColorMutation extends ICommand {
	readonly color: string;
}

export interface ICreateTextBoxAction extends ICommand {
	readonly resetBounds?: ITextBox['resetBounds'];
}

export interface ISetTextBoxStyleAction extends ICommand {
	readonly style: ITextBox['style'];
}

export interface ISplitTextbox extends ICommand {}

export interface IResetTextboxBounds extends ICommand {}
