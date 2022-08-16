import { Store } from 'vuex';
import { IRootState } from './store';
import { DeepReadonly } from 'vue';

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$store: Store<DeepReadonly<IRootState>>;
	}
}
