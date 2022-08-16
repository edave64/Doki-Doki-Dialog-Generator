import { createStore } from 'vuex';
import ui, { IUiState } from './ui';
import panels, { IPanels } from './panels';
import content, { IContentState, IAssetSwitch } from './content';
import { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';

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
		async removePacks(
			{ dispatch, commit, state },
			{ packs }: IRemovePacksAction
		) {
			const oldState: ContentPack<IAssetSwitch> = JSON.parse(
				JSON.stringify(state.content.current)
			);

			commit('setUnsafe', true);
			await dispatch('content/removeContentPacks', packs);
			await dispatch('panels/fixContentPackRemoval', oldState);
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
