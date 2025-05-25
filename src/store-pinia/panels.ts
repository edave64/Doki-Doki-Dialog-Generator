import { arraySeeker } from '@/util/seekers';
import type { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { defineStore } from 'pinia';

export enum ScalingModes {
	None = 0,
	Stretch = 1,
	Cover = 2,
}

export interface IPanel extends IHasSpriteFilters {}

export interface IPanels {
	lastPanelId: IPanel['id'];
	panels: { [id: IPanel['id']]: IPanel };
	panelOrder: IPanel['id'][];
	currentPanel: IPanel['id'];
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

export const useCounterStore = defineStore('panels', {
	state: () => {
		return {
			lastPanelId: -1 as IPanel['id'],
			panels: {} as Record<IPanel['id'], IPanel>,
			panelOrder: [] as IPanel['id'][],
			currentPanel: null! as IPanel['id'],
		};
	},
	actions: {
		setPanelPreview(panelId: IPanel['id'], url: string) {
			this.panels[panelId].lastRender = url;
			previewManager.register(panelId, url);
		},
		createPanel(state, { panel }: ICreatePanel) {
			state.lastPanelId = panel.id;
			state.panels[panel.id] = panel;
		},
		setPanelOrder(state, { panelOrder }: ISetPanelOrder) {
			state.panelOrder = [...panelOrder];
		},
		setCurrentBackground(state, { current, panelId }: ISetCurrentMutation) {
			const panel = state.panels[panelId];
			panel.background.current = current;
			panel.background.variant = 0;
		},
		setBackgroundColor(state, { color, panelId }: ISetColorMutation) {
			const panel = state.panels[panelId];
			panel.background.color = color;
		},
		setBackgroundFlipped(state, { flipped, panelId }: ISetFlipMutation) {
			const panel = state.panels[panelId];
			panel.background.flipped = flipped;
		},
		setBackgroundVariant(state, { variant, panelId }: ISetVariantMutation) {
			const panel = state.panels[panelId];
			panel.background.variant = variant;
		},
		setBackgroundScaling(state, { scaling, panelId }: ISetScalingMutation) {
			const panel = state.panels[panelId];
			panel.background.scaling = scaling;
		},
		deletePanel(state, { panelId }: IDeletePanelMutation) {
			previewManager.unregister(
				panelId,
				previewManager.panelToUrl.get(panelId)!
			);
			delete state.panels[panelId];
		},
		setComposition(state, command: ISetCompositionMutation) {
			const obj = state.panels[command.panelId];
			obj.composite = command.composite;
		},
		setFilters(state, command: ISetFiltersMutation) {
			const obj = state.panels[command.panelId];
			obj.filters = command.filters;
		},
		backgroundSetComposition(state, command: ISetCompositionMutation) {
			const obj = state.panels[command.panelId];
			obj.background.composite = command.composite;
		},
		backgroundSetFilters(state, command: ISetFiltersMutation) {
			const obj = state.panels[command.panelId];
			obj.background.filters = command.filters;
		},
	},
});

export default {
	namespaced: true,
	state: {
		lastPanelId: -1,
		panels: {},
		panelOrder: [],
		currentPanel: null!,
	},
	mutations: {
		...objectMutations,
	},
	actions: {
		createPanel({ state, commit }) {
			const id = state.lastPanelId + 1;
			commit('createPanel', {
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
			} as ICreatePanel);
			commit('setPanelOrder', {
				panelOrder: [...state.panelOrder, id],
			} as ISetPanelOrder);
			commit('setCurrentPanel', {
				panelId: id,
			} as ISetCurrentPanelMutation);
			return id;
		},
		duplicatePanel({ state, commit }, { panelId }: IDuplicatePanelAction) {
			const panel = state.panels[panelId];
			const id = state.lastPanelId + 1;
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
				if (obj.linkedTo != null) {
					obj.linkedTo = transationTable.get(obj.linkedTo)!;
				}
			}

			commit('createPanel', {
				panel: {
					...newPanel,
					id,
					lastObjId,
					objects: newObjects,
					order: newPanel.order.map((oldId) =>
						transationTable.get(oldId)
					),
					onTopOrder: newPanel.onTopOrder.map((oldId) =>
						transationTable.get(oldId)
					),
				},
			} as ICreatePanel);
			const oldIdx = state.panelOrder.indexOf(panelId);
			commit('setPanelOrder', {
				panelOrder: [
					...state.panelOrder.slice(0, oldIdx + 1),
					id,
					...state.panelOrder.slice(oldIdx + 1),
				],
			} as ISetPanelOrder);
			commit('setCurrentPanel', {
				panelId: id,
			} as ISetCurrentPanelMutation);
		},
		seekBackgroundVariant(
			{ state, rootGetters, commit },
			{ delta }: ISeekVariantAction
		) {
			const panel = state.panels[state.currentPanel];
			const backgrounds = rootGetters[
				'content/getBackgrounds'
			] as BackgroundLookup;
			const background = backgrounds.get(panel.background.current);
			if (!background) return;
			commit('setBackgroundVariant', {
				panelId: state.currentPanel,
				variant: arraySeeker(
					background.variants,
					panel.background.variant,
					delta
				),
			} as ISetVariantMutation);
		},
		delete({ state, commit }, { panelId }: IDeletePanelAction) {
			if (state.panelOrder.length <= 1) return;
			const orderIdx = state.panelOrder.indexOf(panelId);
			let newOrderIdx;
			if (orderIdx === state.panelOrder.length - 1) {
				newOrderIdx = orderIdx - 1;
			} else {
				newOrderIdx = orderIdx + 1;
			}
			commit('setCurrentPanel', {
				panelId: state.panelOrder[newOrderIdx],
			} as ISetCurrentPanelMutation);
			commit('setPanelOrder', {
				panelOrder: [
					...state.panelOrder.slice(0, orderIdx),
					...state.panelOrder.slice(orderIdx + 1),
				],
			} as ISetPanelOrder);
			commit('deletePanel', {
				panelId,
			} as IDeletePanelMutation);
		},
		fixContentPackRemoval(context, oldContent: ContentPack<IAssetSwitch>) {
			const { state, rootGetters, commit, rootState } = context;
			for (const panel of Object.values(state.panels)) {
				const oldBackground = oldContent.backgrounds.find(
					(x) => x.id === panel.background.current
				);
				// Probably build in?
				if (!oldBackground) return;

				const newBackground = (
					rootGetters['content/getBackgrounds'] as BackgroundLookup
				).get(panel.background.current);

				if (!newBackground) {
					if (rootState.content.current.backgrounds.length > 0) {
						commit('setCurrentBackground', {
							current:
								rootState.content.current.backgrounds[0].id,
							panelId: panel.id,
						} as ISetCurrentMutation);
					} else {
						commit('setCurrentBackground', {
							current: 'buildin.transparent',
							panelId: panel.id,
						} as ISetCurrentMutation);
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
					commit('setBackgroundVariant', {
						variant: newVariantIdx === -1 ? 0 : newVariantIdx,
						panelId: panel.id,
					} as ISetVariantMutation);
				}
			}

			objectsFixContentPackRemoval(context, oldContent);
		},
		move({ state, commit }, { panelId, delta }: IMovePanelAction) {
			const collection = [...state.panelOrder];
			const oldIdx = collection.indexOf(panelId);
			collection.splice(oldIdx, 1);
			const newIdx = Math.max(oldIdx + delta, 0);
			collection.splice(newIdx, 0, panelId);
			commit('setPanelOrder', {
				panelOrder: collection,
			} as ISetPanelOrder);
		},
		addFilter({ state, commit }, action: IAddFilterAction) {
			addFilter(
				action,
				() => state.panels[action.panelId],
				(mutation) => commit('setFilters', mutation)
			);
		},
		removeFilter({ state, commit }, action: IRemoveFilterAction) {
			removeFilter(
				action,
				() => state.panels[action.panelId],
				(mutation) => commit('setFilters', mutation)
			);
		},
		moveFilter({ state, commit }, action: IMoveFilterAction) {
			moveFilter(
				action,
				() => state.panels[action.panelId],
				(mutation) => commit('setFilters', mutation)
			);
		},
		setFilter({ state, commit }, action: ISetFilterAction) {
			setFilter(
				action,
				() => state.panels[action.panelId],
				(mutation) => commit('setFilters', mutation)
			);
		},
		backgroundAddFilter({ state, commit }, action: IAddFilterAction) {
			addFilter(
				action,
				() => state.panels[action.panelId].background,
				(mutation) => commit('backgroundSetFilters', mutation)
			);
		},
		backgroundRemoveFilter({ state, commit }, action: IRemoveFilterAction) {
			removeFilter(
				action,
				() => state.panels[action.panelId].background,
				(mutation) => commit('backgroundSetFilters', mutation)
			);
		},
		backgroundMoveFilter({ state, commit }, action: IMoveFilterAction) {
			moveFilter(
				action,
				() => state.panels[action.panelId].background,
				(mutation) => commit('backgroundSetFilters', mutation)
			);
		},
		backgroundSetFilter({ state, commit }, action: ISetFilterAction) {
			setFilter(
				action,
				() => state.panels[action.panelId].background,
				(mutation) => commit('backgroundSetFilters', mutation)
			);
		},
		...objectActions,
	},
} as Module<IPanels, IRootState>;
