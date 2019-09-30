import Vue from 'vue';
import Vuex from 'vuex';
import history from './history';
import objects from './objects';
import ui from './ui';
import { ICommand } from '@/eventbus/command';

Vue.use(Vuex);

export default new Vuex.Store<never>({
	modules: {
		history,
		objects,
		ui,
	},
	mutations: {},
	actions: {
		runCommand({ commit }, command: ICommand) {
			commit('history/record', command, { root: true });
			if (command.target.startsWith('obj')) {
				commit('objects/processCommand', command, { root: true });
			}
		},
	},
});
