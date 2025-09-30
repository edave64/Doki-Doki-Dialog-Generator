/**
 * The main entry point of the application.
 * Mounts the App-component and connects the store, nothing else.
 * For a more telling entry point, check the mounted hook of the app component.
 */

import { createApp } from 'vue';
import App from './app.vue';

createApp(App).mount('#main_wrapper');
