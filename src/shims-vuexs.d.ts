import { DeepReadonly } from 'vue';
import { Store } from 'vuex';
import { IRootState } from './store';

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$store: Store<DeepReadonly<IRootState>>;
	}
}
