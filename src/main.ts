import Vue from 'vue';
import Vuex from 'vuex';
import History from './plugins/vuex-history';
import App from './App.vue';
import store from '@/store';
// import './registerServiceWorker';
import ObjectsHistoryProperties from './store/objects_history_properties';
import { VueErrorEvent } from '@/eventbus/event-bus';

Vue.config.productionTip = false;
Vue.config.errorHandler = async (err, vm, info) => {
	// handle error
	// `info` is a Vue-specific error info, e.g. which lifecycle hook
	// the error was found in. Only available in 2.2.0+
	const eventBus = (await import('./eventbus/event-bus')).default;
	eventBus.fire(new VueErrorEvent(err, info));
};

Vue.use(Vuex);
Vue.use(History, {
	mutations: {
		...ObjectsHistoryProperties.mutations,
	},
});

new Vue({
	store: store as any,
	render: h => h(App),
}).$mount('#app');
