import { Module } from 'vuex';
import { ICommand, CommandDirection, reverseCommand } from '@/eventbus/command';
import eventBus from '@/eventbus/event-bus';

export interface IHistoryState {
	undos: ICommand[];
	redos: ICommand[];
	nextUndoDesc: string | null;
	nextRedoDesc: string | null;
}

export default {
	namespaced: true,
	state: {
		nextRedoDesc: null,
		nextUndoDesc: null,
		redos: [],
		undos: [],
	},
	mutations: {
		record(state, command: ICommand) {
			if (!command.undoable) return;

			if (command.direction === CommandDirection.Apply) {
				state.redos = [];
				state.nextRedoDesc = null;
			}
			if (command.direction === CommandDirection.Undo) {
				state.redos.push(Object.freeze(command));
				state.nextRedoDesc = command.desc;
			} else {
				const lastCommand = state.undos[state.undos.length - 1];
				if (
					lastCommand &&
					lastCommand.compactable &&
					lastCommand.type === command.type &&
					lastCommand.target === command.target
				) {
					state.undos.pop();
					state.undos.push(
						Object.freeze({
							...command,
							reverseData: lastCommand.reverseData,
						})
					);
					state.nextUndoDesc = command.desc;
				} else {
					state.undos.push(Object.freeze(command));
					state.nextUndoDesc = command.desc;
				}
			}
		},
		undo(state) {
			const undoAction = state.undos.pop();
			if (!undoAction) throw new Error('There are no actions to undo!');
			eventBus.fireCommand(reverseCommand(undoAction, CommandDirection.Undo));
		},
		redo(state) {
			const redoAction = state.redos.pop();
			if (!redoAction) throw new Error('There are no actions to undo!');
			eventBus.fireCommand(reverseCommand(redoAction, CommandDirection.Redo));
		},
	},
} as Module<IHistoryState, never>;
