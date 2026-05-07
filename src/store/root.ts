import { clearHistory } from '@/history-engine/history';
import { content } from './content';
import { panels } from './panels';
import { ui } from './ui';
import { uploadUrls } from './upload-urls';
import { viewports } from './viewports';

export const state = {
	ui,
	panels,
	content,
	uploadUrls,
	viewports,
	unsafe: false,

	async loadSave(str: string): Promise<void> {
		const data = JSON.parse(str);

		if (data.version == null || data.version < 2.5) {
			const a = await import('@/store/migrations/v2-5');
			a.migrateSave2_5(data);
		}

		await content.loadSave(data.content);
		uploadUrls.loadSave(data.uploadUrls);
		panels.loadSave(data.panels);
		viewports.loadSave(data.panels);
	},

	async getSave(compact: boolean): Promise<string> {
		return JSON.stringify(
			{
				version: 2.5,
				panels: panels.getSave(),
				content: await content.getSave(compact),
				uploadUrls: uploadUrls.getSave(compact),
				unsafe: false,
			},
			undefined,
			'\t'
		);
	},
} as const;

Object.freeze(state);

export type IRootState = typeof state;
