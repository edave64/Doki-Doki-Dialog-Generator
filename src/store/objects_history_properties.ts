import { IHistoryOptions } from '@/plugins/vuex-history';
import SpriteHistoryOptions from './objectTypes/sprite_history_properties';

export default {
	mutations: {
		'objects/*': {
			combinable: (oldMut, newMut) =>
				oldMut.type === newMut.type && oldMut.payload.id === newMut.payload.id,
		},
		'objects/create': {
			combinable: () => false,
		},
		'objects/removeObject': {
			combinable: () => false,
		},
		...SpriteHistoryOptions.mutations,
	},
} as IHistoryOptions;
