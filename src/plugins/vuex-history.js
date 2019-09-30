module.exports = {
	/**
	 *
	 * @param {Vue} Vue
	 * @param {{}} options
	 */
	install(Vue, options = {}) {
		if (!Vue._installedPlugins.find(plugin => plugin.Store)) {
			throw new Error(
				'VuexUndoRedo plugin must be installed after the Vuex plugin.'
			);
		}
		if (!options.resetStateMutation) options.resetStateMutation = 'emptyState';
		if (!options.mutations) options.mutations = {};
		Vue.mixin({
			data() {
				return {
					done: [],
					undone: [],
					newMutation: true,
					ignoreMutations: options.ignoreMutations || [],
					currentTransaction: null,
					transactionQueue: [],
				};
			},
			created() {
				if (this.$store) {
					this.$store.subscribe(mutation => {
						const exec = () => {
							if (
								mutation.type === options.resetStateMutation ||
								getMutationProperties(mutation.type).ignore(mutation)
							) {
								return;
							}
							this.currentTransaction.push(mutation);
							if (this.newMutation) {
								this.undone = [];
							}
						};
						if (this.currentTransaction) {
							exec();
						} else {
							// If a mutation triggers outside of any transaction, it gets it's own transaction
							this.transaction(() => {
								exec();
							});
						}
					});
				}
			},
			computed: {
				canRedo() {
					return this.undone.length;
				},
				canUndo() {
					return this.done.length;
				},
			},
			methods: {
				redo() {
					if (this.undone.length <= 0) return;
					let commit = this.undone.pop();
					this.newMutation = false;
					replayTransaction(this, commit);
					this.newMutation = true;
				},
				async undo() {
					if (this.done.length <= 0) return;
					this.undone.push(this.done.pop());
					this.newMutation = false;
					await replayAll(this);
					this.newMutation = true;
				},
				/**
				 * @param {transactionCallback} callback
				 */
				transaction(callback) {
					return new Promise((resolve, reject) => {
						const exec = async () => {
							this.currentTransaction = [];
							try {
								await callback();
							} catch (e) {
								console.log('Error during transaction!: ', e);
								reject(e);
								this.currentTransaction = [];
								// The transaction that just failed is not in the undo history yet.
								// So replaying that is equivalent to undoing the transaction.
								replayAll(this);
							}
							const lastUndo = this.done[this.done.length - 1];
							if (
								this.currentTransaction.length === 1 &&
								lastUndo &&
								lastUndo.length === 1
							) {
								const options = getMutationProperties(
									this.currentTransaction[0].type
								);
								if (
									options.combinable(lastUndo[0], this.currentTransaction[0])
								) {
									const combination = options.combinator(
										lastUndo[0],
										this.currentTransaction[0]
									);
									this.done.pop();
									if (combination) {
										this.currentTransaction = [combination];
									} else {
										// Returning a non-truthy value in the combinator simply eliminates both transactions.
										// So if the user manually undoes an action, you can just pretend it never happened.
										this.currentTransaction = [];
									}
								}
							}
							if (this.currentTransaction.length > 0) {
								this.done.push(this.currentTransaction);
							}

							this.currentTransaction = null;
							if (this.transactionQueue.length > 0) {
								this.transactionQueue.pop()();
							}

							resolve();
						};
						if (this.currentTransaction) {
							this.transactionQueue.push(exec);
						} else {
							exec();
						}
					});
				},
			},
		});

		/**
		 * @param {Vue} vm
		 * @param {*} mutation
		 */
		async function replayAll(vm) {
			const oldTransactions = vm.done.slice(0);
			vm.done = [];
			vm.$store.commit(options.resetStateMutation);
			for (let i = 0; i < oldTransactions.length; ++i) {
				await replayTransaction(vm, oldTransactions[i]);
			}
		}

		async function replayTransaction(vm, transaction) {
			return await vm.transaction(() => {
				transaction.forEach(mutation => {
					replayMutation(vm, mutation);
				});
			});
		}

		/**
		 * @param {Vue} vm
		 * @param {*} mutation
		 */
		function replayMutation(vm, mutation) {
			switch (typeof mutation.payload) {
				case 'object':
					let baseObj = {};
					if (mutation.payload instanceof Array) {
						baseObj = [];
					}
					vm.$store.commit(
						`${mutation.type}`,
						Object.assign(baseObj, mutation.payload)
					);
					break;
				default:
					vm.$store.commit(`${mutation.type}`, mutation.payload);
			}
		}

		const mutationProperiesCache = {};

		/**
		 *
		 * @param {IHistoryOptions} options
		 * @param {*} name
		 */
		function getMutationProperties(name) {
			if (!mutationProperiesCache[name]) {
				const parts = name.split('/');
				const mutationProperties = {
					ignore: mutation => false,
					combinable: (oldMutation, newMutation) => false,
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
	},
};

/**
 * @callback transactionCallback
 * @async
 */
