import getConstants from '@/constants';
import { NsfwPacks } from '@/constants/nsfw';
import eventBus, { InvalidateRenderEvent } from '@/eventbus/event-bus';
import { Repo } from '@/models/repo';
import { mergeContentPacks } from '@/store/content/merge';
import { decomposeMatrix } from '@/util/math';
import { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { createStore, Store, useStore as vuexUseStore } from 'vuex';
import content, {
	convertContentPack,
	getDefaultContentState,
	IAssetSwitch,
	IContentState,
	loadContentPack,
} from './content';
import { ICharacter } from './object-types/characters';
import { ITextBox } from './object-types/textbox';
import { IObject } from './objects';
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

			if (data.version == null || data.version < 2.5) {
				migrate25(data);
			}

			this.replaceState(data);

			eventBus.fire(new InvalidateRenderEvent());
		},
	},
	modules: { ui, panels, content, uploadUrls },
});

/**
 * Take a save from a version before 2.5 and migrate it.
 * @param data
 * @returns
 */
function migrate25(data: IRootState) {
	const panels = Object.values(data.panels.panels);
	// Detect and skip 2.5 prerelease version
	if (panels.find((x) => Object.values(x.objects).find((x) => 'scaleX' in x)))
		return;

	for (const panel of panels) {
		for (const object of Object.values(panel.objects) as (IObject & {
			zoom?: number;
		})[]) {
			object.scaleX = object.zoom ?? 1;
			object.scaleY = object.zoom ?? 1;
			object.skewX = 0;
			object.skewY = 0;
			object.linkedTo = null;
			const constants = getConstants();

			if (object.type === 'character') {
				const character = object as unknown as ICharacter;
				const charData = data.content.current.characters.find(
					(c) => c.id === character.characterType
				);
				const size = charData?.styleGroups[character.styleGroupId]?.styles[
					character.styleId
				]?.poses[character.poseId]?.size ?? [960, 960];

				let a = new DOMMatrixReadOnly().translate(
					object.x,
					object.y + object.height / 2
				);
				// Resizing -> Scale from the top
				a = a
					.translate(0, -object.height / 2)
					.scale(object.width / size[0], object.height / size[1])
					.translate(0, size[1] / 2);

				// new position at center
				a = a.rotate(object.flip ? -object.rotation : object.rotation);

				// Zoom -> Scale from the bottom
				a = a
					.translate(0, size[1] / 2)
					.scale(object.zoom!)
					.translate(0, -size[1] / 2);

				const oldRot = object.rotation;

				Object.assign(object, decomposeMatrix(a));
				object.rotation = object.flip ? 360 - oldRot : oldRot;
				object.skewX = 0;
				object.skewY = 0;
				object.width = size[0];
				object.height = size[1];
			}
			if (object.type === 'textBox') {
				const textbox = object as unknown as ITextBox;
				textbox.height += constants.TextBox.NameboxHeight;
				textbox.y += textbox.height / 2;
			}
			delete object.zoom;
		}
	}
}

export interface IRemovePacksAction {
	packs: Set<string>;
}
