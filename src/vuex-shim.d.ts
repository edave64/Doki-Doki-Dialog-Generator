import type { IRootState } from '@/store';
import type { Store } from 'vuex';

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$store: Store<IRootState>;
	}
}
