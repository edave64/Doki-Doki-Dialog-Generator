// import { reactive } from 'vue';

export const transaction = transactionLayer();

type TransactionCallback =
	| (() => Promise<void>)
	| (() => void)
	| ((subtransaction: TransactionLayer) => Promise<void>);
export type TransactionLayer = (callback: TransactionCallback) => Promise<void>;

export function transactionLayer(): TransactionLayer {
	const transactionQueue: (() => Promise<void>)[] = [];
	let transactionRunning = false;

	return function transaction(callback: TransactionCallback) {
		return new Promise((resolve, _reject) => {
			const exec = async () => {
				try {
					// Don't create a new transaction layer if it won't be used.
					if (callback.length > 0) {
						await callback(transactionLayer());
					} else {
						await (callback as () => Promise<void>)();
					}
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
	};
}
