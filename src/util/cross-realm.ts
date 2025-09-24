// Because of viewports, we might have to work with DOM elements from different JS realms.
// This file contains some helper functions to make it easier.
// Other types do not need these, since all program logic happens in the main realm.

export function isInput(e: EventTarget | null): e is HTMLInputElement {
	if (e === null) return false;
	if (e instanceof HTMLInputElement) return true;
	if ('ownerDocument' in e) {
		const doc = e.ownerDocument as Document;
		return e instanceof doc.defaultView!.HTMLInputElement;
	}
	return false;
}

export function isTextArea(e: EventTarget | null): e is HTMLTextAreaElement {
	if (e === null) return false;
	if (e instanceof HTMLTextAreaElement) return true;
	if ('ownerDocument' in e) {
		const doc = e.ownerDocument as Document;
		if (!doc) return false;
		return e instanceof doc.defaultView!.HTMLTextAreaElement;
	}
	return false;
}

export function isHTMLElement(e: EventTarget): e is HTMLElement {
	if (e instanceof HTMLElement) return true;
	if ('ownerDocument' in e) {
		const doc = e.ownerDocument as Document;
		if (!doc) return false;
		return e instanceof doc.defaultView!.HTMLElement;
	}
	return false;
}

export function isMouseEvent(e: Event): e is MouseEvent {
	if (e instanceof MouseEvent) return true;
	const doc = (e.target as Node).ownerDocument;
	if (!doc) return false;
	return e instanceof doc.defaultView!.MouseEvent;
}

export function isTouchEvent(e: Event): e is TouchEvent {
	if (e instanceof TouchEvent) return true;
	const doc = (e.target as Node).ownerDocument;
	if (!doc) return false;
	return e instanceof doc.defaultView!.TouchEvent;
}
