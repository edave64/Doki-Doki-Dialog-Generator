import { ICommand } from '@/eventbus/command';
import { IObjectsState, ICreateObjectMutation, IObject } from '../objects';
import { MutationTree, ActionTree } from 'vuex';
import { NameboxY } from '@/models/textBoxConstants';

export interface ITextBox extends IObject {
	type: 'textBox';
	text: string;
	talking: string | null;
	style: 'normal' | 'corrupt' | 'custom';
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
	setTalking(state, command: ISetTextBoxTalkingMutation) {
		const obj = state.objects[command.id] as ITextBox;
		obj.talking = command.talking;
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
				continue: true,
				controls: true,
				skip: true,
				style: 'normal',
				talking: null,
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

export interface ISetTextBoxTalkingMutation extends ICommand {
	readonly talking: string;
}

export interface ISetTextBoxStyleMutation extends ICommand {
	readonly style: ITextBox['style'];
}

export interface ISetTextBoxControlsVisibleMutation extends ICommand {
	readonly controls: boolean;
}

export interface ISetTextBoxControlsSkipMutation extends ICommand {
	readonly skip: boolean;
}

export interface ISetTextBoxControlsContinueMutation extends ICommand {
	readonly continue: boolean;
}

export interface ICreateTextBoxAction extends ICommand {}

export interface ISetTextBoxStyleAction extends ICommand {
	readonly style: ITextBox['style'];
}
