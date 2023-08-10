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
import { defineStore } from 'pinia';

export interface IContentState {
	contentPacks: Array<ContentPack<IAssetSwitch>>;
	current: ContentPack<IAssetSwitch>;
}

export interface IAssetSwitch {
	hq: string;
	lq: string;
	sourcePack: string;
}

function baseDir(url: string): string {
	return url.split('/').slice(0, -1).join('/') + '/';
}

// These types are assumed to always be supported
const baseTypes = new Set(['png', 'gif', 'bmp', 'svg']);

export type BackgroundLookup = Map<
	Background<IAssetSwitch>['id'],
	Background<IAssetSwitch>
>;

export function getDefaultContentState(): IContentState {
	return {
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
	};
}

export const useContentStore = defineStore('content', {
	state: getDefaultContentState,
	actions: {
		setContentPacks(
			state: IContentState,
			packs: Array<ContentPack<IAssetSwitch>>
		) {
			state.contentPacks = packs;
		},
		setCurrentContent(
			state: IContentState,
			content: ContentPack<IAssetSwitch>
		) {
			state.current = content;
		},
		removeContentPacks(packIds: Set<string>) {
			const oldState: ContentPack<IAssetSwitch> = JSON.parse(
				JSON.stringify(this.current)
			);
			const newContentPacks = sortByDependencies(
				this.contentPacks.filter((pack) => !packIds.has(pack.packId!))
			);
			this.$patch((a) => {
				a.contentPacks = newContentPacks;
				a.current = (
					newContentPacks as Array<ContentPack<IAssetSwitch>>
				).reduce((acc, value) => mergeContentPacks(acc, value));
			});
			//TODO: dispatch('panels/fixContentPackRemoval', oldState, { root: true });
		},

		async replaceContentPack(action: ReplaceContentPackAction) {
			const convertedPack = action.processed
				? action.contentPack
				: await convertContentPack(action.contentPack);
			let packs = this.contentPacks;
			const packIdx = packs.findIndex(
				(pack) => pack.packId === action.contentPack.packId
			);
			if (packIdx === -1) {
				packs.push(convertedPack);
			} else {
				packs.splice(packIdx, 1, convertedPack);
			}
			packs = sortByDependencies(packs);
			this.$patch((a) => {
				a.contentPacks = packs;
				a.current = (packs as Array<ContentPack<IAssetSwitch>>).reduce(
					(acc, value) => mergeContentPacks(acc, value)
				);
			});
		},

		async loadContentPacks(urls: string | string[]) {
			if (typeof urls === 'string') {
				urls = [urls];
			}
			const contentPacks = await Promise.all(
				urls.map(async (url) => loadContentPack(url))
			);

			const convertedPacks = await Promise.all(
				contentPacks.map((contentPack) => convertContentPack(contentPack))
			);

			const existingPacks = new Set(this.contentPacks.map((x) => x.packId!));
			let combinedPack = this.current;

			for (const convertedPack of convertedPacks) {
				for (const dependency of convertedPack.dependencies) {
					if (!existingPacks.has(dependency)) {
						throw new Error(
							`Missing dependency '${dependency}'. Refusing to install ${convertedPack.packId}`
						);
					}
				}
				combinedPack = mergeContentPacks(combinedPack, convertedPack);
			}
			this.$patch((a) => {
				a.contentPacks = [...this.contentPacks, ...convertedPacks];
				a.current = combinedPack;
			});

			return contentPacks.map((x) => x.packId);
		},
	},
	getters: {
		getCharacters({
			current,
		}): Map<Character<IAssetSwitch>['id'], Character<IAssetSwitch>> {
			const ret = new Map<
				Character<IAssetSwitch>['id'],
				Character<IAssetSwitch>
			>();
			for (const character of current.characters) {
				ret.set(character.id, character);
			}
			return ret;
		},
		getBackgrounds({ current }): BackgroundLookup {
			const ret = new Map<
				Background<IAssetSwitch>['id'],
				Background<IAssetSwitch>
			>();
			for (const background of current.backgrounds) {
				ret.set(background.id, background);
			}
			return ret;
		},
	},
});

export async function loadContentPack(
	url: string
): Promise<ContentPack<string>> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(
			`Could not load content pack. Server responded with: ${response.statusText}`
		);
	}

	let json;
	try {
		json = await response.json();
	} catch (e) {
		throw new Error('Content pack is not valid json!');
	}

	try {
		const paths = {
			'./': baseDir(url),
			'/': baseDir(location.href) + 'assets/',
		};
		if (json.version === '2.0') {
			return normalizeContentPack(json, paths) as ContentPack<string>;
		} else {
			return convertV1(
				normalizeCharacterV1(json, paths),
				paths,
				false
			) as ContentPack<string>;
		}
	} catch (e) {
		throw new Error('Content pack is not in a valid format!');
	}
}

function sortByDependencies(
	packs: Array<ContentPack<IAssetSwitch>>
): Array<ContentPack<IAssetSwitch>> {
	return packs;
}

export async function convertContentPack(
	pack: ContentPack<string>
): Promise<ContentPack<IAssetSwitch>> {
	const types: ReadonlySet<string> = new Set(
		(await isWebPSupported()) ? ['webp', ...baseTypes] : baseTypes
	);

	const replacementMap = new Map([
		['ext', '{lq:.lq:}.{format:webp:webp:png:png}'],
	]);

	return assetWalker(
		pack,
		(path: string, _type: 'image' | 'font'): IAssetSwitch => {
			const hq = normalizePath(path, replacementMap, types, false);
			const lq = normalizePath(path, replacementMap, types, true);

			return {
				hq,
				lq,
				sourcePack: pack.packId ?? 'buildIn',
			};
		}
	) as ContentPack<IAssetSwitch>;
}

export type ReplaceContentPackAction =
	| {
			contentPack: ContentPack<string>;
			processed: false;
	  }
	| {
			contentPack: ContentPack<IAssetSwitch>;
			processed: true;
	  };
