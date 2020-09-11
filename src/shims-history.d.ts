import { Store } from 'vuex';
import { State } from './store';

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		vuexHistory: IHistorySupport;
	}
}
