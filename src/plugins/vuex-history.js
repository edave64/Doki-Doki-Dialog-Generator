import { reactive } from 'vue';

export default {
	/**
	 *
	 * @param {Vue} vueApp
	 * @param {{resetStateMutation: string, mutations: {}}} options
	 */
	install(vueApp, options = {}) {
		if (!vueApp.config.globalProperties.$store) {
			throw new Error(
				'VuexUndoRedo plugin must be installed after the Vuex plugin.'
			);
		}
		if (!options.resetStateMutation) options.resetStateMutation = 'emptyState';
		if (!options.mutations) options.mutations = {};

		const $store = vueApp.config.globalProperties.$store;

		/**
		 * @param {Vue} vm
		 * @param {*} mutation
		 */
		function replayMutation(vm, mutation) {
			let baseObj = {};
			switch (typeof mutation.payload) {
				case 'object':
					if (mutation.payload instanceof Array) {
						baseObj = [];
					}
					$store.commit(
						`${mutation.type}`,
						Object.assign(baseObj, mutation.payload)
					);
					break;
				default:
					$store.commit(`${mutation.type}`, mutation.payload);
			}
		}

		async function replayTransaction(vm, transaction) {
			return await vm.transaction(() => {
				transaction.forEach((mutation) => {
					replayMutation(vm, mutation);
				});
			});
		}

		/**
		 * @param {Vue} vm
		 */
		async function replayAll(vm) {
			const oldTransactions = vm.data.done.slice(0);
			vm.data.done = [];
			$store.commit(options.resetStateMutation);
			for (let i = 0; i < oldTransactions.length; ++i) {
				await replayTransaction(vm, oldTransactions[i]);
			}
		}

		const mutationProperiesCache = {};

		/**
		 * @param {string} name
		 */
		function getMutationProperties(name) {
			if (!mutationProperiesCache[name]) {
				const parts = name.split('/');
				const mutationProperties = {
					ignore: (_mutation) => false,
					combinable: (_oldMutation, _newMutation) => false,
					combinator: (oldMutation, newMutation) => newMutation,
				};
				let currentWildcard = '';
				for (const part of parts) {
					if (options.mutations[currentWildcard + '*']) {
						Object.assign(
							mutationProperties,
							options.mutations[currentWildcard + '*']
						);
					}
					currentWildcard += part + '/';
				}
				if (options.mutations[name]) {
					Object.assign(mutationProperties, options.mutations[name]);
				}
				mutationProperiesCache[name] = mutationProperties;
			}
			return mutationProperiesCache[name];
		}

		const history = {
			data: reactive({
				done: [],
				undone: [],
				snapshots: [],
				transactionsSinceSnapshot: 0,
				newMutation: true,
				ignoreMutations: options.ignoreMutations || [],
				currentTransaction: null,
				transactionQueue: [],
				initialized: false,
			}),
			initialize() {
				if (history.initialized) return;
				history.initialized = true;
				$store.subscribe((mutation) => {
					const exec = () => {
						if (
							mutation.type === options.resetStateMutation ||
							getMutationProperties(mutation.type).ignore(mutation)
						) {
							return;
						}
						history.currentTransaction.push(mutation);
						if (history.newMutation) {
							history.data.undone = [];
						}
					};
					if (history.currentTransaction) {
						exec();
					} else {
						// If a mutation triggers outside of any transaction, it gets it's own transaction
						history.transaction(() => {
							exec();
						});
					}
				});
			},
			async redo() {
				if (history.data.undone.length <= 0) return;
				const commit = history.data.undone.pop();
				history.newMutation = false;
				await replayTransaction(history, commit);
				history.newMutation = true;
			},
			async undo() {
				if (history.data.done.length <= 0) return;
				history.data.undone.push(history.data.done.pop());
				history.newMutation = false;
				await replayAll(history);
				history.newMutation = true;
			},
			/**
			 * @returns {Promise<void>}
			 * @async
			 */
			clearHistory() {
				return new Promise((resolve, _reject) => {
					const exec = async () => {
						history.currentTransaction = [];
						history.transactionsSinceSnapshot = 0;
						history.data.undone = [];
						history.data.done = [];
						resolve();

						history.currentTransaction = null;
						if (history.data.transactionQueue.length > 0) {
							history.data.transactionQueue.shift()();
						}
					};
					if (history.currentTransaction) {
						history.data.transactionQueue.push(exec);
					} else {
						exec();
					}
				});
			},
			/**
			 * @param {transactionCallback} callback
			 * @returns {Promise<void>}
			 * @async
			 */
			transaction(callback) {
				return new Promise((resolve, _reject) => {
					const exec = async () => {
						history.currentTransaction = [];
						history.transactionsSinceSnapshot++;
						try {
							await callback();
						} catch (e) {
							console.log('Error during transaction!: ', e);
							// reject(e);
							//this.currentTransaction = [];
							// The transaction that just failed is not in the undo history yet.
							// So replaying that is equivalent to undoing the transaction.
							//replayAll(this);
						}
						const lastUndo = history.data.done[history.data.done.length - 1];
						if (
							history.currentTransaction.length === 1 &&
							lastUndo &&
							lastUndo.length === 1
						) {
							const options = getMutationProperties(
								history.currentTransaction[0].type
							);
							if (
								options.combinable(lastUndo[0], history.currentTransaction[0])
							) {
								const combination = options.combinator(
									lastUndo[0],
									history.currentTransaction[0]
								);
								history.data.done.pop();
								if (combination) {
									history.currentTransaction = [combination];
								} else {
									// Returning a non-truthy value in the combinator simply eliminates both transactions.
									// So if the user manually undoes an action, you can just pretend it never happened.
									history.currentTransaction = [];
								}
							}
						}
						if (history.currentTransaction.length > 0) {
							history.data.done.push(history.currentTransaction);
						}

						history.currentTransaction = null;
						if (history.data.transactionQueue.length > 0) {
							history.data.transactionQueue.shift()();
						}

						resolve();
					};
					if (history.currentTransaction) {
						history.data.transactionQueue.push(exec);
					} else {
						exec();
					}
				});
			},
		};

		window.storeHistory = history;

		vueApp.config.globalProperties.vuexHistory = history;
		history.initialize();
	},
};

/**
 * @callback transactionCallback
 * @async
 */
