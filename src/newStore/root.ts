import { clearHistory } from '@/history-engine/history';
import { content } from './content';
import { panels } from './panels';
import type v2_4 from './saveFormat/v2-4';
import type v2_5 from './saveFormat/v2-5';
import { ui } from './ui';
import { uploadUrls } from './uploadUrls';
import { viewports } from './viewports';

export const state = Object.freeze({
	ui,
	panels,
	content,
	uploadUrls,
	viewports,
} as const);

export type IRootState = typeof state;

export async function loadSave(str: string) {
	await clearHistory(async () => {
		const data = JSON.parse(str);

		if (data.version == null || data.version < 2.5) {
			const a = await import('@/store/migrations/v2-5');
			a.migrateSave2_5(data as v2_4);
		}

		const migratedData = data as v2_5;

		state.ui.loadSave(migratedData.ui);
		state.panels.loadSave(migratedData.panels);
		state.content.loadSave(migratedData.content);
		state.uploadUrls.loadSave(migratedData.uploadUrls);

		/*

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
        */
	});
}

export async function getSave(compact: boolean) {
	return JSON.stringify(
		{
			// Note: This is the save version, not the program version.
			//       If there are no changes to the save format, do not increment.
			//       If this version does change, provide a migration function for older saves.
			version: 2.5,
			ui: state.ui.getSave(compact),
			panels: state.panels.getSave(compact),
			content: state.content.getSave(compact),
			uploadUrls: state.uploadUrls.getSave(compact),
		} as v2_5.Save,
		undefined,
		'\t'
	);
}
