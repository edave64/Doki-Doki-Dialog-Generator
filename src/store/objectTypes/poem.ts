import { ICommand } from '@/eventbus/command';
import { IObjectsState, ICreateObjectMutation, IObject } from '@/store/objects';
import { MutationTree, ActionTree } from 'vuex';
import { IRootState } from '..';
import { ISetAutoWrappingMutation } from './textbox';
import { baseProps } from './baseObjectProps';
import getConstants from '@/constants';

export interface IPoem extends IObject {
	type: 'poem';
	subType: 'poem' | 'console';
	background: number;
	font: number;
	text: string;
	autoWrap: boolean;
}

export const poemMutations: MutationTree<IObjectsState> = {
	setPoemBackground(state, { id, background }: ISetBackgroundMutation) {
		const obj = state.objects[id] as IPoem;
		obj.background = background;
		++obj.version;
	},
	setPoemFont(state, { id, font }: ISetFontMutation) {
		const obj = state.objects[id] as IPoem;
		obj.font = font;
		++obj.version;
	},
	setPoemText(state, { id, text }: ISetTextMutation) {
		const obj = state.objects[id] as IPoem;
		obj.text = text;
		++obj.version;
	},
	setAutoWrapping(state, command: ISetAutoWrappingMutation) {
		const obj = state.objects[command.id] as IPoem;
		obj.autoWrap = command.autoWrap;
		++obj.version;
	},
};

let lastPoemId = 0;

export const poemActions: ActionTree<IObjectsState, IRootState> = {
	createPoem({ commit, rootState }, _command: ICreatePoemAction): string {
		const constants = getConstants();
		const id = 'poem_' + ++lastPoemId;
		commit('create', {
			object: {
				subType: 'poem',
				x: constants.Poem.defaultX,
				y: constants.Poem.defaultY,
				width: constants.Poem.defaultPoemWidth,
				height: constants.Poem.defaultPoemHeight,
				panelId: rootState.panels.currentPanel,
				flip: false,
				rotation: 0,
				id,
				onTop: true,
				opacity: 100,
				type: 'poem',
				version: 0,
				preserveRatio: false,
				autoWrap: true,
				ratio:
					constants.Poem.defaultPoemWidth / constants.Poem.defaultPoemHeight,
				background: constants.Poem.defaultPoemBackground,
				font: constants.Poem.defaultPoemStyle,
				text: 'New poem\n\nClick here to edit poem',
				composite: 'source-over',
				filters: [],
				label: null,
				textboxColor: null,
				enlargeWhenTalking: true,
				nameboxWidth: null,
				zoom: 1,
			} as IPoem,
		} as ICreateObjectMutation);
		return id;
	},
	createConsole({ commit, rootState }, _command: ICreatePoemAction): string {
		const constants = getConstants();
		const id = 'poem_' + ++lastPoemId;
		commit('create', {
			object: {
				...baseProps(),
				subType: 'console',
				x: constants.Poem.consoleWidth / 2,
				y: constants.Poem.consoleHeight / 2,
				width: constants.Poem.consoleWidth,
				height: constants.Poem.consoleHeight,
				panelId: rootState.panels.currentPanel,
				id,
				onTop: true,
				type: 'poem',
				preserveRatio: false,
				ratio: constants.Poem.consoleWidth / constants.Poem.consoleHeight,
				background: constants.Poem.defaultConsoleBackground,
				font: constants.Poem.defaultConsoleStyle,
				text: '> _\n  \n  Console command\n  Click here to edit',
				autoWrap: true,
			} as IPoem,
		} as ICreateObjectMutation);
		return id;
	},
};

export interface ISetBackgroundMutation extends ICommand {
	readonly background: IPoem['background'];
}

export interface ISetFontMutation extends ICommand {
	readonly font: IPoem['font'];
}

export interface ISetTextMutation extends ICommand {
	readonly text: IPoem['text'];
}

export interface ICreatePoemAction extends ICommand {}
