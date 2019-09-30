import { ObjectTypes, IObjectsState } from '../objects';
import {
	ICommand,
	reverseGenerators,
	CommandDirection,
} from '@/eventbus/command';

export interface IObject {
	type: ObjectTypes;
	id: string;
	x: number;
	y: number;
	opacity: number;
	version: number;
	flip: boolean;
	onTop: boolean;
}

export const objectCommandHandlers = {
	move(obj: IObject, command: IMoveObjectCommand, state: IObjectsState) {
		obj.x = command.newX;
		obj.y = command.newY;
		++obj.version;
	},
	setOpacity(obj: IObject, command: ISetObjectOpacityCommand) {
		obj.opacity = command.newOpacity;
		++obj.version;
	},
	flip(obj: IObject, command: IFlipObjectCommand) {
		obj.flip = !obj.flip;
		++obj.version;
	},
	setLayer(obj: IObject, command: ISetObjectLayer, state: IObjectsState) {
		const oldColl = command.reverseData.originalOnTop
			? state.onTopOrder
			: state.order;
		oldColl.splice(command.reverseData.originalPosition, 1);
		const newColl = command.onTop ? state.onTopOrder : state.order;
		newColl.splice(command.position, 0, obj.id);
		obj.onTop = command.onTop;
		++obj.version;
	},
	delete(
		obj: IObject,
		command: IDeleteObjectCommand | IUncreateObjectCommand,
		state: IObjectsState
	) {
		delete state.objects[obj.id];
		const collection = obj.onTop ? state.onTopOrder : state.order;
		const idx = collection.indexOf(obj.id);
		collection.splice(idx, 1);
	},
	uncreate(
		obj: IObject,
		command: IUncreateObjectCommand,
		state: IObjectsState
	) {
		this.delete(obj, command, state);
	},
};

export interface ISetObjectOpacityCommand extends ICommand {
	readonly type: 'setOpacity';
	readonly newOpacity: number;
	readonly reverseData: {
		oldOpacity: number;
	};
}

export function setOpacityCommand(
	store: any,
	objId: string,
	opacity: number,
	compactable: boolean = true,
	undoable: boolean = true
): ISetObjectOpacityCommand {
	const objs = store.state.objects.objects as { [id: string]: IObject };
	const obj = objs[objId];
	return {
		type: 'setOpacity',
		desc: `Set the opacity of ${obj.type}`,
		direction: CommandDirection.Apply,
		compactable,
		newOpacity: opacity,
		target: objId,
		undoable,
		reverseData: {
			oldOpacity: obj.opacity,
		},
	};
}

reverseGenerators.setOpacity = (((input: ISetObjectOpacityCommand) =>
	Object.freeze({
		...input,
		newOpacity: input.reverseData.oldOpacity,
		reverseData: {
			oldOpacity: input.newOpacity,
		},
	})) as ((
	input: ISetObjectOpacityCommand
) => ISetObjectOpacityCommand)) as any;

export interface IMoveObjectCommand extends ICommand {
	readonly type: 'move';
	readonly newX: number;
	readonly newY: number;
	readonly reverseData: {
		oldX: number;
		oldY: number;
	};
}

export function createMoveCommand(
	store: any,
	objId: string,
	x: number,
	y: number,
	compactable: boolean = true,
	undoable: boolean = true
): IMoveObjectCommand {
	const objs = store.state.objects.objects as { [id: string]: IObject };
	const obj = objs[objId];
	return {
		type: 'move',
		desc: `Move the ${obj.type}`,
		direction: CommandDirection.Apply,
		compactable,
		newX: x,
		newY: y,
		target: objId,
		undoable,
		reverseData: {
			oldX: obj.x,
			oldY: obj.y,
		},
	};
}

reverseGenerators.move = (((input: IMoveObjectCommand) =>
	Object.freeze({
		...input,
		newX: input.reverseData.oldX,
		newY: input.reverseData.oldY,
		reverseData: {
			oldX: input.newX,
			oldY: input.newY,
		},
	})) as ((input: IMoveObjectCommand) => IMoveObjectCommand)) as any;

