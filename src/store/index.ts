import Vue from 'vue';
import Vuex from 'vuex';
import objects, { IObjectsState } from './objects';
import ui, { IUiState } from './ui';
import panels, { IPanels } from './panels';
import content, { IContentState, IAsset } from './content';
import { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';

Vue.use(Vuex);

export interface IRootState {
	objects: IObjectsState;
	ui: IUiState;
	panels: IPanels;
	content: IContentState;
	unsafe: boolean;
}

export default new Vuex.Store<IRootState>({
	modules: {
		objects,
		ui,
		panels,
		content,
	},
	state: {
		unsafe: false,
	} as any,
	mutations: {
		setUnsafe(state, unsafe: boolean) {},
	},
	actions: {
		async removePacks(
			{ dispatch, commit, state },
			{ packs }: IRemovePacksAction
		) {
			const oldState: ContentPack<IAsset> = JSON.parse(
				JSON.stringify(state.content.current)
			);

			commit('setUnsafe', true);
			await dispatch('content/removeContentPacks', packs);
			await dispatch('panels/fixContentPackRemoval', oldState);
			await dispatch('objects/fixContentPackRemoval', oldState);
			commit('setUnsafe', false);
		},
	},
});

export interface IRemovePacksAction {
	packs: Set<string>;
}
