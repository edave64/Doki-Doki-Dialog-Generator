import { ref } from 'vue';
import { content } from './content';
import { panels } from './panels';
import { ui } from './ui';
import { uploadUrls } from './upload-urls';
import { viewports } from './viewports';

const CURRENT_VERSION = 2.6;

const fromVersion = ref(CURRENT_VERSION);

export const state = {
	ui,
	panels,
	content,
	uploadUrls,
	viewports,
	unsafe: false,

	get fromVersion() {
		return fromVersion.value;
	},

	async loadSave(str: string): Promise<void> {
		const data = JSON.parse(str);

		await content.loadSave(data.content);

		const version = getSaveVersion(data);
		if (version <= 2.4) {
			const migrator = await import('@/store/migrations/v2-5');
			migrator.migrateSave2_5(data, state);
		}
		fromVersion.value = version;

		uploadUrls.loadSave(data.uploadUrls);
		panels.loadSave(data.panels, version);
		viewports.loadSave(data.panels);
	},

	async getSave(compact: boolean): Promise<string> {
		return JSON.stringify(
			{
				version: CURRENT_VERSION,
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

/* eslint-disable @typescript-eslint/no-explicit-any */
function getSaveVersion(data: any) {
	if (data.version == null) {
		for (const panel of Object.values(data.panels.panels) as any[]) {
			for (const object of Object.values(panel.objects) as any[]) {
				if ('scaleX' in object) {
					return 2.5;
				}
				return 2.4;
			}
		}
	}
	return data.version;
}

Object.freeze(state);

export type IRootState = typeof state;
