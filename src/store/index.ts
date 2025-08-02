import { NsfwPacks } from '@/constants/nsfw';
import eventBus, {
	FailureEvent,
	InvalidateRenderEvent,
} from '@/eventbus/event-bus';
import { Repo } from '@/models/repo';
import { mergeContentPacks } from '@/store/content/merge';
import type { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { createStore, Store, useStore as vuexUseStore } from 'vuex';
import content, {
	convertContentPack,
	getDefaultContentState,
	type IAssetSwitch,
	type IContentState,
	loadContentPack,
} from './content';
import { migrateSave2_5, rootStateMigrations2_5 } from './migrations/v2-5';
import panels, { type IPanels } from './panels';
import ui, { getDefaultUiState, type IUiState } from './ui';
import uploadUrls, { type IUploadUrlState } from './upload-urls';

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

export type RStore = Store<IRootState>;

export default createStore({
	state: {
		unsafe: false,
	} as unknown as IRootState,
	mutations: {
		setUnsafe(state, unsafe: boolean) {
			state.unsafe = unsafe;
		},
		...rootStateMigrations2_5,
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
				{ ...state, version: 2.5 },
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
								let id = x.packId?.startsWith('dddg.uploads.')
									? x
									: x.packId;
								if (x.packId != null) {
									const pack = repo.getPack(x.packId);
									if (pack && pack.repoUrl != null)
										id += `;${pack.repoUrl}`;
								}
								return id;
							});
					return value;
				},
				2
			);
		},
		async loadSave({ state }, str: string) {
			const data: IRootState & { version: number } = JSON.parse(str);
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
				defaultCharacterTalkingZoom:
					state.ui.defaultCharacterTalkingZoom,
			};
			data.uploadUrls = {};
			data.content = getDefaultContentState();

			const repo = await Repo.getInstance();
			const loadedIds = new Set<string>();

			const contentPackLoads = await Promise.allSettled(
				contentData.map(async (x) => {
					if (typeof x !== 'string') return x;
					let url: string | null = null;
					let packId: string;
					if (x.indexOf(';') >= 0) {
						[packId, url] = x.split(';');
					} else {
						packId = x;
					}
					if (loadedIds.has(packId)) return null;
					loadedIds.add(packId);
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
			);

			for (const contentPack of contentPackLoads) {
				if (contentPack.status === 'rejected') {
					eventBus.fire(new FailureEvent('' + contentPack.reason));
					console.error(contentPack.reason);
				}
			}

			data.content.contentPacks = [
				...state.content.contentPacks.filter((x) =>
					x.packId?.startsWith('dddg.buildin.')
				),
				...contentPackLoads
					.filter((x) => x.status === 'fulfilled')
					.map((x) => x.value)
					.filter((x) => x !== null),
			];

			let combinedPack = data.content.current;
			for (const contentPack of data.content.contentPacks) {
				combinedPack = mergeContentPacks(combinedPack, contentPack);
			}
			data.content.current = combinedPack;

			if (data.version == null || data.version < 2.5) {
				migrateSave2_5(data);
			}

			this.replaceState(data);

			eventBus.fire(new InvalidateRenderEvent());
		},
	},
	modules: { ui, panels, content, uploadUrls },
});

export interface IRemovePacksAction {
	packs: Set<string>;
}
