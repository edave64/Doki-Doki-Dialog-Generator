import { content } from '@/store/content';
import Character from '@/store/object-types/character';
import Sprite from '@/store/object-types/sprite';
import Textbox from '@/store/object-types/textbox';
import { IdTranslationTable, Panel, panels } from '@/store/panels';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('panel lifecycle', () => {
	beforeEach(() => {
		panels.loadSave({ panelOrder: [], panels: {} }, 0);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('creates panels', () => {
		const first = panels.createPanel();
		const second = panels.createPanel();

		expect(first.id).toBe(0);
		expect(second.id).toBe(1);
		expect(panels.order).toEqual([first.id, second.id]);
	});

	it('reorders panels', () => {
		const first = panels.createPanel();
		const second = panels.createPanel();

		panels.movePanel(second, -1);

		expect(panels.order).toEqual([second.id, first.id]);
	});

	it('duplicates panels', () => {
		const first = panels.createPanel();

		const copy = panels.duplicatePanel(first);

		expect(copy.id).toBeGreaterThan(first.id);
		expect(panels.order).toEqual([first.id, copy.id]);
	});

	it('inserts and removes objects', () => {
		const panel = new Panel(0);
		const original = Sprite.fromSave(
			panel,
			{ id: 101, onTop: false, assets: [] },
			identityTable
		);

		expect(panel.objects[original.id]).toBe(original);
		panel.removeObject(original);
		expect(panel.objects[original.id]).toBeUndefined();
	});

	it('renumbers objects when duplicating a panel', () => {
		const panel = new Panel(7);
		Sprite.fromSave(
			panel,
			{ id: 10, onTop: false, assets: [] },
			identityTable
		);

		const clone = Panel.fromExisting(panel, 8);
		const clonedObject = Object.values(clone.objects)[0];

		expect(clone.objects).toHaveProperty('0');
		expect(clonedObject.id).toBe(0);
		expect(clonedObject.save().panelId).toBe(8);
	});

	it('preserves references when cloning', () => {
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
