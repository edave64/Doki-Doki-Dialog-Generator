export function disposeCanvas(canvas: HTMLCanvasElement) {
	canvas.width = 0;
	canvas.height = 0;
}

export function makeCanvas(): HTMLCanvasElement {
	const ret = document.createElement('canvas');
	markForDisposal(ret);
	return ret;
}

const disposables: WeakRef<HTMLCanvasElement>[] = [];

export function markForDisposal(canvas: HTMLCanvasElement) {
	if (typeof WeakRef === 'undefined') return;
	disposables.push(new WeakRef(canvas));
}

window.addEventListener('beforeunload', () => {
	disposables.forEach((x) => {
		const disposable = x.deref();
		if (!disposable) return;
		disposeCanvas(disposable);
	});
});
