import { isWebPSupported } from '@/asset-manager';
import { allowLq, assetUrl } from '@/config';
import { NsfwPacks } from '@/constants/nsfw';
import eventBus, { FailureEvent } from '@/eventbus/event-bus';
import { clearHistory } from '@/history-engine/history';
import { Repo } from '@/models/repo';
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

const emptyPack: ContentPack<IAssetSwitch> = {
	dependencies: [],
	characters: [],
	fonts: [],
	sprites: [],
	poemStyles: [],
	poemBackgrounds: [],
	backgrounds: [],
	colors: [],
};
export const content = new (class Content {
	private _contentPacks = ref<Array<ContentPack<IAssetSwitch>>>([]);
	private _current = computed(() => {
		if (this._contentPacks.value.length === 0) return emptyPack;
		return this._contentPacks.value.reduce((acc, value) =>
			mergeContentPacks(acc, value)
		);
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

		for (const convertedPack of convertedPacks) {
			for (const dependency of convertedPack.dependencies) {
				if (!existingPacks.has(dependency)) {
					throw new Error(
						`Missing dependency '${dependency}'. Refusing to install ${convertedPack.packId}`
					);
				}
			}
		}

		await clearHistory(async () => {
			this._contentPacks.value = [
				...this.contentPacks,
				...convertedPacks,
			];
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

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async loadSave(save: any) {
		const repo = await Repo.getInstance();
		const loadedIds = new Set<string>();

		const contentPackLoads = await Promise.allSettled(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			save.map(async (x: any) => {
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
				const alreadyLoaded = content.contentPacks.find(
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

		content._contentPacks.value = [
			...content._contentPacks.value.filter((x) =>
				x.packId?.startsWith('dddg.buildin.')
			),
			...contentPackLoads
				.filter((x) => x.status === 'fulfilled')
				.map((x) => x.value)
				.filter((x) => x !== null),
		];
	}

	public async getSave(compact: boolean) {
		const packs = [...content._contentPacks.value];
		const repo = await Repo.getInstance();

		if (compact) {
			return packs
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
		} else {
			return packs;
		}
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
