/**
 * A helper for managing canvases in the memory restricted environment of mobile safari.
 */

/**
 * Safari has as strict limit on canvases that can be open at once. To mitigate
 * this, we set canvases that are no longer needed to have no size
 * @param canvas
 */
export function disposeCanvas(canvas: HTMLCanvasElement) {
	canvas.width = 0;
	canvas.height = 0;
	//canvas.getContext('2d')?.clearRect(0, 0, 1, 1);
	disposables.delete((canvas as DisposableCanvasElement).disposalId || 0);
}

export function makeCanvas(): HTMLCanvasElement {
	const ret = document.createElement('canvas');
	markForDisposal(ret);
	return ret;
}

const disposables: Map<number, WeakRef<HTMLCanvasElement>> = new Map();
let nextDisposalId = 0;

export function markForDisposal(canvas: HTMLCanvasElement) {
	(canvas as DisposableCanvasElement).disposalId = nextDisposalId++;
	if (typeof WeakRef === 'undefined') return;
	disposables.set(
		(canvas as DisposableCanvasElement).disposalId,
		new WeakRef(canvas)
	);
}

// An oddity of mobile safari is that the canvases do not seem to cleaned up even when the tab is releaded
// So we try to force safari to unload all current canvases.
window.addEventListener('unload', () => {
	disposables.forEach((x) => {
		const disposable = x.deref();
		if (!disposable) return;
		disposeCanvas(disposable);
	});
});

interface DisposableCanvasElement extends HTMLCanvasElement {
	disposalId: number;
}
