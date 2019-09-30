import Vue from 'vue';
import Vuex from 'vuex';
import App from './App.vue';
import store from '@/store';
// import './registerServiceWorker';

Vue.config.productionTip = false;
Vue.use(Vuex);

new Vue({
	store: store as any,
	render: h => h(App),
}).$mount('#app');
