import { PluginObject } from 'vue';

export declare interface IHistorySupport {
	undo(): Promise<void>;
	redo(): Promise<void>;
	transaction(
		callback: () => Promise<void> | void,
		notUndoable = false
	): Promise<void>;
}

export declare interface IHistoryOptions {
	mutations?: {
		[id: string]: Partial<IMutationOptions>;
	};
	resetStateMutation?: string;
}

export declare interface IMutationOptions {
	ignore(oldMutation: IMutation, newMutation: IMutation): boolean;
	combinable(oldMutation: IMutation, newMutation: IMutation): boolean;
	combinator(oldMutation: IMutation, newMutation: IMutation): IMutation;
}

export declare interface IMutation {
	type: string;
	payload: any;
}

declare const _default: PluginObject<IHistoryOptions>;
export default _default;
