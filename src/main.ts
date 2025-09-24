/**
 * The main entry point of the application.
 * Mounts the App-component and connects the store, nothing else.
 * For a more telling entry point, check the mounted hook of the app component.
 */

import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './app.vue';
import store from './store';

const pinia = createPinia();

createApp(App)
	.use(store) /* .use(History) */
	.use(pinia)
	.mount('#main_wrapper');
