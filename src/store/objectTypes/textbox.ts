import { ICommand } from '@/eventbus/command';
import { IObjectsState, ICreateObjectMutation, IObject } from '@/store/objects';
import { MutationTree, ActionTree } from 'vuex';
import {
	NameboxY,
	TextBoxWidth,
	TextBoxHeight,
} from '@/models/textBoxConstants';

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
	continue: boolean;
}

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
};

let lastTextBoxId = 0;

export const textBoxActions: ActionTree<IObjectsState, never> = {
	async createTextBox({ state, commit }, command: ICreateTextBoxAction) {
		commit('create', {
			object: {
				flip: false,
				id: 'textBox_' + ++lastTextBoxId,
				onTop: true,
				opacity: 100,
				type: 'textBox',
				version: 0,
				x: 640,
				y: NameboxY,
				width: TextBoxWidth,
				height: TextBoxHeight,
				preserveRatio: false,
				ratio: TextBoxWidth / TextBoxHeight,
				continue: true,
				controls: true,
				skip: true,
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
			} as ITextBox,
		} as ICreateObjectMutation);
	},

	setStyle({ state, commit }, command: ISetTextBoxStyleAction) {
		commit('setStyle', {
			id: command.id,
			style: command.style,
		} as ISetTextBoxStyleMutation);
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

export interface ISetTextBoxControlsSkipMutation extends ICommand {
	readonly skip: boolean;
}

export interface ISetTextBoxControlsContinueMutation extends ICommand {
	readonly continue: boolean;
}

export interface ISetTextBoxCustomColorMutation extends ICommand {
	readonly color: string;
}

export interface ICreateTextBoxAction extends ICommand {}

export interface ISetTextBoxStyleAction extends ICommand {
	readonly style: ITextBox['style'];
}
