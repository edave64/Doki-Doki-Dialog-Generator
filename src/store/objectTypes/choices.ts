import { ICommand } from '@/eventbus/command';
import { ICreateObjectMutation, IObject, IObjectsState } from '@/store/objects';
import { ActionTree, MutationTree } from 'vuex';
import { IRootState } from '..';
import { ISetAutoWrappingMutation } from './textbox';
import { baseProps } from './baseObjectProps';
import getConstants from '@/constants';

export interface IChoice {
	text: string;
	selected: boolean;
}

export interface IChoices extends IObject {
	type: 'choice';
	customColor: string;
	choices: IChoice[];
	choiceDistance: number;
	autoWrap: boolean;
}

export const choiceMutations: MutationTree<IObjectsState> = {
	setChoices(state, command: ISetChoicesMutation) {
		const obj = state.objects[command.id] as IChoices;
		obj.choices = command.choices;
		++obj.version;
	},
	setChoiceColor(state, command: ISetChoiceColorMutation) {
		const obj = state.objects[command.id] as IChoices;
		obj.customColor = command.customColor;
		++obj.version;
	},
	setChoiceDistance(state, command: ISetChoiceDistanceMutation) {
		const obj = state.objects[command.id] as IChoices;
		obj.choiceDistance = command.choiceDistance;
		++obj.version;
	},
	setAutoWrapping(state, command: ISetAutoWrappingMutation) {
		const obj = state.objects[command.id] as IChoices;
		obj.autoWrap = command.autoWrap;
		++obj.version;
	},
};

let lastChoiceId = 0;

export const choiceActions: ActionTree<IObjectsState, IRootState> = {
	createChoice({ commit, rootState }, _command: ICreateChoicesAction): string {
		const constants = getConstants();
		const id = 'choice_' + ++lastChoiceId;
		commit('create', {
			object: {
				...baseProps(),
				y: constants.Choices.ChoiceY,
				width: constants.Choices.ChoiceButtonWidth,
				height: 0,
				panelId: rootState.panels.currentPanel,
				id,
				onTop: true,
				autoWrap: true,
				type: 'choice',
				preserveRatio: false,
				ratio: constants.TextBox.TextBoxWidth / constants.TextBox.TextBoxHeight,
				choiceDistance: constants.Choices.ChoiceSpacing,
				choices: [
					{
						selected: false,
						text: 'Click here to edit choice',
					},
				],
				customColor: constants.Choices.ChoiceButtonColor,
			} as IChoices,
		} as ICreateObjectMutation);
		return id;
	},

	addChoice({ state, commit }, command: IAddChoiceAction) {
		const obj = state.objects[command.id] as IChoices;
		commit('setChoices', {
			id: command.id,
			choices: [
				...obj.choices,
				{
					selected: false,
					text: command.text,
				},
			],
		} as ISetChoicesMutation);
	},

	removeChoice({ state, commit }, command: IRemoveChoiceAction) {
		const obj = state.objects[command.id] as IChoices;
		const choices = [...obj.choices];
		if (!choices[command.choiceIdx]) return;
		choices.splice(command.choiceIdx, 1);
		// Do not allow empty choices
		if (choices.length === 0) {
			choices.push({
				selected: false,
				text: '',
			});
		}
		commit('setChoices', {
			id: command.id,
			choices,
		} as ISetChoicesMutation);
	},

	setChoiceText({ state, commit }, command: ISetChoiceTextAction) {
		const obj = state.objects[command.id] as IChoices;
		const choices = [...obj.choices];
		if (!choices[command.choiceIdx]) return;
		choices[command.choiceIdx].text = command.text;
		commit('setChoices', {
			id: command.id,
			choices,
		} as ISetChoicesMutation);
	},
};

export interface ISetChoicesMutation extends ICommand {
	readonly choices: IChoices['choices'];
}

export interface ISetChoiceColorMutation extends ICommand {
	readonly customColor: IChoices['customColor'];
}

export interface ISetChoiceDistanceMutation extends ICommand {
	readonly choiceDistance: IChoices['choiceDistance'];
}

export interface ICreateChoicesAction extends ICommand {}

export interface IAddChoiceAction extends ICommand {
	readonly text: string;
}

export interface ISetChoiceTextAction extends ICommand {
	readonly choiceIdx: number;
	readonly text: string;
}

export interface IRemoveChoiceAction extends ICommand {
	readonly choiceIdx: number;
}
