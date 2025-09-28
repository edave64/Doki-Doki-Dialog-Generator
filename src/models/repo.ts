import environment from '@/environments/environment';
import eventBus, { ShowMessageEvent } from '@/eventbus/event-bus';
import { state } from '@/store/root';
import type {
	IAuthor,
	IAuthors,
} from '@edave64/dddg-repo-filters/dist/authors';
import type { IPack as IPrimitivePack } from '@edave64/dddg-repo-filters/dist/pack';
import {
	computed,
	reactive,
	ref,
	type ComputedRef,
	type DeepReadonly,
	type Ref,
} from 'vue';

const repoUrl = 'https://edave64.github.io/Doki-Doki-Dialog-Generator-Packs/';

export type LoadedRepo = {
	packs: IPrimitivePack[];
	authors: IAuthors;
};

export class Repo {
	private static instance: null | Promise<Repo>;

	public static getInstance(): Promise<Repo> {
		if (!Repo.instance) Repo.instance = this.createInstance();
		return Repo.instance;
	}

	private static async createInstance(): Promise<Repo> {
		const onlineRepoLoading = Repo.loadRepo(repoUrl);
		const localRepoLoading = environment.supports.localRepo
			? await Repo.loadRepo(environment.localRepositoryUrl)
			: null;

		const [onlineRepoLoaded, localRepoLoaded] = await Promise.all([
			onlineRepoLoading,
			localRepoLoading,
		]);

		return new Repo(onlineRepoLoaded, localRepoLoaded);
	}

	private static async loadRepo(repo: string): Promise<LoadedRepo | null> {
		try {
			const [packs, authors] = await Promise.all([
				Repo.fetchJSON<IPrimitivePack[]>(repo + 'repo.json'),
				Repo.fetchJSON<IAuthors>(repo + 'people.json'),
			]);
			return { packs, authors };
		} catch {
			return null;
		}
	}

	private static async fetchJSON<A>(path: string): Promise<A> {
		const req = await fetch(path);
		if (!req.ok) throw new Error('Could not load json');
		return await req!.json();
	}

	private readonly onlineRepo: Ref<LoadedRepo | null>;
	private readonly localRepo: Ref<LoadedRepo | null>;
	private readonly tempRepo: LoadedRepo = reactive({
		authors: {},
		packs: [],
	});

	private readonly combinedList: ComputedRef<DeepReadonly<Pack[]>>;
	private readonly authors: ComputedRef<DeepReadonly<IAuthors>>;

	private constructor(
		onlineRepo: LoadedRepo | null,
		localRepo: LoadedRepo | null
	) {
		window.repo = this;
		if (!onlineRepo) {
			onlineRepo = { authors: {}, packs: [] };
			eventBus.fire(
				new ShowMessageEvent("Couldn't load remote repository.")
			);
		}
		if (!localRepo) {
			localRepo = { authors: {}, packs: [] };
			if (environment.supports.localRepo) {
				eventBus.fire(
					new ShowMessageEvent("Couldn't load local repository.")
				);
			}
		}
		this.onlineRepo = ref(onlineRepo);
		this.localRepo = ref(localRepo);

		this.combinedList = computed(() => {
			const onlineRepo = this.onlineRepo.value;
			const onlinePacks = onlineRepo?.packs ?? [];
			const onlineRepoLookup = new Map(
				onlinePacks.map((pack) => [pack.id, pack])
			);

			const localRepo = this.localRepo.value;
			const localPacks = localRepo?.packs ?? [];
			const localRepoLookup = new Map(
				localPacks.map((pack) => [pack.id, pack])
			);

			const tempRepo = this.tempRepo;
			const tempPacks = tempRepo.packs;
			const tempRepoLookup = new Map(
				tempPacks.map((pack) => [pack.id, pack])
			);

			const autoloads = new Set(environment.state.autoAdd);
			const loadedPackOrder = state.content.contentPacks
				.map((pack) => pack.packId)
				.filter((packId) => packId != null) as string[];
			const loadedPacksSet = new Set(loadedPackOrder) as Set<string>;

			const addedPacks = new Set();
			return [
				...loadedPackOrder,
				...localPacks.map((pack) => pack.id),
				...onlinePacks.map((pack) => pack.id),
				...tempPacks.map((pack) => pack.id),
			]
				.filter((packId) => {
					if (
						packId.startsWith('dddg.buildin.') ||
						packId.startsWith('dddg.uploads.') ||
						packId.startsWith('dddg.desktop.') ||
						packId === 'concept_femc.shido_draws.edave64'
						//packId === 'mc.storm_blaze.edave64'
					)
						return false;
					if (addedPacks.has(packId)) return false;
					addedPacks.add(packId);
					return true;
				})
				.map((packId) => {
					return {
						...(onlineRepoLookup.get(packId) ?? {
							characters: [],
							kind: [],
							authors: [],
						}),
						...localRepoLookup.get(packId),
						...tempRepoLookup.get(packId),
						autoloading: autoloads.has(packId),
						installed: localRepoLookup.has(packId),
						online:
							onlineRepoLookup.has(packId) ||
							tempRepoLookup.has(packId),
						loaded: loadedPacksSet.has(packId),
					} as Pack;
				});
		});

		this.authors = computed(() => {
			const onlineRepo = this.onlineRepo.value;
			const onlineAuthors = onlineRepo?.authors ?? {};

			const localRepo = this.localRepo.value;
			const localAuthors = localRepo?.authors ?? {};
			return {
				...onlineAuthors,
				...localAuthors,
			};
		});

		// Stop Vue from breaking this object.
		Object.freeze(this);
	}

