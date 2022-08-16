import { IHistorySupport } from './plugins/vuex-history';

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		vuexHistory: IHistorySupport;
	}
}
