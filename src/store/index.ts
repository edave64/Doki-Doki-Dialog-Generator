import { createStore } from 'vuex';
import ui, { IUiState } from './ui';
import panels, { IPanels } from './panels';
import content, { IContentState } from './content';
import uploadUrls, { IUploadUrlState } from './upload_urls';

export interface IRootState {
	ui: IUiState;
	panels: IPanels;
	content: IContentState;
	uploadUrls: IUploadUrlState;
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
					if (key === 'uploadUrls') return Object.keys(value);
					if (key === 'content' && compact)
						return (value as IContentState).contentPacks
							.filter((x) => !x.packId?.startsWith('dddg.buildin.'))
							.map((x) =>
								x.packId?.startsWith('dddg.uploads.') ? x : x.packId
							);
					return value;
				},
				2
			);
		},
	},
	modules: { ui, panels, content, uploadUrls },
});

export interface IRemovePacksAction {
	packs: Set<string>;
}
