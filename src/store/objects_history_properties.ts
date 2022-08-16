import { IHistoryOptions } from '@/plugins/vuex-history';
import SpriteHistoryOptions from './objectTypes/sprite_history_properties';

export default {
	mutations: {
		'panels/*': {
			combinable: (oldMut, newMut) =>
				oldMut.type === newMut.type &&
				oldMut.payload.id === newMut.payload.id &&
				oldMut.payload.panelId === newMut.payload.panelId &&
				oldMut.payload.key === newMut.payload.key,
		},
		'panels/create': {
			combinable: () => false,
		},
		'panels/removeObject': {
			combinable: () => false,
		},
		...SpriteHistoryOptions.mutations,
	},
} as IHistoryOptions;
