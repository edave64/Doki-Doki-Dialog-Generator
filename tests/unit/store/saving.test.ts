import { Repo } from '@/models/repo';
import { content } from '@/store/content';
import { panels } from '@/store/panels';
import { state } from '@/store/root';
import { uploadUrls } from '@/store/upload-urls';
import { viewports } from '@/store/viewports';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function resetSingletonState() {
	//@ts-expect-error: private access, ok for tests
	content._contentPacks.value = [];
	//@ts-expect-error: Cont
	panels._panels.value = {};
	//@ts-expect-error: Cont
	panels._order.value = [];
	//@ts-expect-error: Cont
	panels._lastPanelId = -1;
	//@ts-expect-error: Cont
	viewports._list = {};
	//@ts-expect-error: Cont
	viewports._currentViewportCount = 0;
	uploadUrls.urls = {};
}

beforeEach(() => {
	resetSingletonState();
	vi.restoreAllMocks();
});

describe('root save/load and upload urls', () => {
	it('saves compact shape and version-detects legacy saves', async () => {
		vi.spyOn(Repo, 'getInstance').mockResolvedValue({
			hasPack: () => false,
			getPack: () => null,
			loadTempPack: vi.fn(),
		} as unknown as Repo);
		await state.loadSave(
			JSON.stringify({
				version: undefined,
				panels: {
					panelOrder: [0],
					panels: {
						0: {
							id: 0,
							background: {
								current: 'buildin.transparent',
								color: '#000000',
								flipped: false,
								variant: 0,
								scaling: 0,
								composite: 'source-over',
								filters: [],
							},
							objects: {
								10: {
									id: 10,
									type: 'sprite',
									panelId: 0,
									onTop: false,
									scaleX: 1.5,
								},
							},
							order: [10],
							onTopOrder: [],
							filters: [],
							composite: 'source-over',
						},
					},
				},
				content: [],
				uploadUrls: [],
			})
		);

		expect(state.fromVersion).toBe(2.5);
		const viewport = viewports.setUpViewport(document);
		viewport.currentPanel = 0;
		const save = await state.getSave(true);
		const parsed = JSON.parse(save);
		expect(parsed.version).toBe(2.6);
		expect(parsed.uploadUrls).toEqual([]);
		expect(parsed.content).toEqual([]);
	});

	it('registers uploads and clears them on load', async () => {
		uploadUrls.urls = {};
		const url = await uploadUrls.add(
			'test-upload',
			'https://example.com/upload.png'
		);
		expect(url).toBe('uploads:test-upload');
		expect(uploadUrls.getSave(false)).toEqual(['test-upload']);
		await expect(
			uploadUrls.add('test-upload', 'https://example.com/other.png')
		).rejects.toThrow(/already/);

		uploadUrls.loadSave([]);
		expect(uploadUrls.urls).toEqual({});
	});
});
