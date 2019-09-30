import { IHistoryOptions } from '@/plugins/vuex-history';

export default {
	mutations: {
		'objects/*': {
			combinable: () => true,
		},
	},
} as IHistoryOptions;
