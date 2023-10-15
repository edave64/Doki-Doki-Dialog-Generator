import SpriteHistoryOptions from './object-types/sprite-history-properties';

export default {
	mutations: {
		'panels/*': {
			combinable: (oldMut: any, newMut: any) =>
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
};
