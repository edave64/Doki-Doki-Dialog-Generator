import { NsfwPacks } from '@/constants/nsfw';
import eventBus, { InvalidateRenderEvent } from '@/eventbus/event-bus';
import { Repo } from '@/models/repo';
import { mergeContentPacks } from '@/store/content/merge';
import { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { createStore, Store, useStore as vuexUseStore } from 'vuex';
import content, {
	convertContentPack,
	getDefaultContentState,
	IAssetSwitch,
	IContentState,
	loadContentPack,
} from './content';
import panels, { IPanels } from './panels';
import ui, { getDefaultUiState, IUiState } from './ui';
import uploadUrls, { IUploadUrlState } from './upload-urls';

export interface IRootState {
	ui: IUiState;
	panels: IPanels;
	content: IContentState;
	uploadUrls: IUploadUrlState;
	unsafe: boolean;
}

export function useStore() {
	return vuexUseStore() as Store<IRootState>;
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
			await dispatch('content/removeContentPacks', packs);
			commit('setUnsafe', false);
		},
		async getSave({ state }, compact: boolean) {
			const repo = await Repo.getInstance();
			return JSON.stringify(
				state,
				(key, value) => {
					if (key === 'ui') return undefined;
					if (key === 'lastRender') return undefined;
					if (key === 'uploadUrls') return Object.keys(value);
					if (key === 'content' && compact)
						return (value as IContentState).contentPacks
							.filter(
								(x) =>
									!x.packId?.startsWith('dddg.buildin.') ||
									x.packId?.endsWith('.nsfw')
							)
							.map((x) => {
								let id = x.packId?.startsWith('dddg.uploads.') ? x : x.packId;
								if (x.packId != null) {
									const pack = repo.getPack(x.packId);
									if (pack && pack.repoUrl != null) id += `;${pack.repoUrl}`;
								}
								return id;
							});
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
				nsfw:
					contentData.find(
						(pack) =>
							typeof pack === 'string' &&
							pack.startsWith('dddg.buildin.') &&
							pack.endsWith('.nsfw')
					) !== undefined,
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
							if (typeof x !== 'string') return x;
							let url: string | null = null;
							let packId: string;
							if (x.indexOf(';') >= 0) {
								[packId, url] = x.split(';');
							} else {
								packId = x;
							}
							const alreadyLoaded = state.content.contentPacks.find(
								(pack) => pack.packId === packId
							);
							if (alreadyLoaded) return alreadyLoaded;
							if (x.startsWith('dddg.buildin.') && x.endsWith('.nsfw')) {
								const loaded = await loadContentPack(
									(NsfwPacks as { [id: string]: string })[x]
								);

								return await convertContentPack(loaded);
							}
							if (url != null && !repo.hasPack(packId)) {
								await repo.loadTempPack(url);
							}
							const pack = repo.getPack(packId);
							if (!pack) {
								console.warn(`Pack Id ${x} not found!`);
								return null!;
							}
							const loaded = await loadContentPack(
								pack.dddg2Path || pack.dddg1Path
							);

							return await convertContentPack(loaded);
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
