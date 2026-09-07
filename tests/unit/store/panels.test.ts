import Sprite from '@/store/object-types/sprite';
import { Panel, panels } from '@/store/panels';
import { describe, expect, it, vi } from 'vitest';

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
