import Vue from 'vue';
import Vuex from 'vuex';
import History from './plugins/vuex-history';
import App from './App.vue';
import store from '@/store';
// import './registerServiceWorker';
import ObjectsHistoryProperties from './store/objects_history_properties';

Vue.config.productionTip = false;
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
