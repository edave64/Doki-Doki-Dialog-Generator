import Vue from 'vue';
import Vuex from 'vuex';
import objects from './objects';
import ui from './ui';

Vue.use(Vuex);

export default new Vuex.Store<never>({
	modules: {
		objects,
		ui,
	},
	mutations: {},
	actions: {},
});
