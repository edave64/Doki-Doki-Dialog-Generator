import { createStore } from 'vuex';
import ui, { IUiState } from './ui';
import panels, { IPanels } from './panels';
import content, { IContentState } from './content';

export interface IRootState {
	ui: IUiState;
	panels: IPanels;
	content: IContentState;
	unsafe: boolean;
}

export default createStore({
	state: {
		unsafe: false,
	} as any,
	mutations: {
		setUnsafe(state, unsafe: boolean) {
			state.unsafe = unsafe;
		},
	},
	actions: {
		async removePacks({ dispatch, commit }, { packs }: IRemovePacksAction) {
			commit('setUnsafe', true);
			dispatch('content/removeContentPacks', packs);
			commit('setUnsafe', false);
		},
		getSave({ state }, compact: boolean) {
			return JSON.stringify(
				state,
				(key, value) => {
					if (key === 'ui') return undefined;
					if (key === 'lastRender') return undefined;
					if (key === 'content' && compact)
						return (value as IContentState).contentPacks
							.map((x) => x.packId)
							.filter((x) => x?.startsWith('dddg.buildin.'));
					return value;
				},
				2
			);
		},
	},
	modules: { ui, panels, content },
});

export interface IRemovePacksAction {
	packs: Set<string>;
}
