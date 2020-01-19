import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex, { Store } from 'vuex';
import { ComponentOptions } from 'vue';
import plugin, {
	IHistoryOptions,
	IMutation,
	IHistorySupport,
} from '../../src/plugins/vuex-history';

describe('plugin', () => {
	it('should throw error if installed before new Vuex.Store is called', () => {
		const localVue = createLocalVue();
		expect(() => {
			localVue.use(plugin);
		}).toThrow();
	});
	it('should not throw error if installed after new Vuex.Store is called', () => {
		const localVue = createLocalVue();
		expect(() => {
			localVue.use(Vuex);
			new Vuex.Store({});
			localVue.use(plugin);
		}).not.toThrow();
	});
	it('should undo/redo data property', done => {
		commonVuex(async function() {
			expect(this.$store.state.myVal).toBe(0);
			this.inc();
			// Wait on the transaction free mutation.
			await this.transaction(() => {});
			expect(this.$store.state.myVal).toBe(1);
			expect(this.done.length === 1);
			await this.undo();
			expect(this.$store.state.myVal).toBe(0);
			await this.redo();
			expect(this.$store.state.myVal).toBe(1);
			done();
		});
	});
	it('should undo/redo entire transactions', done => {
		commonVuex(async function() {
			expect(this.$store.state.myVal).toBe(0);
			await this.transaction(() => {
				this.inc();
				this.inc();
			});
			expect(this.$store.state.myVal).toBe(2);
			expect(this.done.length === 1);
			await this.undo();
			expect(this.$store.state.myVal).toBe(0);
			await this.redo();
			expect(this.$store.state.myVal).toBe(2);
			done();
		});
	});
	it('should ignore mutations by name', done => {
		commonVuex(
			async function() {
				expect(this.$store.state.myVal).toBe(0);
				await this.transaction(() => {
					this.inc();
					this.namespacedInc();
				});
				expect(this.$store.state.myVal).toBe(2);
				expect(this.done.length).toBe(0);
				await this.undo();
				expect(this.$store.state.myVal).toBe(2);
				await this.redo();
				expect(this.$store.state.myVal).toBe(2);
				done();
			},
			{
				mutations: {
					inc: {
						ignore: () => true,
					},
					'module/*': {
						ignore: () => true,
					},
				},
			}
		);
	});
	it('should respect mutation option specificity', done => {
		commonVuex(
			async function() {
				expect(this.$store.state.myVal).toBe(0);
				await this.transaction(() => {
					this.inc();
					this.namespacedInc();
				});
				expect(this.$store.state.myVal).toBe(2);
				expect(this.done.length).toBe(1);
				expect(this.done[0].length).toBe(1);
				await this.undo();
				expect(this.$store.state.myVal).toBe(0);
				await this.redo();
				expect(this.$store.state.myVal).toBe(1);
				done();
			},
			{
				mutations: {
					'*': {
						ignore: () => true,
					},
					'module/inc': {
						ignore: () => false,
					},
				},
			}
		);
	});
	it('should combine compatible transactions', done => {
		commonVuex(
			async function() {
				expect(this.$store.state.myVal).toBe(0);
				await this.transaction(() => {
					this.setValue(4);
				});
				await this.transaction(() => {
					this.setValue(8);
				});
				expect(this.$store.state.myVal).toBe(8);
				expect(this.done.length).toBe(1);
				expect(this.done[0].length).toBe(1);
				await this.undo();
				expect(this.$store.state.myVal).toBe(0);
				await this.redo();
				expect(this.$store.state.myVal).toBe(8);
				done();
			},
			{
				mutations: {
					'module/setValue': {
						combinable: (oldMut: IMutation, newMut: IMutation) => {
							return newMut.type === oldMut.type;
						},
					},
				},
			}
		);
	});
});

function commonVuex(
	createdCallback: (this: Vue & ICommonInterface) => void,
	pluginOptions: IHistoryOptions = {}
): void {
	const localVue = createLocalVue();
	localVue.use(Vuex);
	const store = new Vuex.Store({
		state: {
			myVal: 0,
		},
		mutations: {
			inc(state) {
				state.myVal++;
			},
			'module/inc'(state) {
				state.myVal++;
			},
			'module/setValue'(state, value: number) {
				state.myVal = value;
			},
			emptyState() {
				this.replaceState({ myVal: 0 });
			},
		},
	});
	localVue.use(plugin, pluginOptions);
	shallowMount(
		{
			template: '<div></div>',
			methods: {
				inc() {
					this.$store.commit('inc');
				},
				namespacedInc() {
					this.$store.commit('module/inc');
				},
				setValue(value: number) {
					this.$store.commit('module/setValue', value);
				},
			},
			created: createdCallback,
		},
		{
			localVue,
			store,
		}
	);
}

interface ICommonInterface extends IHistorySupport {
	done: any[];
	undone: any[];
	$store: Store<any>;
	inc(): void;
	namespacedInc(): void;
	setValue(value: number): void;
}
