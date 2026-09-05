import { Repo } from '@/models/repo';
import { content } from '@/store/content';
import { mergeContentPacks } from '@/store/content/merge';
import Sprite from '@/store/object-types/sprite';
import { Panel, panels } from '@/store/panels';
import { state } from '@/store/root';
import {
	DropShadowSpriteFilter,
	HasSpriteFilters,
	loadFilters,
	NumericSpriteFilter,
} from '@/store/sprite-options';
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

function makePack(overrides: Record<string, unknown> = {}) {
	return {
		packId: 'test.pack',
		dependencies: [],
		characters: [],
		fonts: [],
		sprites: [],
		poemStyles: [],
		poemBackgrounds: [],
		backgrounds: [],
		colors: [],
		...overrides,
	};
}

describe('mergeContentPacks', () => {
	it('merges unique content while preserving non-overlapping records', () => {
		const left = makePack({
			dependencies: ['dep-a'],
			backgrounds: [
				{
					id: 'bg-1',
					label: 'bg-1',
					variants: ['v1'],
					scaling: 0,
					sdVersion: undefined,
				},
			],
			characters: [
				{
					id: 'char-1',
					label: 'Char 1',
					chibi: false,
					defaultScale: [1, 1],
					hd: false,
					size: [100, 100],
					sdVersion: undefined,
					heads: {
						normal: {
							previewOffset: [0, 0],
							previewSize: [100, 100],
							variants: ['head-a'],
						},
					},
					styleGroups: [
						{
							id: 'sg-1',
							styleComponents: [
								{
									id: 'sc-1',
									label: 'sc-1',
									variants: { base: 'v1' },
								},
							],
							styles: [
								{
									components: { base: 'v1' },
									poses: [
										{
											id: 'pose-1',
											compatibleHeads: [],
											previewOffset: [0, 0],
											previewSize: [100, 100],
											scale: 1,
											size: [100, 100],
											renderCommands: [],
											positions: { front: [['front-a']] },
										},
									],
								},
							],
						},
					],
				},
			],
		});
		const right = makePack({
			dependencies: ['dep-b', 'dep-a'],
			backgrounds: [
				{
					id: 'bg-2',
					label: 'bg-2',
					variants: ['v2'],
					scaling: 1,
					sdVersion: undefined,
				},
				{
					id: 'bg-1',
					label: 'bg-1',
					variants: ['v1b'],
					scaling: 0,
					sdVersion: undefined,
				},
			],
			characters: [
				{
					id: 'char-1',
					label: 'Char 1',
					chibi: false,
					defaultScale: [1, 1],
					hd: false,
					size: [100, 100],
					sdVersion: undefined,
					heads: {
						normal: {
							previewOffset: [0, 0],
							previewSize: [100, 100],
							variants: ['head-b'],
						},
					},
					styleGroups: [
						{
							id: 'sg-1',
							styleComponents: [
								{
									id: 'sc-1',
									label: 'sc-1',
									variants: { base: 'v1' },
								},
							],
							styles: [
								{
									components: { base: 'v1' },
									poses: [
										{
											id: 'pose-1',
											compatibleHeads: [],
											previewOffset: [0, 0],
											previewSize: [100, 100],
											scale: 1,
											size: [100, 100],
											renderCommands: [],
											positions: { front: [['front-b']] },
										},
									],
								},
							],
						},
					],
				},
			],
		});

		const merged = mergeContentPacks(left, right);
		expect(merged.dependencies).toEqual(['dep-a', 'dep-b']);
		expect(merged.backgrounds.map((bg: { id: string }) => bg.id)).toEqual([
			'bg-1',
			'bg-2',
		]);
		expect(
			merged.backgrounds.find((bg: { id: string }) => bg.id === 'bg-1')
				?.variants
		).toEqual(['v1', 'v1b']);
		expect(merged.characters).toHaveLength(1);
		expect(merged.characters[0].heads.normal.variants).toEqual([
			'head-a',
			'head-b',
		]);
		expect(
			merged.characters[0].styleGroups[0].styles[0].poses[0].positions
				.front
		).toEqual([['front-a'], ['front-b']]);
	});
});

describe('sprite options', () => {
	it('builds numeric and shadow filters with independent clone state', () => {
		class TestFilters extends HasSpriteFilters {}
		const filters = new TestFilters();
		filters.addFilter('brightness', 0);
		filters.addFilter('drop-shadow', 1);
		filters.composite = 'multiply';

		expect(filters.filters).toHaveLength(2);
		expect(filters.filters[0]).toBeInstanceOf(NumericSpriteFilter);
		expect(
			(filters.filters[0] as NumericSpriteFilter<'brightness'>).value
		).toBe(1);
		expect(filters.filters[1]).toBeInstanceOf(DropShadowSpriteFilter);
		expect(filters.composite).toBe('multiply');

		const shadowClone = (
			filters.filters[1] as DropShadowSpriteFilter
		).clone();
		shadowClone.offsetX = 99;
		expect((filters.filters[1] as DropShadowSpriteFilter).offsetX).toBe(10);
		expect(shadowClone.offsetX).toBe(99);

		const payload = filters.filters.map((filter) => filter.getSave());
		const reloaded = loadFilters(payload);
		expect(reloaded.map((filter) => filter.type)).toEqual([
			'brightness',
			'drop-shadow',
		]);
		expect((reloaded[0] as NumericSpriteFilter<'brightness'>).value).toBe(
			1
		);
		expect((reloaded[1] as DropShadowSpriteFilter).offsetX).toBe(10);
		filters.removeFilter(0);
		expect(filters.filters).toHaveLength(1);
		filters.moveFilter(0, 1);
		expect(filters.filters[0].type).toBe('drop-shadow');
	});
});

describe('panel lifecycle', () => {
	it('creates, duplicates, reorders, and removes objects while preserving references', () => {
		const first = panels.createPanel();
		const second = panels.createPanel();
		panels.movePanel(second, -1);
		expect(panels.order).toEqual([second.id, first.id]);

		const copy = panels.duplicatePanel(first);
		expect(copy.id).toBeGreaterThan(first.id);
		expect(panels.order).toEqual([second.id, first.id, copy.id]);

		const original = {
			id: 101,
			onTop: false,
			prepareSiblingRemoval: vi.fn(),
		} as unknown as Sprite;
		first.insertObject(original, false);
		expect(first.objects[101]).toBe(original);
		first.removeObject(original);
		expect(first.objects[101]).toBeUndefined();

		const panel = new Panel(7);
		const duplicateSource = {
			id: 10,
			onTop: false,
			prepareSiblingRemoval: vi.fn(),
			makeClone: vi.fn(
				(targetPanel: Panel, table: Map<number, number>) => ({
					id: table.get(10)!,
					onTop: false,
					prepareSiblingRemoval: vi.fn(),
					makeClone: vi.fn(),
					save: () => ({
						id: table.get(10)!,
						type: 'sprite',
						panelId: targetPanel.id,
					}),
				})
			),
		};
		//@ts-expect-error: private access, ok for tests
		panel._objects.value = { 10: duplicateSource };
		//@ts-expect-error: private access, ok for tests
		panel._lowerOrder.value = [10];
		//@ts-expect-error: private access, ok for tests
		panel._lastObjId = 10;
		const clone = Panel.fromExisting(panel, 8);
		expect(clone.objects).toHaveProperty('0');
		expect(Object.values(clone.objects)[0].id).toBe(0);
		expect(Object.values(clone.objects)[0].save().panelId).toBe(8);
	});
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

beforeEach(() => {
	resetSingletonState();
	vi.restoreAllMocks();
});
