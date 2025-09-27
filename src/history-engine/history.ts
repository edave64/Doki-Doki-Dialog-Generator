/**
 * Clears the history of the current session. If a callback is given, the history will first be locked, then the
 * callback executes and is awaited, then the history is cleared and unlocked.
 *
 * This allows not to record any history when doing large changes that can't be undone.
 */
export async function clearHistory(callback?: () => Promise<void> | void) {}

// TODO: Maybe this doesn't need to be async
export function undoAble(
	callback: () => void,
	undo: () => Promise<void> | void
): void;
export async function undoAble(
	callback: () => Promise<void> | void,
	undo: () => Promise<void> | void
): Promise<void>;
export function undoAble(
	callback: () => Promise<void> | void,
	undo: () => Promise<void> | void
): Promise<void> | void {
	return callback();
}
