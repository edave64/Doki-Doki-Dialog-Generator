import eventBus, { InvalidateRenderEvent } from '@/eventbus/event-bus';
import { Repo } from '@/models/repo';
import { mergeContentPacks } from '@/store/content/merge';
import { createStore } from 'vuex';
import ui, { getDefaultUiState, IUiState } from './ui';
import panels, { IPanels } from './panels';
import content, {
	convertContentPack,
	getDefaultContentState,
	IAssetSwitch,
	IContentState,
	loadContentPack,
} from './content';
import uploadUrls, { IUploadUrlState } from './upload_urls';
import { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';

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
		async loadSave({ state }, str: string) {
			const data: IRootState = JSON.parse(str);
			const contentData = data.content as unknown as Array<
				ContentPack<IAssetSwitch> | string
			>;
			data.ui = {
				...getDefaultUiState(),
				vertical: state.ui.vertical,
				lqRendering: state.ui.lqRendering,
				// TODO: Sync nsfw state on load
				nsfw: state.ui.nsfw,
				clipboard: state.ui.clipboard,
				useDarkTheme: state.ui.useDarkTheme,
				defaultCharacterTalkingZoom: state.ui.defaultCharacterTalkingZoom,
			};
			data.uploadUrls = {};
			data.content = getDefaultContentState();

			const repo = await Repo.getInstance();

			data.content.contentPacks = [
				...state.content.contentPacks.filter((x) =>
					x.packId?.startsWith('dddg.buildin.')
				),
				...(
					await Promise.all(
						contentData.map(async (x) => {
							if (typeof x === 'string') {
								const pack = repo.getPack(x);
								if (!pack) {
									console.warn(`Pack Id ${x} not found!`);
									return null!;
								}
								const loaded = await loadContentPack(
									pack.dddg2Path || pack.dddg1Path
								);

								return await convertContentPack(loaded);
							} else {
								return x;
							}
						})
					)
				).filter((x) => x !== null),
			];

			let combinedPack = data.content.current;
			for (const contentPack of data.content.contentPacks) {
				combinedPack = mergeContentPacks(combinedPack, contentPack);
			}
			data.content.current = combinedPack;

			this.replaceState(data);

			eventBus.fire(new InvalidateRenderEvent());
		},
	},
	modules: { ui, panels, content, uploadUrls },
});

export interface IRemovePacksAction {
	packs: Set<string>;
}