export interface IFlipObjectCommand extends ICommand {
	readonly type: 'flip';
}

export function createFlipCommand(
	store: any,
	objId: string,
	compactable: boolean = true,
	undoable: boolean = true
): IFlipObjectCommand {
	const objs = store.state.objects.objects as { [id: string]: IObject };
	const obj = objs[objId];
	return {
		type: 'flip',
		desc: `Flip the ${obj.type}`,
		direction: CommandDirection.Apply,
		compactable,
		target: objId,
		undoable,
		reverseData: null,
	};
}

reverseGenerators.flip = ((input: IFlipObjectCommand) => input) as any;

export interface ICreateObjectCommand extends ICommand {
	readonly type: 'create';
	readonly objId: string;
	readonly objType: ObjectTypes;
	readonly onTop: boolean;
	readonly typeData: Readonly<any>;
}

export interface IUncreateObjectCommand extends ICommand {
	readonly type: 'uncreate';
	readonly reverseData: {
		readonly objId: string;
		readonly objType: ObjectTypes;
		readonly onTop: boolean;
		readonly typeData: Readonly<any>;
	};
}

reverseGenerators.create = (((input: ICreateObjectCommand) => ({
	compactable: input.compactable,
	desc: input.desc,
	direction: input.direction,
	target: input.objId,
	type: 'uncreate',
	undoable: input.undoable,
	reverseData: {
		typeData: input.typeData,
		objType: input.objType,
		onTop: input.onTop,
	},
})) as ((input: ICreateObjectCommand) => IUncreateObjectCommand)) as any;

reverseGenerators.uncreate = (((input: IUncreateObjectCommand) => ({
	compactable: input.compactable,
	desc: input.desc,
	direction: input.direction,
	target: 'obj',
	objId: input.target,
	type: 'create',
	undoable: input.undoable,
	typeData: input.reverseData.typeData,
	objType: input.reverseData.objType,
	onTop: input.reverseData.onTop,
	reverseData: {},
})) as ((input: IUncreateObjectCommand) => ICreateObjectCommand)) as any;

export function createDeleteCommand(
	store: any,
	objId: string,
	undoable: boolean = true
): IDeleteObjectCommand {
	const objs = store.state.objects as IObjectsState;
	const obj = objs.objects[objId] as IObject;
	const collection = obj.onTop ? objs.onTopOrder : objs.order;
	return {
		compactable: false,
		desc: `Delete ${obj.type}`,
		direction: CommandDirection.Apply,
		target: objId,
		type: 'delete',
		undoable,
		reverseData: {
			object: obj,
			position: collection.indexOf(objId),
		},
	};
}

export interface IDeleteObjectCommand extends ICommand {
	readonly type: 'delete';
	readonly reverseData: {
		object: IObject;
		position: number;
	};
}

export interface IRestoreObjectCommand extends ICommand {
	readonly type: 'restore';
	readonly object: IObject;
	readonly position: number;
	readonly reverseData: null;
}

reverseGenerators.delete = (((input: IDeleteObjectCommand) => ({
	compactable: input.compactable,
	desc: input.desc,
	direction: input.direction,
	target: 'obj',
	type: 'restore',
	undoable: input.undoable,
	object: input.reverseData.object,
	position: input.reverseData.position,
})) as ((input: IDeleteObjectCommand) => IRestoreObjectCommand)) as any;

reverseGenerators.restore = (((input: IRestoreObjectCommand) => ({
	compactable: input.compactable,
	desc: input.desc,
	direction: input.direction,
	target: input.object.id,
	type: 'delete',
	undoable: input.undoable,
	reverseData: {
		object: input.object,
		position: input.position,
	},
})) as ((input: IRestoreObjectCommand) => IDeleteObjectCommand)) as any;
