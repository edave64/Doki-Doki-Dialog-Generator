import { Module } from 'vuex';
import { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAsset, BackgroundLookup } from './content';
import { IRootState } from '.';
import { arraySeeker } from '@/models/seekers';
import { ICopyObjectsAction, IDeleteAllOfPanel } from './objects';
import {
	addFilter,
	IAddFilterAction,
	IHasSpriteFilters,
	IMoveFilterAction,
	IRemoveFilterAction,
	ISetCompositionMutation,
	ISetFilterAction,
	ISetFiltersMutation,
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
	id: string;
	background: IPanelBackground;
	lastRender: string;
}

interface IPanelBackground extends IHasSpriteFilters {
	current: string;
	color: string;
	flipped: boolean;
	variant: number;
	scaling: ScalingModes;
}

export interface IPanels {
	panels: { [id: string]: IPanel };
	panelOrder: string[];
	currentPanel: string;
}

export const transparentId = 'buildin.transparent';
export const staticColorId = 'buildin.static-color';

let lastPanelNum = 0;

const previewManager = {
	panelToUrl: new Map<string, string>(),
	urlToPanel: new Map<string, string[]>(),
	register(panelId: string, url: string) {
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
	unregister(panelId: string, url: string) {
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

export default {
	namespaced: true,
	state: {
		panels: {},
		panelOrder: [],
		currentPanel: null!,
	},
	mutations: {
		setCurrentPanel(state, { panelId }: ISetCurrentPanelMutation) {
			state.currentPanel = panelId;
		},
		setPanelPreview(state, { panelId, url }: ISetPanelPreviewMutation) {
			state.panels[panelId].lastRender = url;
			previewManager.register(panelId, url);
		},
		createPanel(state, { panel }: ICreatePanel) {
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
			const obj = state.panels[command.id];
			obj.composite = command.composite;
		},
		setFilters(state, command: ISetFiltersMutation) {
			const obj = state.panels[command.id];
			obj.filters = command.filters;
		},
		backgroundSetComposition(state, command: ISetCompositionMutation) {
			const obj = state.panels[command.id];
			obj.background.composite = command.composite;
		},
		backgroundSetFilters(state, command: ISetFiltersMutation) {
			const obj = state.panels[command.id];
			obj.background.filters = command.filters;
		},
	},
	actions: {
		createPanel({ state, commit }) {
			const id = 'panel' + ++lastPanelNum;
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
				},
			} as ICreatePanel);
			if (!state.panelOrder) {
				commit('setPanelOrder', {
					panelOrder: [id],
				} as ISetPanelOrder);
			} else {
				commit('setPanelOrder', {
					panelOrder: [...state.panelOrder, id],
				} as ISetPanelOrder);
			}
			commit('setCurrentPanel', {
				panelId: id,
			} as ISetCurrentPanelMutation);
		},
		duplicatePanel(
			{ state, commit, dispatch },
			{ panelId }: IDuplicatePanelAction
		) {
			const panel = state.panels[panelId];
			const id = 'panel' + ++lastPanelNum;
			previewManager.register(id, panel.lastRender);
			commit('createPanel', {
				panel: {
					id,
					background: JSON.parse(JSON.stringify(panel.background)),
					lastRender: panel.lastRender,
					composite: panel.composite,
					filters: JSON.parse(JSON.stringify(panel.filters)),
				},
			} as ICreatePanel);
			dispatch(
				'objects/copyObjects',
				{
					sourcePanelId: panelId,
					targetPanelId: id,
				} as ICopyObjectsAction,
				{ root: true }
			);
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
		delete({ state, dispatch, commit }, { panelId }: IDeletePanelAction) {
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
			dispatch(
				'objects/deleteAllOfPanel',
				{
					panelId,
				} as IDeleteAllOfPanel,
				{ root: true }
			);
			commit('deletePanel', {
				panelId,
			} as IDeletePanelMutation);
		},
		async fixContentPackRemoval(
			{ state, rootGetters, commit, rootState },
			oldContent: ContentPack<IAsset>
		) {
			for (const panel of Object.values(state.panels)) {
				const oldBackground = oldContent.backgrounds.find(
					x => x.id === panel.background.current
				);
				// Probably build in?
				if (!oldBackground) return;

				const newBackground = (rootGetters[
					'content/getBackgrounds'
				] as BackgroundLookup).get(panel.background.current);

				if (!newBackground) {
					if (rootState.content.current.backgrounds[0]) {
						commit('setCurrentBackground', {
							current: rootState.content.current.backgrounds[0].id,
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
					variant => JSON.stringify(variant) === oldVariantJSON
				);
				if (newVariantIdx !== panel.background.variant) {
					commit('setBackgroundVariant', {
						variant: newVariantIdx === -1 ? 0 : newVariantIdx,
						panelId: panel.id,
					} as ISetVariantMutation);
				}
			}
		},
		move({ state, commit }, { panelId, delta }: IMovePanelAction) {
			const collection = [...state.panelOrder];
			const oldIdx = collection.indexOf(panelId);
			collection.splice(oldIdx, 1);
			const newIdx = Math.max(oldIdx + delta, 0);
			collection.splice(newIdx, 0, panelId);
			commit('setPanelOrder', { panelOrder: collection } as ISetPanelOrder);
		},
		addFilter({ state, commit }, action: IAddFilterAction) {
			addFilter(
				action,
				(id: string) => state.panels[id],
				mutation => commit('setFilters', mutation)
			);
		},
		removeFilter({ state, commit }, action: IRemoveFilterAction) {
			removeFilter(
				action,
				(id: string) => state.panels[id],
				mutation => commit('setFilters', mutation)
			);
		},
		moveFilter({ state, commit }, action: IMoveFilterAction) {
			moveFilter(
				action,
				(id: string) => state.panels[id],
				mutation => commit('setFilters', mutation)
			);
		},
		setFilter({ state, commit }, action: ISetFilterAction) {
			setFilter(
				action,
				(id: string) => state.panels[id],
				mutation => commit('setFilters', mutation)
			);
		},
		backgroundAddFilter({ state, commit }, action: IAddFilterAction) {
			addFilter(
				action,
				(id: string) => state.panels[id].background,
				mutation => commit('backgroundSetFilters', mutation)
			);
		},
		backgroundRemoveFilter({ state, commit }, action: IRemoveFilterAction) {
			removeFilter(
				action,
				(id: string) => state.panels[id].background,
				mutation => commit('backgroundSetFilters', mutation)
			);
		},
		backgroundMoveFilter({ state, commit }, action: IMoveFilterAction) {
			moveFilter(
				action,
				(id: string) => state.panels[id].background,
				mutation => commit('backgroundSetFilters', mutation)
			);
		},
		backgroundSetFilter({ state, commit }, action: ISetFilterAction) {
			setFilter(
				action,
				(id: string) => state.panels[id].background,
				mutation => commit('backgroundSetFilters', mutation)
			);
		},
	},
} as Module<IPanels, IRootState>;

export interface ISetCurrentPanelMutation {
	readonly panelId: string;
}

export interface IDeletePanelMutation {
	readonly panelId: string;
}

export interface ISetPanelPreviewMutation {
	readonly panelId: string;
	readonly url: string;
}

export interface IDuplicatePanelAction {
	readonly panelId: string;
}

export interface IDeletePanelAction {
	readonly panelId: string;
}

export interface ICreatePanel {
	readonly panel: IPanel;
}

export interface ISetPanelOrder {
	readonly panelOrder: string[];
}

export interface ISetCurrentMutation {
	readonly panelId: string;
	readonly current: string;
}

export interface ISetColorMutation {
	readonly panelId: string;
	readonly color: string;
}

export interface ISetFlipMutation {
	readonly panelId: string;
	readonly flipped: boolean;
}

export interface ISetVariantMutation {
	readonly panelId: string;
	readonly variant: number;
}

export interface ISetScalingMutation {
	readonly panelId: string;
	readonly scaling: ScalingModes;
}

export interface ISeekVariantAction {
	readonly delta: 1 | -1;
}

export interface IMovePanelAction {
	readonly panelId: string;
	readonly delta: number;
}
