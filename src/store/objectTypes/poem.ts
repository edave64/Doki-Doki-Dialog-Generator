import { ICommand } from '@/eventbus/command';
import { IObjectsState, ICreateObjectMutation, IObject } from '@/store/objects';
import { MutationTree, ActionTree } from 'vuex';
import { IRootState } from '..';
import { defaultPoemBackground, defaultX, defaultY } from '@/constants/poem';

export interface IPoem extends IObject {
	type: 'poem';
	background: number;
	font: number;
	text: string;
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
};

let lastPoemId = 0;

export const poemActions: ActionTree<IObjectsState, IRootState> = {
	createPoem({ commit, rootState }, command: ICreatePoemAction): string {
		const id = 'poem_' + ++lastPoemId;
		commit('create', {
			object: {
				x: defaultX,
				y: defaultY,
				width: 0,
				height: 0,
				panelId: rootState.panels.currentPanel,
				flip: false,
				id,
				onTop: true,
				opacity: 100,
				type: 'poem',
				version: 0,
				preserveRatio: false,
				ratio: 0,
				background: 0,
				font: 0,
				text: 'New poem\n\nClick here to edit poem',
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
