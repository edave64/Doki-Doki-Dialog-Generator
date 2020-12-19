import { ICommand } from '@/eventbus/command';
import { IObjectsState, ICreateObjectMutation, IObject } from '@/store/objects';
import { MutationTree, ActionTree } from 'vuex';
import { IRootState } from '..';
import {
	defaultPoemBackground,
	defaultX,
	defaultY,
	defaultPoemWidth,
	defaultPoemHeight,
	consoleHeight,
	consoleWidth,
	defaultPoemStyle,
	defaultConsoleBackground,
	defaultConsoleStyle,
} from '@/constants/poem';
import { ISetAutoWrappingMutation } from './textbox';
import { baseProps } from './baseObjectProps';

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
		const id = 'poem_' + ++lastPoemId;
		commit('create', {
			object: {
				subType: 'poem',
				x: defaultX,
				y: defaultY,
				width: defaultPoemWidth,
				height: defaultPoemHeight,
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
				ratio: defaultPoemWidth / defaultPoemHeight,
				background: defaultPoemBackground,
				font: defaultPoemStyle,
				text: 'New poem\n\nClick here to edit poem',
				composite: 'source-over',
				filters: [],
				label: null,
				textboxColor: '#ffa8d2',
			} as IPoem,
		} as ICreateObjectMutation);
		return id;
	},
	createConsole({ commit, rootState }, _command: ICreatePoemAction): string {
		const id = 'poem_' + ++lastPoemId;
		commit('create', {
			object: {
				...baseProps(),
				subType: 'console',
				x: consoleWidth / 2,
				y: consoleHeight / 2,
				width: consoleWidth,
				height: consoleHeight,
				panelId: rootState.panels.currentPanel,
				id,
				onTop: true,
				type: 'poem',
				preserveRatio: false,
				ratio: consoleWidth / consoleHeight,
				background: defaultConsoleBackground,
				font: defaultConsoleStyle,
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
