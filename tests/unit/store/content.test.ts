import { mergeContentPacks } from '@/store/content/merge';
import { describe, expect, it } from 'vitest';

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
