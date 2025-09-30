import { undoAble } from '@/history-engine/history';
import type { IAssetSwitch } from '@/store/content';
import { arraySeeker } from '@/util/seekers';
import type { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { markRaw, ref, type Raw, type Ref } from 'vue';
import { content } from './content';
import Character from './object-types/character';
import Choice from './object-types/choices';
import Notification from './object-types/notification';
import type BaseObject from './object-types/object';
import type { GenObject } from './object-types/object';
import Poem from './object-types/poem';
import Sprite from './object-types/sprite';
import Textbox from './object-types/textbox';
import { state } from './root';
import { HasSpriteFilters, loadFilters } from './sprite-options';

export const panels = new (class Panels {
	private _panels: Ref<Record<Panel['id'], Raw<Panel>>> = ref({});
	private _order: Ref<Panel['id'][]> = ref([]);
	private _lastPanelId = -1;

	constructor() {
		Object.seal(this);
	}

	get panels(): Readonly<Record<Panel['id'], Raw<Panel>>> {
		return this._panels.value;
	}

	get order(): Readonly<Panel['id'][]> {
		return this._order.value;
	}

	get lastPanelId(): number {
		return this._lastPanelId;
	}

	/**
	 * Creates a new, empty panel at the end.
	 */
	createPanel(): Panel {
		const oldPanelId = this._lastPanelId;
		const panelId = oldPanelId + 1;
		const panel = new Panel(panelId);
		undoAble(
			() => {
				this._lastPanelId = panelId;
				this._panels.value[panel.id] = markRaw(panel);
				this._order.value.push(panel.id);
			},
			() => {
				this._lastPanelId = oldPanelId;
				delete this._panels.value[panel.id];
				this._order.value.pop();
			}
		);
		return panel;
	}

	duplicatePanel(panel: Panel) {
		const oldPanelId = this._lastPanelId;
		const panelId = oldPanelId + 1;
		const newPanel = Panel.fromExisting(panel, panelId);
		const idx = this._order.value.indexOf(panel.id);
		undoAble(
			() => {
				this._lastPanelId = panelId;
				this._panels.value[panelId] = markRaw(newPanel);
				this._order.value.splice(idx + 1, 0, panelId);
			},
			() => {
				this._lastPanelId = oldPanelId;
				delete this._panels.value[panelId];
				this._order.value.splice(idx + 1, 1);
			}
		);
		return newPanel;
	}

	deletePanel(panel: Panel) {
		const idx = this._order.value.indexOf(panel.id);
		if (idx === -1) return;

		undoAble(
			() => {
				delete this._panels.value[panel.id];
				this._order.value.splice(idx, 1);
			},
			() => {
				this._panels.value[panel.id] = markRaw(panel);
				this._order.value.splice(idx, 0, panel.id);
			}
		);
	}

	movePanel(panel: Panel, delta: number) {
		const idx = this._order.value.indexOf(panel.id);
		if (idx === -1) return;

		undoAble(
			() => {
				this._order.value.splice(idx, 1);
				this._order.value.splice(idx + delta, 0, panel.id);
			},
			() => {
				this._order.value.splice(idx + delta, 1);
				this._order.value.splice(idx, 0, panel.id);
			}
		);
	}

	fixContentPackRemoval(oldContent: ContentPack<IAssetSwitch>) {
		for (const panel of Object.values(this._panels)) {
			panel.fixContentPackRemoval(oldContent);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public getSave(): any {
		return {
			lastPanelId: this._lastPanelId,
			panelOrder: [...this._order.value],
			currentPanel: state.viewports.list[0].currentPanel,
			panels: Object.fromEntries(
				Object.values(this._panels.value).map((panel) => [
					panel.id,
					panel.getSave(),
				])
			),
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public loadSave(data: any) {
		const panelOrder = data.panelOrder;
		const panels: Record<Panel['id'], Raw<Panel>> = {};
		let lastPanelId = -1;

		for (const panelKey of panelOrder) {
			const dataPanel = data.panels[panelKey];
			const panel = new Panel(+panelKey);
			panel.loadSave(dataPanel);
			panels[panel.id] = markRaw(panel);
			lastPanelId = Math.max(lastPanelId, panel.id);
		}

		this._order.value = panelOrder;
		this._panels.value = panels;
		this._lastPanelId = lastPanelId;
	}
})();

export class Panel extends HasSpriteFilters {
	public readonly background = new PanelBackground();
	private _lastObjId = -1;
	private _lowerOrder = ref<GenObject['id'][]>([]);
	private _topOrder = ref<GenObject['id'][]>([]);
	private _objects = ref<{ [id: GenObject['id']]: GenObject }>({});
	private _lastRender = ref<string | null>(null);

	constructor(public readonly id: number) {
		super();
	}

	public static fromExisting(panel: Panel, id: Panel['id']): Panel {
		const ret = new Panel(id);
		let lastObjId = -1;

		const newObjects: { [id: GenObject['id']]: GenObject } = {};
		const idTranslationTable = new Map<GenObject['id'], GenObject['id']>();

		// Generate a new ids for each object
		// These have to be known before we do the cloning, so that references between objects can be resolved correctly
		for (const key in panel.objects)
			idTranslationTable.set(+key, ++lastObjId);

		for (const key in panel.objects) {
			if (!Object.prototype.hasOwnProperty.call(panel.objects, key))
				continue;
			const obj = panel.objects[key] as GenObject;
			const newObj = obj.makeClone(ret, idTranslationTable);
			newObjects[newObj.id] = newObj;
		}

		ret._lastObjId = lastObjId;
		ret._lowerOrder.value = panel._lowerOrder.value.map(
			(oldId) => idTranslationTable.get(oldId)!
		);
		ret._topOrder.value = panel._topOrder.value.map(
			(oldId) => idTranslationTable.get(oldId)!
		);
		ret._objects.value = newObjects;
		ret._lastRender.value = panel._lastRender.value;
		ret._composite.value = panel._composite.value;
		ret._filters.value = panel._filters.value.map((x) =>
			markRaw(x.clone())
		);
		ret.background.fromExisting(panel.background);
		return ret;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public loadSave(data: any) {
		this.background.loadSave(data.background);
		this._filters.value = loadFilters(data.filters);
		this._composite.value = data.composite;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const objectLine: Record<string, any>[] = [];

		for (const key of [...data.order, ...data.onTopOrder]) {
			const obj = data.objects[key];
			if (obj == null) continue;
			objectLine.push(obj);
		}

		this.pasteObjects(objectLine);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public getSave(): any {
		return {
			id: this.id,
			background: this.background.getSave(),
			composite: this._composite.value,
			filters: this._filters.value.map((x) => x.getSave()),
			order: [...this._lowerOrder.value],
			onTopOrder: [...this._topOrder.value],
			lastObjId: this._lastObjId,
			objects: Object.fromEntries(
				Object.entries(this.objects).map(([id, obj]) => [
					id,
					obj.save(),
				])
			),
		};
	}

	public get lowerOrder(): GenObject['id'][] {
		return this._lowerOrder.value;
	}

	public get topOrder(): GenObject['id'][] {
		return this._topOrder.value;
	}

	public get objects(): { [id: GenObject['id']]: GenObject } {
		return this._objects.value;
	}

	public get lastRender(): string | null {
		return this._lastRender.value;
	}

	public set lastRender(url: string | null) {
		// NO UNDO: Rending typically happens implicitly asynchronously after a transaction. It is not triggered by
		//          user action. Also, undoing a whatever state change occured will already trigger a re-render.
		this._lastRender.value = url;
	}

	public get lastObjId(): number {
		return this._lastObjId;
	}

	public fixContentPackRemoval(oldContent: ContentPack<IAssetSwitch>) {
		this.background.fixContentPackRemoval(oldContent);
		for (const key in this.objects) {
			this.objects[key].fixContentPackRemoval(oldContent);
		}
	}

	public insertObject(object: GenObject, onTop: boolean) {
		const collection = onTop
			? this._topOrder.value
			: this._lowerOrder.value;
		const oldLastObjId = this._lastObjId;
		const _lastObjId = Math.max(oldLastObjId, object.id);

		undoAble(
			() => {
				this.objects[object.id] = markRaw(object);
				this._lastObjId = _lastObjId;
				collection.push(object.id);
			},
			() => {
				collection.pop();
				this._lastObjId = oldLastObjId;
				delete this.objects[object.id];
			}
		);
	}

	public removeObject(object: GenObject) {
		const collection = object.onTop
			? this._topOrder.value
			: this._lowerOrder.value;

		const idx = collection.indexOf(object.id);

		for (const obj of Object.values(this._objects.value) as GenObject[]) {
			if (obj === object) continue;
			obj.prepareSiblingRemoval(object);
		}

		for (const viewport of state.viewports.list) {
			if (
				viewport.currentPanel === this.id &&
				viewport.selection === object.id
			) {
				viewport.selection = null;
			}
		}

		undoAble(
			() => {
				collection.splice(idx, 1);
				delete this._objects.value[object.id];
			},
			() => {
				collection.splice(idx, 0, object.id);
				this._objects.value[object.id] = markRaw(object);
			}
		);
	}

	public setOnTop(object: BaseObject, onTop: boolean) {
		const sourceCollection = onTop
			? this._topOrder.value
			: this._lowerOrder.value;
		const targetCollection = onTop
			? this._lowerOrder.value
			: this._topOrder.value;
		const oldIdx = sourceCollection.indexOf(object.id);
		if (oldIdx === -1) return;

		undoAble(
			() => {
				sourceCollection.splice(oldIdx, 1);
				targetCollection.push(object.id);
			},
			() => {
				sourceCollection.splice(oldIdx, 0, object.id);
				targetCollection.pop();
			}
		);
	}

	public shiftLayer(object: BaseObject, delta: number) {
		const collection = object.onTop
			? this._topOrder.value
			: this._lowerOrder.value;
		const oldIdx = collection.indexOf(object.id);
		const newIdx = Math.max(oldIdx + delta, 0);
		if (oldIdx === newIdx) return;

		undoAble(
			() => {
				collection.splice(oldIdx, 1);
				collection.splice(newIdx, 0, object.id);
			},
			() => {
				collection.splice(oldIdx, 0, object.id);
				collection.splice(newIdx, 1);
			}
		);
	}

	protected static objectClassTable: Record<
		GenObject['type'],
		{
			fromSave: (
				panel: Panel,
				save: Record<string, unknown>,
				idTranslationTable: IdTranslationTable
			) => GenObject;
		}
	> = {
		character: Character,
		choice: Choice,
		notification: Notification,
		poem: Poem,
		sprite: Sprite,
		textBox: Textbox,
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public pasteObjects(objects: Record<string, any>[]) {
		const idTranslationTable = new Map<
			BaseObject['id'],
			BaseObject['id']
		>();
		let lastObjId = this.lastObjId;

		for (const object of objects) {
			idTranslationTable.set(+object.id, ++lastObjId);
		}

		for (const object of objects) {
			const objClass =
				Panel.objectClassTable[object.type as GenObject['type']];
			if (!objClass) {
				throw new Error(`Unknown object type: ${object.type}`);
			}
			objClass.fromSave(this, object, idTranslationTable);
		}
	}
}

export const transparentId = 'buildin.transparent';
export const staticColorId = 'buildin.static-color';

export enum ScalingModes {
	None = 0,
	Stretch = 1,
	Cover = 2,
}

export class PanelBackground extends HasSpriteFilters {
	private _current = ref(transparentId);
	private _color = ref('#000000');
	private _flipped = ref(false);
	private _variant = ref(0);
	private _scaling = ref(ScalingModes.None);

	constructor() {
		super();
	}

	public fromExisting(background: PanelBackground): void {
		this._current.value = background.current;
		this._color.value = background.color;
		this._flipped.value = background.flipped;
		this._variant.value = background.variant;
		this._scaling.value = background.scaling;
		this._composite.value = background.composite;
		this._filters.value = background.filters.map((x) => markRaw(x.clone()));
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public getSave(): any {
		return {
			current: this.current,
			color: this.color,
			flipped: this.flipped,
			variant: this.variant,
			scaling: this.scaling,
			composite: this.composite,
			filters: this._filters.value.map((x) => x.getSave()),
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public loadSave(data: any) {
		this.current = data.current;
		this.color = data.color;
		this.flipped = data.flipped;
		this.variant = data.variant;
		this.scaling = data.scaling;
		this._composite.value = data.composite;
		this._filters.value = loadFilters(data.filters);
	}

	get current(): string {
		return this._current.value;
	}

	set current(value: string) {
		const old = this._current.value;
		const oldVariant = this._variant.value;
		undoAble(
			() => {
				this._current.value = value;
				this._variant.value = 0;
			},
			() => {
				this._current.value = old;
				this._variant.value = oldVariant;
			}
		);
	}

	get color(): string {
		return this._color.value;
	}

	set color(value: string) {
		const old = this._color.value;
		undoAble(
			() => void (this._color.value = value),
			() => void (this._color.value = old)
		);
	}

	get flipped(): boolean {
		return this._flipped.value;
	}

	set flipped(value: boolean) {
		const old = this._flipped.value;
		undoAble(
			() => void (this._flipped.value = value),
			() => void (this._flipped.value = old)
		);
	}

	get variant(): number {
		return this._variant.value;
	}

	set variant(value: number) {
		const old = this._variant.value;
		undoAble(
			() => void (this._variant.value = value),
			() => void (this._variant.value = old)
		);
	}

	get scaling(): ScalingModes {
		return this._scaling.value;
	}

	set scaling(value: ScalingModes) {
		const old = this._scaling.value;
		undoAble(
			() => void (this._scaling.value = value),
			() => void (this._scaling.value = old)
		);
	}

	public seekBackgroundVariant(delta: 1 | -1) {
		const backgrounds = content.backgrounds;
		const background = backgrounds.get(this.current);
		if (!background) return;

		const newVariantIdx = arraySeeker(
			background.variants,
			this.variant,
			delta
		);
		const old = this.variant;
		undoAble(
			() => void (this.variant = newVariantIdx),
			() => void (this.variant = old)
		);
	}

	public fixContentPackRemoval(oldContent: ContentPack<IAssetSwitch>) {
		const oldBackground = oldContent.backgrounds.find(
			(x) => x.id === this.current
		);
		// Probably build in?
		if (!oldBackground) return;

		const newBackground = content.backgrounds.get(this.current);

		if (!newBackground) {
			// Background was removed
			if (content.current.backgrounds.length > 0) {
				this.current = content.current.backgrounds[0].id;
			} else {
				this.current = 'buildin.transparent';
			}
			return;
		}

		const oldVariantJSON = JSON.stringify(
			oldBackground.variants[this.variant]
		);
		const newVariantIdx = newBackground.variants.findIndex(
			(variant) => JSON.stringify(variant) === oldVariantJSON
		);
		if (newVariantIdx !== this.variant) {
			this.variant = newVariantIdx === -1 ? 0 : newVariantIdx;
		}
	}
}

export type IdTranslationTable = Map<BaseObject['id'], BaseObject['id']>;
