import getConstants from '@/constants';
import type {
	ICreateObjectMutation,
	IObject,
	IObjectMutation,
} from '@/store/objects';
import type { IPanel, IPanels } from '@/store/panels';
import type { ActionTree, MutationTree } from 'vuex';
import type { IRootState } from '..';
import { baseProps } from './base-object-props';

export interface IPoem extends IObject {
	type: 'poem';
	subType: 'poem' | 'console';
	background: number;
	font: number;
	text: string;
	autoWrap: boolean;
	consoleColor: string;
}

export const poemMutations: MutationTree<IPanels> = {
	setPoemProperty<T extends PoemSimpleProperties>(
		state: IPanels,
		command: ISetTextBoxProperty<T>
	) {
		const obj = state.panels[command.panelId].objects[command.id] as IPoem;
		obj[command.key] = command.value;
		++obj.version;
	},
};

export const poemActions: ActionTree<IPanels, IRootState> = {
	createPoem(
		{ commit, rootState, state },
		command: ICreatePoemAction
	): IObject['id'] {
		const constants = getConstants();
		const id = state.panels[command.panelId].lastObjId + 1;
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
				autoWrap: true,
				background: constants.Poem.defaultPoemBackground,
				font: constants.Poem.defaultPoemStyle,
				text: 'New poem\n\nClick here to edit poem',
				composite: 'source-over',
				filters: [],
				label: null,
				textboxColor: null,
				enlargeWhenTalking: true,
				nameboxWidth: null,
				scaleX: 1,
				scaleY: 1,
				skewX: 0,
				skewY: 0,
				ratio: 1,
				preserveRatio: true,
				consoleColor: constants.Poem.consoleBackgroundColor,
				overflow: false,
				linkedTo: null,
			} as IPoem,
		} as ICreateObjectMutation);
		return id;
	},
	createConsole(
		{ commit, rootState, state },
		_command: ICreatePoemAction
	): IObject['id'] {
		const constants = getConstants();
		const id = state.panels[_command.panelId].lastObjId + 1;
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
				background: constants.Poem.defaultConsoleBackground,
				font: constants.Poem.defaultConsoleStyle,
				text: '> _\n  \n  Console command\n  Click here to edit',
				autoWrap: true,
				consoleColor: constants.Poem.consoleBackgroundColor,
			} as IPoem,
		} as ICreateObjectMutation);
		return id;
	},
};

export interface ISetBackgroundMutation extends IObjectMutation {
	readonly background: IPoem['background'];
}

export interface ISetFontMutation extends IObjectMutation {
	readonly font: IPoem['font'];
}

export interface ISetTextMutation extends IObjectMutation {
	readonly text: IPoem['text'];
}

export type PoemSimpleProperties =
	| Exclude<keyof IPoem, keyof IObject | 'subType'>
	| 'overflow';

export interface ISetTextBoxProperty<T extends PoemSimpleProperties>
	extends IObjectMutation {
	readonly key: T;
	readonly value: IPoem[T];
}

export interface ICreatePoemAction {
	readonly panelId: IPanel['id'];
}
