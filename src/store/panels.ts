import { arraySeeker } from '@/models/seekers';
import { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { defineStore } from 'pinia';
import { IRootState } from '.';
import { BackgroundLookup, IAssetSwitch, useContentStore } from './content';
import {
	actions as objectActions,
	IObject,
	ISetCompositionMutation,
	ISetFiltersMutation,
	mutations as objectMutations,
	fixContentPackRemoval as objectsFixContentPackRemoval,
} from './objects';
import { ITextBox } from './objectTypes/textbox';
import {
	addFilter,
	IAddFilterAction,
	IHasSpriteFilters,
	IMoveFilterAction,
	IRemoveFilterAction,
	ISetFilterAction,
	moveFilter,
	removeFilter,
	setFilter,
} from './sprite_options';

export enum ScalingModes {
	None = 0,
	Stretch = 1,
	Cover = 2,
}

export interface IPanel extends IHasSpriteFilters {
	id: number;
	background: IPanelBackground;
	lastRender: string;
	lastObjId: IObject['id'];
	order: IObject['id'][];
	onTopOrder: IObject['id'][];
	objects: { [id: IObject['id']]: IObject };
}

interface IPanelBackground extends IHasSpriteFilters {
	current: string;
	color: string;
	flipped: boolean;
	variant: number;
	scaling: ScalingModes;
}

export const transparentId = 'buildin.transparent';
export const staticColorId = 'buildin.static-color';

const previewManager = {
	panelToUrl: new Map<IPanel['id'], string>(),
	urlToPanel: new Map<string, IPanel['id'][]>(),
	register(panelId: IPanel['id'], url: string) {
		if (this.panelToUrl.has(panelId)) {
			if (this.panelToUrl.get(panelId) === url) return;
			this.unregister(panelId, this.panelToUrl.get(panelId)!);
		}
		this.panelToUrl.set(panelId, url);
		if (this.urlToPanel.has(url)) {
			this.urlToPanel.get(url)!.push(panelId);
		} else {
			this.urlToPanel.set(url, [panelId]);
		}
	},
	unregister(panelId: IPanel['id'], url: string) {
		if (this.urlToPanel.has(url)) {
			const panels = this.urlToPanel.get(url)!;
			panels.splice(panels.indexOf(panelId), 1);
			if (panels.length === 0) {
				this.urlToPanel.delete(url);
				URL.revokeObjectURL(url);
			}
		}
		this.panelToUrl.delete(panelId);
	},
};

export const usePanelsStore = defineStore('panels', {
	state: () => ({
		lastPanelId: -1,
		panels: new Map<IPanel['id'], IPanel>(),
		panelOrder: [] as IPanel['id'][],
		currentPanel: null! as IPanel['id'],
	}),
	actions: {
		setCurrentPanel(panelId: IPanel['id']) {
			this.currentPanel = panelId;
		},
		setPanelPreview(panelId: IPanel['id'], url: string) {
			this.panels[panelId].lastRender = url;
			previewManager.register(panelId, url);
		},
		addPanel(panel: IPanel) {
			this.lastPanelId = panel.id;
			this.panels[panel.id] = panel;
		},
		setPanelOrder(panelOrder: IPanel['id'][]) {
			this.panelOrder = [...panelOrder];
		},
		setCurrentBackground(current: string, panelId: IPanel['id']) {
			const panel = this.panels[panelId];
			panel.background.current = current;
			panel.background.variant = 0;
		},
		setBackgroundColor(color: string, panelId: IPanel['id']) {
			const panel = this.panels[panelId];
			panel.background.color = color;
		},
		setBackgroundFlipped(flipped: boolean, panelId: IPanel['id']) {
			const panel = this.panels[panelId];
			panel.background.flipped = flipped;
		},
		setBackgroundVariant(variant: string, panelId: IPanel['id']) {
			const panel = this.panels[panelId];
			panel.background.variant = variant;
		},
		setBackgroundScaling(scaling: string, panelId: IPanel['id']) {
			const panel = this.panels[panelId];
			panel.background.scaling = scaling;
		},
		deletePanel(panelId: IPanel['id']) {
			previewManager.unregister(
				panelId,
				previewManager.panelToUrl.get(panelId)!
			);
			delete this.panels[panelId];
		},
		setComposition(command: ISetCompositionMutation) {
			const obj = this.panels[command.panelId];
			obj.composite = command.composite;
		},
		setFilters(command: ISetFiltersMutation) {
			const obj = this.panels[command.panelId];
			obj.filters = command.filters;
		},
		backgroundSetComposition(command: ISetCompositionMutation) {
			const obj = this.panels[command.panelId];
			obj.background.composite = command.composite;
		},
		backgroundSetFilters(command: ISetFiltersMutation) {
			const obj = this.panels[command.panelId];
			obj.background.filters = command.filters;
		},
		...objectMutations,
		createPanel() {
			const id = this.lastPanelId + 1;
			this.addPanel({
				panel: {
					id,
					background: {
						color: '#000000',
						current: transparentId,
						flipped: false,
						scaling: ScalingModes.Cover,
						variant: 0,
						composite: 'source-over',
						filters: [],
					},
					lastRender: '',
					composite: 'source-over',
					filters: [],
					objects: {},
					onTopOrder: [],
					order: [],
					lastObjId: -1,
				},
			});
			this.setPanelOrder([...this.panelOrder, id]);
			this.setCurrentPanel(id);
			return id;
		},
		duplicatePanel(panelId: IPanel['id']) {
			const panel = this.panels[panelId];
			const id = this.lastPanelId + 1;
			previewManager.register(id, panel.lastRender);
			const newPanel = JSON.parse(JSON.stringify(panel)) as IPanel;
			let lastObjId = -1;
			const transationTable = new Map<IObject['id'], IObject['id']>();
			const newObjects: IPanel['objects'] = {};

			for (const key in newPanel.objects) {
				transationTable.set(+key, ++lastObjId);
			}

			for (const key in newPanel.objects) {
				const obj = newPanel.objects[key];
				const newId = transationTable.get(+key)!;
				newObjects[newId] = obj;
				obj.panelId = id;
				obj.id = newId;
				if ('talkingObjId' in obj) {
					const newTextbox = obj as ITextBox;
					if (
						newTextbox.talkingObjId !== null &&
						newTextbox.talkingObjId !== '$other$' &&
						transationTable.has(newTextbox.talkingObjId)
					) {
						newTextbox.talkingObjId = transationTable.get(
							newTextbox.talkingObjId
						)!;
					}
				}
			}

			this.addPanel({
				...newPanel,
				id,
				lastObjId,
				objects: newObjects,
				order: newPanel.order.map((oldId) => transationTable.get(oldId)),
				onTopOrder: newPanel.onTopOrder.map((oldId) =>
					transationTable.get(oldId)
				),
			});
			const oldIdx = this.panelOrder.indexOf(panelId);
			this.setPanelOrder([
				...this.panelOrder.slice(0, oldIdx + 1),
				id,
				...this.panelOrder.slice(oldIdx + 1),
			]);
			this.setCurrentPanel(id);
		},
		seekBackgroundVariant(delta: -1 | 1) {
			const content = useContentStore();
			const panel = this.panels[this.currentPanel];
			const backgrounds = content.getBackgrounds;
			const background = backgrounds.get(panel.background.current);
			if (!background) return;
			this.setBackgroundVariant(
				this.currentPanel,
				arraySeeker(background.variants, panel.background.variant, delta)
			);
		},
		delete(panelId: IPanel['id']) {
			if (this.panelOrder.length <= 1) return;
			const orderIdx = this.panelOrder.indexOf(panelId);
			let newOrderIdx;
			if (orderIdx === this.panelOrder.length - 1) {
				newOrderIdx = orderIdx - 1;
			} else {
				newOrderIdx = orderIdx + 1;
			}
			this.setCurrentPanel(this.panelOrder[newOrderIdx]);
			this.setPanelOrder([
				...this.panelOrder.slice(0, orderIdx),
				...this.panelOrder.slice(orderIdx + 1),
			]);
			this.deletePanel(panelId);
		},
		fixContentPackRemoval(oldContent: ContentPack<IAssetSwitch>) {
			const content = useContentStore();

			for (const panel of Object.values(this.panels) as IPanel[]) {
				const oldBackground = oldContent.backgrounds.find(
					(x) => x.id === panel.background.current
				);
				// Probably build in?
				if (!oldBackground) return;

				const newBackground = content.getBackgrounds.get(
					panel.background.current
				);

				if (!newBackground) {
					if (content.current.backgrounds.length > 0) {
						this.setCurrentBackground(
							content.current.backgrounds[0].id,
							panel.id
						);
					} else {
						this.setCurrentBackground('buildin.transparent', panel.id);
					}
					return;
				}

				const oldVariantJSON = JSON.stringify(
					oldBackground.variants[panel.background.variant]
				);
				const newVariantIdx = newBackground.variants.findIndex(
					(variant) => JSON.stringify(variant) === oldVariantJSON
				);
				if (newVariantIdx !== panel.background.variant) {
					this.setBackgroundVariant(
						newVariantIdx === -1 ? 0 : newVariantIdx,
						panel.id
					);
				}
			}

			objectsFixContentPackRemoval(this, oldContent);
		},
		move(panelId: IPanel['id'], delta: 1 | -1) {
			const collection = [...this.panelOrder];
			const oldIdx = collection.indexOf(panelId);
			collection.splice(oldIdx, 1);
			const newIdx = Math.max(oldIdx + delta, 0);
			collection.splice(newIdx, 0, panelId);
			this.setPanelOrder(collection);
		},
		addFilter(action: IAddFilterAction) {
			addFilter(
				action,
				() => this.panels[action.panelId],
				(mutation) => (this.filters = mutation)
			);
		},
		removeFilter(action: IRemoveFilterAction) {
			removeFilter(
				action,
				() => this.panels[action.panelId],
				(mutation) => (this.filters = mutation)
			);
		},
		moveFilter(action: IMoveFilterAction) {
			moveFilter(
				action,
				() => this.panels[action.panelId],
				(mutation) => (this.filters = mutation)
			);
		},
		setFilter(action: ISetFilterAction) {
			setFilter(
				action,
				() => this.panels[action.panelId],
				(mutation) => (this.filters = mutation)
			);
		},
		backgroundAddFilter(action: IAddFilterAction) {
			addFilter(
				action,
				() => this.panels[action.panelId].background,
				(mutation) => (this.filters = mutation)
			);
		},
		backgroundRemoveFilter(action: IRemoveFilterAction) {
			removeFilter(
				action,
				() => this.panels[action.panelId].background,
				(mutation) => (this.filters = mutation)
			);
		},
		backgroundMoveFilter(action: IMoveFilterAction) {
			moveFilter(
				action,
				() => this.panels[action.panelId].background,
				(mutation) => (this.filters = mutation)
			);
		},
		backgroundSetFilter(action: ISetFilterAction) {
			setFilter(
				action,
				() => this.panels[action.panelId].background,
				(mutation) => (this.filters = mutation)
			);
		},
		...objectActions,
	},
});
