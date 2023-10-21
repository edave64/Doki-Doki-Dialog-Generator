/**
 * Supposedly makes the $store property visible to typescript (but doesn't seem to work for me --edave64)
 */

import { DeepReadonly } from 'vue';
import { Store } from 'vuex';
import { IRootState } from './store';

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$store: Store<DeepReadonly<IRootState>>;
	}
}
