import { content } from '@/store/content';
import Character from '@/store/object-types/character';
import Sprite from '@/store/object-types/sprite';
import Textbox from '@/store/object-types/textbox';
import { IdTranslationTable, Panel, panels } from '@/store/panels';
import { describe, expect, it, vi } from 'vitest';

describe('panel lifecycle', () => {
	it('Cloning renumbers objects, but preserves references', () => {
		const characterA = {
			id: 'character-a',
			hd: false,
			size: [100, 100],
			defaultScale: [1, 1],
			label: 'A',
		};
		const characterB = { ...characterA, id: 'character-b', label: 'B' };
		vi.spyOn(content, 'characters', 'get').mockReturnValue(
			new Map([
				[characterA.id, characterA],
				[characterB.id, characterB],
			]) as never
		);

		const panel = new Panel(0);
		const charA = Character.fromSave(
			panel,
			{ id: 47, characterType: characterA.id, onTop: false },
			identityTable
		);
		const charB = Character.fromSave(
			panel,
			{
				id: 53,
				characterType: characterB.id,
				onTop: false,
				linkedTo: charA.id,
			},
			identityTable
		);
		const textbox = Textbox.fromSave(
			panel,
			{
				id: 89,
				panelId: panel.id,
				onTop: true,
				talkingObjId: charB.id,
			},
			identityTable
		);

		const clone = Panel.fromExisting(panel, 1);

		const clonedA = clone.objects[0] as Character;
		expect(clonedA.id).toBe(0);
		expect(clonedA).toBeInstanceOf(Character);
		expect(clonedA.characterType).toBe(characterA.id);

		const clonedB = clone.objects[1] as Character;
		expect(clonedB.id).toBe(1);
		expect(clonedB).toBeInstanceOf(Character);
		expect(clonedB.characterType).toBe(characterB.id);
		expect(clonedB.linkedTo).toBe(clonedA.id);

		const clonedTextbox = clone.objects[2] as Textbox;
		expect(clonedTextbox.id).toBe(2);
		expect(clonedTextbox).toBeInstanceOf(Textbox);
		expect(clonedTextbox.talkingObjId).toBe(clonedB.id);
	});

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

/**
 * fromSave methods are handy for testing, they demand a translation table.
 * For our test objects, we don't want to translate anything, so we pass this mock instead.
 * It cannot be iterated at all, but that's not something fromSave should do.
 */
const identityTable: IdTranslationTable = Object.freeze({
	get: (id: number) => id,
	has: (id: number) => true,
	set: (id: number) => identityTable,
	delete: (id: number) => true,
	clear: () => true,
	forEach: () => true,
	size: 0,
	entries: () => [][Symbol.iterator](),
	keys: () => [][Symbol.iterator](),
	values: () => [][Symbol.iterator](),
	[Symbol.iterator]: () => new Map()[Symbol.iterator](),
	[Symbol.toStringTag]: 'Map',
});
