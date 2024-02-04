/**
 * A helper for error reporting, even in async actions.
 */

import eventBus, { FailureEvent } from '@/eventbus/event-bus';

export async function safeAsync(name: string, callback: () => Promise<void>) {
	try {
		await callback();
	} catch (e) {
		console.error('Error in promise', name, e);
		eventBus.fire(
			new FailureEvent(
				"Unexpected error! Please copy the following message and send it to /u/edave64: Error in '" +
					name +
					'", ' +
					normalizeError(e)
			)
		);
	}
}

function normalizeError(e: any): string {
	if (e instanceof Error) {
		if (e.stack != null) {
			const stackLines = e.stack.split('\n');
			if (stackLines[0].includes(e.name) && stackLines[0].includes(e.message)) {
				return stackLines[0] + '\n<br />' + stackLines[1];
			} else {
				return e.name + ': ' + e.message + '\n<br />' + stackLines[0];
			}
		}
		return e.name + ': ' + e.message;
	}
	if (e instanceof Object) {
		return JSON.stringify(e);
	}
	return '' + e;
}
