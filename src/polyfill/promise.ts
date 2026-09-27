Promise.withResolvers ??= function <T>(): PromiseWithResolvers<T> {
	let resolve: PromiseWithResolvers<T>['resolve'] = null!;
	let reject: PromiseWithResolvers<T>['reject'] = null!;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return {
		promise,
		resolve,
		reject,
	};
};
