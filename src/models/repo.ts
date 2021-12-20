import { IPack as IPrimitivePack } from '@edave64/dddg-repo-filters/dist/pack';
import { IAuthor, IAuthors } from '@edave64/dddg-repo-filters/dist/authors';
import environment from '@/environments/environment';
import eventBus, { ShowMessageEvent } from '@/eventbus/event-bus';
import { computed, ComputedRef, DeepReadonly, ref, Ref } from 'vue';
import { Store } from 'vuex';
import { IRootState } from '@/store';

const repoUrl = 'https://edave64.github.io/Doki-Doki-Dialog-Generator-Packs/';

export type LoadedRepo = {
	packs: IPrimitivePack[];
	authors: IAuthors;
};

export class Repo {
	private static instance: null | Promise<Repo>;
	public static setStore: ($store: Store<DeepReadonly<IRootState>>) => void;
	private static $store: Promise<Store<DeepReadonly<IRootState>>> = new Promise(
		(resolve, _reject) => {
			Repo.setStore = resolve;
		}
	);

	public static getInstance(): Promise<Repo> {
		if (!Repo.instance) Repo.instance = this.createInstance();
		return Repo.instance;
	}

	private static async createInstance(): Promise<Repo> {
		const onlineRepoLoading = Repo.loadRepo(repoUrl);
		const localRepoLoading = environment.supports.localRepo
			? await Repo.loadRepo(environment.localRepositoryUrl)
			: null;

		const [onlineRepoLoaded, localRepoLoaded, $store] = await Promise.all([
			onlineRepoLoading,
			localRepoLoading,
			Repo.$store,
		]);

		return new Repo(onlineRepoLoaded, localRepoLoaded, $store);
	}

	private static async loadRepo(repo: string): Promise<LoadedRepo | null> {
		try {
			const [packs, authors] = await Promise.all([
				Repo.fetchJSON<IPrimitivePack[]>(repo + 'repo.json'),
				Repo.fetchJSON<IAuthors>(repo + 'people.json'),
			]);
			return { packs, authors };
		} catch (e) {
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

	private readonly combinedList: ComputedRef<DeepReadonly<Pack[]>>;
	private readonly authors: ComputedRef<DeepReadonly<IAuthors>>;

	private constructor(
		onlineRepo: LoadedRepo | null,
		localRepo: LoadedRepo | null,
		private $store: Store<DeepReadonly<IRootState>>
	) {
		(window as any).repo = this;
		if (!onlineRepo) {
			onlineRepo = { authors: {}, packs: [] };
			eventBus.fire(new ShowMessageEvent("Couldn't load remote repository."));
		}
		if (!localRepo) {
			localRepo = { authors: {}, packs: [] };
			if (environment.supports.localRepo) {
				eventBus.fire(new ShowMessageEvent("Couldn't load local repository."));
			}
		}
		this.onlineRepo = ref(onlineRepo);
		this.localRepo = ref(localRepo);

		this.combinedList = computed(() => {
			const onlineRepo = this.onlineRepo.value;
			const onlinePacks = onlineRepo?.packs ?? [];
			const onlineRepoLookup = new Map(
				onlinePacks.map(pack => [pack.id, pack])
			);

			const localRepo = this.localRepo.value;
			const localPacks = localRepo?.packs ?? [];
			const localRepoLookup = new Map(localPacks.map(pack => [pack.id, pack]));

			const autoloads = new Set(environment.state.autoAdd);
			const loadedPackOrder = this.$store.state.content.contentPacks
				.map(pack => pack.packId)
				.filter(packId => !!packId) as string[];
			const loadedPacksSet = new Set(loadedPackOrder) as Set<string>;

			const addedPacks = new Set();
			return [
				...loadedPackOrder,
				...localPacks.map(pack => pack.id),
				...onlinePacks.map(pack => pack.id),
			]
				.filter(packId => {
					if (
						packId.startsWith('dddg.buildin.') ||
						packId.startsWith('dddg.desktop.')
					)
						return false;
					if (addedPacks.has(packId)) return false;
					addedPacks.add(packId);
					return true;
				})
				.map(packId => {
					return {
						...(onlineRepoLookup.get(packId) ?? {
							characters: [],
							kind: [],
							authors: [],
						}),
						...(localRepoLookup.get(packId) ?? {}),
						autoloading: autoloads.has(packId),
						installed: localRepoLookup.has(packId),
						online: onlineRepoLookup.has(packId),
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

	public getPack(id: string): DeepReadonly<Pack> {
		return this.getPacks().find(pack => pack.id === id)!;
	}

	public getAuthor(id: string): DeepReadonly<IAuthor | null> {
		return this.authors.value[id] || null;
	}

	public getAuthors(): DeepReadonly<IAuthors> {
		return this.authors.value;
	}
}

export interface Pack extends IPrimitivePack {
	autoloading: boolean;
	online: boolean;
	installed: boolean;
	loaded: boolean;
}
