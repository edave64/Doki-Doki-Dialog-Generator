import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import History from './plugins/vuex-history';

createApp(App).use(store).use(History).mount('#app');
