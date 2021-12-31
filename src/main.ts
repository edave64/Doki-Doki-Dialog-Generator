import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import History, { IHistoryOptions, IMutation } from './plugins/vuex-history';
import { default as objectMutations } from './store/objects_history_properties';
import { propertyOptions as characterMutations } from './store/objectTypes/characters';

const ignore = {
	ignore: () => true,
};

const useLatest = {
	combinable: () => true,
};

const panelUseLatest = {
	combinable: (oldMut: IMutation, newMut: IMutation) =>
		oldMut.type === newMut.type &&
		oldMut.payload.panelId === newMut.payload.panelId,
};

createApp(App)
	.use(store)
	.use(History, {
		mutations: {
			...objectMutations.mutations,
			...characterMutations.mutations,
			'panels/setPanelPreview': ignore,
			'ui/setSelection': useLatest,
			'panels/setCurrentBackground': panelUseLatest,
			'panels/setBackgroundFlipped': panelUseLatest,
			'panels/backgroundSetFilters': {
				combinable(oldMut: IMutation, newMut: IMutation): boolean {
					return (
						oldMut.type === newMut.type &&
						oldMut.payload.id === newMut.payload.id &&
						// Don't join additions or deletions. That's not super intuitive
						oldMut.payload.filters.length === newMut.payload.filters.length
					);
				},
			},
		},
	} as IHistoryOptions)
	.mount('#app');
