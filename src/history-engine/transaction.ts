/**
 * DDDG's transaction system. It coordinates multiple user actions to happen in order, ensures that, even with async
 * code, no two user actions are processed at the same time.
 *
 * It's also used to combine multiple history records into one history group, so multiple changes can be bundled into
 * one.
 */
export const transaction: TransactionLayer = transactionLayer();

type TransactionCallback =
	| (() => Promise<void>)
	| (() => void)
	| ((subtransaction: TransactionLayer) => Promise<void>);

export type TransactionLayer = TransactionLayerMethods &
	((callback: TransactionCallback) => Promise<void>);

interface TransactionLayerMethods {
	/**
	 * Called when one transaction has been completed.
	 */
	onClear(callback: () => void): void;
}

export function transactionLayer(): TransactionLayer {
	const transactionQueue: (() => Promise<void>)[] = [];
	let transactionRunning = false;
	const clearCallbacks: (() => void)[] = [];

	const ret = function transaction(callback: TransactionCallback) {
		return new Promise((resolve) => {
			const exec = async () => {
				try {
					// Don't create a new transaction layer if it won't be used.
					if (callback.length > 0) {
						await callback(transactionLayer());
					} else {
						await (callback as () => Promise<void>)();
					}
					clearCallbacks.forEach((callback) => callback());
				} catch (e) {
					console.log('Error during transaction!: ', e);
				} finally {
					transactionRunning = false;
				}

				// Fire next transaction
				if (transactionQueue.length > 0) {
					transactionQueue.shift()!();
				}

				resolve();
			};
			if (transactionRunning) {
				transactionQueue.push(exec);
			} else {
				exec();
			}
		});
	} as TransactionLayer;

	ret.onClear = function (callback: () => void) {
		clearCallbacks.push(callback);
	};
	return ret;
}
