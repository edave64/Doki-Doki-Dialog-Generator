import { Module } from 'vuex';
import { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAsset, BackgroundLookup } from './content';
import { IRootState } from '.';
import { arraySeeker } from '@/models/seekers';

export interface IBackground {
	current: string;
	color: string;
	flipped: boolean;
	variant: number;
	scaling: ScalingModes;
}

export enum ScalingModes {
	None = 0,
	Stretch = 1,
	Cover = 2,
}

export default {
	namespaced: true,
	state: {
		current: '',
		color: '#000000',
		flipped: false,
		scaling: ScalingModes.None,
		variant: 0,
	},
	mutations: {
		setCurrent(state, { current }: ISetCurrentMutation) {
			state.current = current;
			state.variant = 0;
		},
		setColor(state, { color }: ISetColorMutation) {
			state.color = color;
		},
		setFlipped(state, { flipped }: ISetFlipMutation) {
			state.flipped = flipped;
		},
		setVariant(state, { variant }: ISetVariantMutation) {
			state.variant = variant;
		},
		setScaling(state, { scaling }: ISetScalingMutation) {
			state.scaling = scaling;
		},
	},
	actions: {
		seekVariant({ state, rootGetters, commit }, { delta }: ISeekVariantAction) {
			const backgrounds = rootGetters[
				'content/getBackgrounds'
			] as BackgroundLookup;
			const background = backgrounds.get(state.current);
			if (!background) return;
			commit('setVariant', {
				variant: arraySeeker(background.variants, state.variant, delta),
			} as ISetVariantMutation);
		},
		async fixContentPackRemoval(
			{ state, rootGetters, commit, rootState },
			oldContent: ContentPack<IAsset>
		) {
			const oldBackground = oldContent.backgrounds.find(
				x => x.id === state.current
			);
			// Probably build in?
			if (!oldBackground) return;

			const newBackground = (rootGetters[
				'content/getBackgrounds'
			] as BackgroundLookup).get(state.current);

			if (!newBackground) {
				if (rootState.content.current.backgrounds[0]) {
					commit('setCurrent', {
						current: rootState.content.current.backgrounds[0].id,
					} as ISetCurrentMutation);
				} else {
					commit('setCurrent', {
						current: 'buildin.transparent',
					} as ISetCurrentMutation);
				}
				return;
			}

			const oldVariantJSON = JSON.stringify(
				oldBackground.variants[state.variant]
			);
			const newVariantIdx = newBackground.variants.findIndex(
				variant => JSON.stringify(variant) === oldVariantJSON
			);
			if (newVariantIdx !== state.variant) {
				commit('setVariant', {
					variant: newVariantIdx === -1 ? 0 : newVariantIdx,
				} as ISetVariantMutation);
			}
		},
	},
} as Module<IBackground, IRootState>;

export interface ISetCurrentMutation {
	current: string;
}

export interface ISetColorMutation {
	color: string;
}

export interface ISetFlipMutation {
	flipped: boolean;
}

export interface ISetVariantMutation {
	variant: number;
}

export interface ISetScalingMutation {
	scaling: ScalingModes;
}

export interface ISeekVariantAction {
	delta: 1 | -1;
}
