import { content, type IAssetSwitch } from '@/store/content';
import Character from '@/store/object-types/character';
import { panels } from '@/store/panels';
import type { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const retainedPackId = 'test.retained';
const removablePackId = 'test.removable';

describe('content pack removal', () => {
	beforeEach(async () => {
		panels.loadSave({ panelOrder: [], panels: {} }, 0);
		content.loadSave([]);

		await content.replaceContentPack({
			processed: true,
			contentPack: makePack(retainedPackId, {
				backgrounds: [makeBackground('background.retained')],
				characters: [makeCharacter('character.retained', ['base'])],
			}),
		});
		await content.replaceContentPack({
			processed: true,
			contentPack: makePack(removablePackId, {
				backgrounds: [makeBackground('background.removed')],
				characters: [
					makeCharacter('character.removed', ['only-variant']),
					makeCharacter('character.retained', ['pack-variant']),
				],
			}),
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('removes characters if their character type is removed', () => {
		const panel = panels.createPanel();
		const removedCharacter = Character.create(panel, 'character.removed');

		// Stub out logging from `Character.fixContentPackRemoval`
		vi.spyOn(console, 'error').mockImplementation(() => {});

		content.removeContentPacks(new Set([removablePackId]));

		expect(content.loadedContentPacks).toEqual(new Set([retainedPackId]));
		expect(panel.objects[removedCharacter.id]).toBeUndefined();
	});

	it('repairs references to missing character parts', () => {
		const panel = panels.createPanel();
		const retainedCharacter = Character.create(panel, 'character.retained');
		retainedCharacter.setPart('accessory', 1);

		content.removeContentPacks(new Set([removablePackId]));

		expect(content.loadedContentPacks).toEqual(new Set([retainedPackId]));
		expect(panel.objects[retainedCharacter.id]).toBe(retainedCharacter);
		expect(retainedCharacter.posePositions.accessory).toBe(0);
	});

	it('repairs missing background', () => {
		const panel = panels.createPanel();
		expect(content.backgrounds.has('background.removed')).toBe(true);
		panel.background.current = 'background.removed';

		content.removeContentPacks(new Set([removablePackId]));

		expect(content.loadedContentPacks).toEqual(new Set([retainedPackId]));
		expect(panel.background.current).toBe('background.retained');

		content.removeContentPacks(new Set([retainedPackId]));

		expect(content.loadedContentPacks).toEqual(new Set());
		expect(panel.background.current).toBe('buildin.transparent');
	});
});

function makePack(
	packId: string,
	overrides: Record<string, unknown> = {}
): ContentPack<IAssetSwitch> {
	return {
		packId,
		dependencies: [],
		characters: [],
		fonts: [],
		sprites: [],
		poemStyles: [],
		poemBackgrounds: [],
		backgrounds: [],
		colors: [],
		...overrides,
	} as ContentPack<IAssetSwitch>;
}

function makeCharacter(id: string, accessoryVariants: string[]) {
	return {
		id,
		label: id,
		chibi: false,
		defaultScale: [1, 1],
		hd: false,
		size: [100, 100],
		sdVersion: undefined,
		heads: {},
		styleGroups: [
			{
				id: 'default',
				styleComponents: [],
				styles: [
					{
						components: {},
						poses: [
							{
								id: 'standing',
								compatibleHeads: [],
								previewOffset: [0, 0],
								previewSize: [100, 100],
								scale: 1,
								size: [100, 100],
								renderCommands: [],
								positions: {
									accessory: accessoryVariants.map(
										(variant) => [variant]
									),
								},
							},
						],
					},
				],
			},
		],
	};
}

function makeBackground(id: string) {
	return {
		id,
		label: id,
		variants: ['variant'],
		scaling: 0,
		sdVersion: undefined,
	};
}
