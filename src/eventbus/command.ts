export enum CommandDirection {
	Apply = 0,
	Undo = 1,
	Redo = 2,
}

export interface ICommand {
	readonly id: string;
}
