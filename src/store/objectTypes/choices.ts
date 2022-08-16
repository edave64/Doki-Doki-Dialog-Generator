import {
	ICreateObjectMutation,
	IObject,
	IObjectMutation,
} from '@/store/objects';
import { IPanel, IPanels } from '@/store/panels';
import { ActionTree, MutationTree } from 'vuex';
import { IRootState } from '..';
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

export const choiceMutations: MutationTree<IPanels> = {
	setChoicesProperty<T extends ChoicesSimpleProperties>(
		state: IPanels,
		command: ISetChoicesProperty<T>
	) {
		const obj = state.panels[command.panelId].objects[command.id] as IChoices;
		obj[command.key] = command.value;
		++obj.version;
	},
	setChoiceProperty<T extends keyof IChoice>(
		state: IPanels,
		command: ISetChoiceProperty<T>
	) {
		const obj = state.panels[command.panelId].objects[command.id] as IChoices;
		obj.choices[command.choiceIdx][command.key] = command.value;
		++obj.version;
	},
	setChoices(state, command: ISetChoicesMutation) {
		const obj = state.panels[command.panelId].objects[command.id] as IChoices;
		obj.choices = command.choices;
		++obj.version;
	},
};

let lastChoiceId = 0;

export const choiceActions: ActionTree<IPanels, IRootState> = {
	createChoice(
		{ commit, rootState, state },
		command: ICreateChoicesAction
	): IObject['id'] {
		const constants = getConstants();
		const id = state.panels[command.panelId].lastObjId + 1;
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
		const obj = state.panels[command.panelId].objects[command.id] as IChoices;
		commit('setChoices', {
			id: command.id,
			panelId: command.panelId,
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
		const obj = state.panels[command.panelId].objects[command.id] as IChoices;
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
			panelId: command.panelId,
			choices,
		} as ISetChoicesMutation);
	},
};

type ChoicesSimpleProperties = Exclude<
	keyof IChoices,
	keyof IObject | 'choices'
>;

interface ISetChoicesProperty<T extends ChoicesSimpleProperties>
	extends IObjectMutation {
	readonly key: T;
	readonly value: IChoices[T];
}

interface ISetChoiceProperty<T extends keyof IChoice> extends IObjectMutation {
	readonly choiceIdx: number;
	readonly key: T;
	readonly value: IChoice[T];
}

export interface ISetChoicesMutation extends IObjectMutation {
	readonly choices: IChoices['choices'];
}

export interface ICreateChoicesAction {
	readonly panelId: IPanel['id'];
}

export interface IAddChoiceAction extends IObjectMutation {
	readonly text: string;
}

export interface IRemoveChoiceAction extends IObjectMutation {
	readonly choiceIdx: number;
}
