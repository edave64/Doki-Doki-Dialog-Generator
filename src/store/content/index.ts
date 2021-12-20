import { Module } from 'vuex';
import {
	Background,
	Character,
	ContentPack,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import {
	assetWalker,
	normalizePath,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/util';
import { normalizeContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/parser';
import { convert as convertV1 } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/convertV1';
// tslint:disable-next-line: max-line-length
import { normalizeCharacter as normalizeCharacterV1 } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v1/parser';
import { isWebPSupported } from '@/asset-manager';
import { mergeContentPacks } from './merge';
import { IRootState } from '..';

export interface IContentState {
	contentPacks: Array<ContentPack<IAsset>>;
	current: ContentPack<IAsset>;
}

export interface IAsset {
	hq: string;
	lq: string;
	sourcePack: string;
}

function baseDir(url: string): string {
	return (
		url
			.split('/')
			.slice(0, -1)
			.join('/') + '/'
	);
}

// These types are assumed to always be supported
const baseTypes = new Set(['png', 'gif', 'bmp', 'svg']);

export type BackgroundLookup = Map<
	Background<IAsset>['id'],
	Background<IAsset>
>;

export default {
	namespaced: true,
	state: {
		contentPacks: [],
		current: {
			dependencies: [],
			backgrounds: [],
			characters: [],
			fonts: [],
			poemStyles: [],
			poemBackgrounds: [],
			sprites: [],
			colors: [],
		},
	},
	mutations: {
		setContentPacks(state: IContentState, packs: Array<ContentPack<IAsset>>) {
			state.contentPacks = packs;
		},
		setCurrentContent(state: IContentState, content: ContentPack<IAsset>) {
			state.current = content;
		},
	},
	actions: {
		async contentPack({ commit, state }, contentPack: ContentPack<string>) {
			const convertedPack = (await convertContentPack(
				contentPack
			)) as ContentPack<IAsset>;
			const existingPacks = new Set(state.contentPacks.map(x => x.packId!));
			for (const dependency of contentPack.dependencies) {
				if (!existingPacks.has(dependency)) {
					throw new Error(
						`Missing dependency '${dependency}'. Refusing to install ${contentPack.packId}`
					);
				}
			}
			commit('setContentPacks', [...state.contentPacks, convertedPack]);
			commit(
				'setCurrentContent',
				mergeContentPacks(state.current, convertedPack)
			);
		},

		async removeContentPacks({ commit, state }, packIds: Set<string>) {
			const newContentPacks = sortByDependencies(
				state.contentPacks.filter(pack => !packIds.has(pack.packId!))
			);
			commit('setContentPacks', newContentPacks);
			commit(
				'setCurrentContent',
				(newContentPacks as Array<ContentPack<IAsset>>).reduce((acc, value) =>
					mergeContentPacks(acc, value)
				)
			);
		},

		async replaceContentPack(
			{ commit, state },
			action: ReplaceContentPackAction
		) {
			const convertedPack = action.processed
				? action.contentPack
				: await convertContentPack(action.contentPack);
			let packs = state.contentPacks;
			const packIdx = packs.findIndex(
				pack => pack.packId === action.contentPack.packId
			);
			if (packIdx === -1) {
				packs.push(convertedPack);
			} else {
				packs.splice(packIdx, 1, convertedPack);
			}
			packs = sortByDependencies(packs);
			commit('setContentPacks', packs);
			commit(
				'setCurrentContent',
				(packs as Array<ContentPack<IAsset>>).reduce((acc, value) =>
					mergeContentPacks(acc, value)
				)
			);
		},

		async loadContentPacks({ dispatch }, urls: string | string[]) {
			if (typeof urls === 'string') {
				urls = [urls];
			}
			const contentPacks = await Promise.all(
				urls.map(async url => {
					const response = await fetch(url);
					if (!response.ok) {
						error(
							`Could not load content pack. Server responded with: ${response.statusText}`
						);
					}

					let json;
					try {
						json = await response.json();
					} catch (e) {
						error('Content pack is not valid json!');
					}

					let contentPack: ContentPack<string>;
					try {
						const paths = {
							'./': baseDir(url),
							'/': baseDir(location.href) + 'assets/',
						};
						if (json.version === '2.0') {
							contentPack = normalizeContentPack(json, paths) as ContentPack<
								string
							>;
						} else {
							contentPack = convertV1(
								normalizeCharacterV1(json, paths),
								paths,
								false
							) as ContentPack<string>;
						}
					} catch (e) {
						error('Content pack is not in a valid format!', e);
					}
					return contentPack;
				})
			);

			for (const contentPack of contentPacks) {
				await dispatch('contentPack', contentPack);
			}

			return contentPacks.map(x => x.packId);
		},
	},
	getters: {
		getCharacters({
			current,
		}): Map<Character<IAsset>['id'], Character<IAsset>> {
			const ret = new Map<Character<IAsset>['id'], Character<IAsset>>();
			for (const character of current.characters) {
				ret.set(character.id, character);
			}
			return ret;
		},
		getBackgrounds({ current }): BackgroundLookup {
			const ret = new Map<Background<IAsset>['id'], Background<IAsset>>();
			for (const background of current.backgrounds) {
				ret.set(background.id, background);
			}
			return ret;
		},
	},
} as Module<IContentState, IRootState>;

function sortByDependencies(
	packs: Array<ContentPack<IAsset>>
): Array<ContentPack<IAsset>> {
	return packs;
}

async function convertContentPack(
	pack: ContentPack<string>
): Promise<ContentPack<IAsset>> {
	const types: ReadonlySet<string> = new Set(
		(await isWebPSupported()) ? ['webp', ...baseTypes] : baseTypes
	);

	const replacementMap = new Map([
		['ext', '{lq:.lq:}.{format:webp:webp:png:png}'],
	]);

	return assetWalker(
		pack,
		(path: string, _type: 'image' | 'font'): IAsset => {
			const hq = normalizePath(path, replacementMap, types, false);
			const lq = normalizePath(path, replacementMap, types, true);

			return {
				hq,
				lq,
				sourcePack: pack.packId || 'buildIn',
			};
		}
	) as ContentPack<IAsset>;
}

function error(msg: string, payload?: any): never {
	console.error(msg, payload);
	throw new Error(msg);
}

// tslint:disable: indent
export type ReplaceContentPackAction =
	| {
			contentPack: ContentPack<string>;
			processed: false;
	  }
	| {
			contentPack: ContentPack<IAsset>;
			processed: true;
	  };
// tslint:enable: indent
