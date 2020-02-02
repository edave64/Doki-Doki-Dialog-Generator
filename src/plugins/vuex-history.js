export default {
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
		let registed = false;
		Vue.mixin({
			data() {
				return {
					vxhDone: [],
					vxhUndone: [],
					vxhNewMutation: true,
					vxhIgnoreMutations: options.ignoreMutations || [],
					vxhCurrentTransaction: null,
					vxhTransactionQueue: [],
				};
			},
			created() {
				window.historyStuff = this;
				if (this.$store) {
					if (registed) return;
					registed = true;
					this.$store.subscribe(mutation => {
						const exec = () => {
							if (
								mutation.type === options.resetStateMutation ||
								getMutationProperties(mutation.type).ignore(mutation)
							) {
								return;
							}
							this.vxhCurrentTransaction.push(mutation);
							if (this.vxhNewMutation) {
								this.vxhUndone = [];
							}
						};
						if (this.vxhCurrentTransaction) {
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
					return this.vxhUndone.length;
				},
				canUndo() {
					return this.vxhDone.length;
				},
			},
			methods: {
				redo() {
					if (this.vxhUndone.length <= 0) return;
					let commit = this.vxhUndone.pop();
					this.vxhNewMutation = false;
					replayTransaction(this, commit);
					this.vxhNewMutation = true;
				},
				async undo() {
					if (this.vxhDone.length <= 0) return;
					this.vxhUndone.push(this.vxhDone.pop());
					this.vxhNewMutation = false;
					await replayAll(this);
					this.vxhNewMutation = true;
				},
				/**
				 * @param {transactionCallback} callback
				 */
				transaction(callback) {
					return new Promise((resolve, reject) => {
						const exec = async () => {
							this.vxhCurrentTransaction = [];
							try {
								await callback();
							} catch (e) {
								console.log('Error during transaction!: ', e);
								reject(e);
								this.vxhCurrentTransaction = [];
								// The transaction that just failed is not in the undo history yet.
								// So replaying that is equivalent to undoing the transaction.
								replayAll(this);
							}
							const lastUndo = this.vxhDone[this.vxhDone.length - 1];
							if (
								this.vxhCurrentTransaction.length === 1 &&
								lastUndo &&
								lastUndo.length === 1
							) {
								const options = getMutationProperties(
									this.vxhCurrentTransaction[0].type
								);
								if (
									options.combinable(lastUndo[0], this.vxhCurrentTransaction[0])
								) {
									const combination = options.combinator(
										lastUndo[0],
										this.vxhCurrentTransaction[0]
									);
									this.vxhDone.pop();
									if (combination) {
										this.vxhCurrentTransaction = [combination];
									} else {
										// Returning a non-truthy value in the combinator simply eliminates both transactions.
										// So if the user manually undoes an action, you can just pretend it never happened.
										this.vxhCurrentTransaction = [];
									}
								}
							}
							if (this.vxhCurrentTransaction.length > 0) {
								this.vxhDone.push(this.vxhCurrentTransaction);
							}

							this.vxhCurrentTransaction = null;
							if (this.vxhTransactionQueue.length > 0) {
								this.vxhTransactionQueue.pop()();
							}

							resolve();
						};
						if (this.vxhCurrentTransaction) {
							this.vxhTransactionQueue.push(exec);
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
			const oldTransactions = vm.vxhDone.slice(0);
			vm.vxhDone = [];
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
