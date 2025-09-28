import { isWebPSupported } from '@/asset-manager';
import { allowLq, assetUrl } from '@/config';
import { clearHistory } from '@/history-engine/history';
import { normalizeCharacter as normalizeCharacterV1 } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v1/parser';
import { convert as convertV1 } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/convertV1';
import type {
	Background,
	Character,
	ContentPack,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { normalizeContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/parser';
import {
	assetWalker,
	normalizePath,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/util';
import { computed, ref } from 'vue';
import { mergeContentPacks } from './content/merge';
import { panels } from './panels';

export const content = new (class Content {
	private _contentPacks = ref<Array<ContentPack<IAssetSwitch>>>([]);
	private _current = ref<ContentPack<IAssetSwitch>>({
		dependencies: [],
		backgrounds: [],
		characters: [],
		fonts: [],
		poemStyles: [],
		poemBackgrounds: [],
		sprites: [],
		colors: [],
	});

	get contentPacks(): Readonly<Array<ContentPack<IAssetSwitch>>> {
		return this._contentPacks.value;
	}

	get current(): Readonly<ContentPack<IAssetSwitch>> {
		return this._current.value;
	}

	public removeContentPacks(packIds: Set<string>) {
		const oldState: ContentPack<IAssetSwitch> = JSON.parse(
			JSON.stringify(this.current)
		);
		const newContentPacks = sortByDependencies(
			this.contentPacks.filter((pack) => !packIds.has(pack.packId!))
		);
		clearHistory(() => {
			this._contentPacks.value = newContentPacks;
			this._current.value = (
				newContentPacks as Array<ContentPack<IAssetSwitch>>
			).reduce((acc, value) => mergeContentPacks(acc, value));
			panels.fixContentPackRemoval(oldState);
		});
	}

	public async replaceContentPack(action: ReplaceContentPackAction) {
		const convertedPack = action.processed
			? action.contentPack
			: await convertContentPack(action.contentPack);

		let packs = this._contentPacks.value;
		const packIdx = packs.findIndex(
			(pack) => pack.packId === action.contentPack.packId
		);
		if (packIdx === -1) {
			packs.push(convertedPack);
		} else {
			packs.splice(packIdx, 1, convertedPack);
		}
		packs = sortByDependencies(packs);

		clearHistory(() => {
			this._contentPacks.value = packs;
			this._current.value = (
				packs as Array<ContentPack<IAssetSwitch>>
			).reduce((acc, value) => mergeContentPacks(acc, value));
		});
	}

	async loadContentPacks(urls: string | string[]) {
		if (typeof urls === 'string') {
			urls = [urls];
		}
		const contentPacks = await Promise.all(
			urls.map(async (url) => await loadContentPack(url))
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

		await clearHistory(async () => {
			this._contentPacks.value = [
				...this.contentPacks,
				...convertedPacks,
			];
			this._current.value = combinedPack;
		});
	}

	private _characters = computed(() => {
		const ret = new Map<
			Character<IAssetSwitch>['id'],
			Character<IAssetSwitch>
		>();
		for (const character of this.current.characters) {
			ret.set(character.id, character);
		}
		return ret;
	});

	public get characters() {
		return this._characters.value;
	}

	private _backgrounds = computed(() => {
		const ret = new Map<
			Background<IAssetSwitch>['id'],
			Background<IAssetSwitch>
		>();
		for (const background of this.current.backgrounds) {
			ret.set(background.id, background);
		}
		return ret;
	});

	public get backgrounds() {
		return this._backgrounds.value;
	}
})();

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
	} catch {
		throw new Error('Content pack is not valid json!');
	}

	try {
		const paths = {
			'./': baseDir(url),
			'/': assetUrl,
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
	} catch {
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

	return assetWalker(pack, (path: string): IAssetSwitch => {
		const hq = normalizePath(path, replacementMap, types, false);
		const lq = normalizePath(path, replacementMap, types, allowLq && true);

		return {
			hq,
			lq,
			sourcePack: pack.packId ?? 'buildIn',
		};
	}) as ContentPack<IAssetSwitch>;
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