	public async reloadLocalRepo() {
		this.localRepo.value = environment.supports.localRepo
			? await Repo.loadRepo(environment.localRepositoryUrl)
			: null;
	}

	public getPacks(): DeepReadonly<Pack[]> {
		return this.combinedList.value;
	}

	public hasPack(id: string, onlineOnly: boolean = false): boolean {
		if (onlineOnly) {
			return !!this.onlineRepo.value?.packs.find(
				(pack) => pack.id === id
			);
		}
		return !!this.getPacks().find((pack) => pack.id === id);
	}

	public getPack(id: string): DeepReadonly<Pack | null> {
		return this.getPacks().find((pack) => pack.id === id) ?? null;
	}

	public getAuthor(id: string): DeepReadonly<IAuthor | null> {
		return this.authors.value[id] || null;
	}

	public getAuthors(): DeepReadonly<IAuthors> {
		return this.authors.value;
	}

	public async loadTempPack(url: string): Promise<string | null> {
		const req = fetch(url);
		let res: Response;
		try {
			res = await req;
		} catch {
			throw new Error(`Failed to load '${url}'`);
		}

		if (!res.ok) {
			if (res.status === 404) {
				throw new Error(`The pack '${url}' does not exist anymore.`);
			}
			throw new Error(
				`Failed to load '${url}': ${res.statusText || res.status}`
			);
		}

		let body: TempRepoFile;
		try {
			body = await res.json();
		} catch (e) {
			throw new Error(
				`The contents of '${url}' is not a valid JSON: ${(e as Error).message}`
			);
		}
		if (!body.pack && (!body.packs || body.packs.length === 0)) {
			throw new Error(
				`The json file '${url}' does not contain any packages`
			);
		}
		if (body.authors) {
			for (const key in body.authors) {
				if (this.tempRepo.authors[key]) {
					this.tempRepo.authors[key] = body.authors[key];
				}
			}
		}

		let first: string | null = null;
		if (body.pack) {
			this.addTempPack(body.pack, url);
			first = body.pack.id;
		}
		if (body.packs) {
			for (const pack of body.packs) {
				this.addTempPack(pack, url);
				if (first === null) {
					first = pack.id;
				}
			}
		}

		return first;
	}

	private addTempPack(
		pack: IPrimitivePack & { repoUrl?: string },
		baseUrl: string
	) {
		pack.repoUrl = baseUrl;
		// Allow paths relative to the repo.json
		if (pack.dddg1Path) {
			pack.dddg1Path = new URL(pack.dddg1Path, baseUrl).toString();
		}
		if (pack.dddg2Path) {
			pack.dddg2Path = new URL(pack.dddg2Path, baseUrl).toString();
		}

		if (pack.preview) {
			for (let i = 0; i < pack.preview.length; ++i) {
				pack.preview[i] = new URL(pack.preview[i], baseUrl).toString();
			}
		}
		if (!this.tempRepo.packs.find((x) => x.id === pack.id)) {
			this.tempRepo.packs.push(pack);
		}
	}
}

export interface TempRepoFile {
	pack?: IPrimitivePack & { repoUrl?: string };
	packs?: (IPrimitivePack & { repoUrl?: string })[];
	authors?: IAuthors;
}

export interface Pack extends IPrimitivePack {
	autoloading: boolean;
	online: boolean;
	installed: boolean;
	loaded: boolean;
	repoUrl?: string;
}
