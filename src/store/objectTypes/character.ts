import { IObject, ICreateObjectCommand, IMoveObjectCommand } from './general';
import {
	CommandDirection,
	ICommand,
	reverseGenerators,
} from '@/eventbus/command';
import { characterPositions, Part } from '@/models/constants';
import { IObjectsState } from '../objects';
import { ISprite } from './sprite';

const BaseCharacterYPos = -26;

export interface ICharacter extends IObject {
	type: 'character';
	characterType: string;
	freeMove: boolean;
	close: boolean;
	posePositions: {
		variant: number;
		left: number;
		right: number;
		head: number;
		headType: number;
	};
}

export interface ICreateCharacterCommand extends ICreateObjectCommand {
	characterType: string;
}

export const characterCommandHandlers = {
	move(obj: ICharacter, command: IMoveObjectCommand) {
		if (!obj.freeMove) {
			obj.x = closestCharacterSlot(command.newX);
			obj.y = BaseCharacterYPos;
		}
	},
	setPart(obj: ICharacter, command: ISetPartCommand, state: IObjectsState) {
		obj.posePositions[command.part] = command.partNumber;
	},
};

function closestCharacterSlot(pos: number) {
	const sorted = characterPositions
		.map((x, idx) => ({ pos: Math.abs(pos - x), idx }))
		.sort((a, b) => a.pos - b.pos);
	return sorted[0].idx;
}

let lastCharId = 0;

export function createCharacter(characterId: string): ICreateCharacterCommand {
	return {
		target: 'obj',
		objId: 'obj_char_' + ++lastCharId,
		characterType: characterId,
		compactable: false,
		undoable: false,
		desc: 'created character',
		direction: CommandDirection.Apply,
		objType: 'character',
		onTop: false,
		reverseData: null,
		type: 'create',
		typeData: {},
	};
}

interface ISetPartCommand extends ICommand {
	type: 'selectPart';
	part: Part;
	partNumber: number;
	reverseData: {
		partNumber: number;
	};
}

function selectPart(
	store: any,
	objId: string,
	part: Part,
	partNumber: number
): ISetPartCommand {
	const objs = store.state.objects as IObjectsState;
	const obj = objs.objects[objId] as ICharacter;

	return {
		compactable: true,
		desc: `Set part ${part} of ${objId}`,
		direction: CommandDirection.Apply,
		part,
		partNumber,
		undoable: true,
		target: objId,
		type: 'selectPart',
		reverseData: {
			partNumber: obj.posePositions[part],
		},
	};
}

reverseGenerators.selectPart = (((input: ISetPartCommand) => ({
	compactable: input.compactable,
	desc: input.desc,
	direction: input.direction,
	target: input.target,
	type: 'selectPart',
	undoable: input.undoable,
	partNumber: input.reverseData.partNumber,
	part: input.part,
	reverseData: {
		partNumber: input.partNumber,
	},
})) as ((input: ISetPartCommand) => ISetPartCommand)) as any;

interface ISetHeadCommand extends ICommand {
	type: 'selectHead';
	headGroup: number;
	headNumber: number;
	reverseData: {
		headGroup: number;
		headNumber: number;
	};
}

function selectHead(
	store: any,
	objId: string,
	headGroup: number,
	headNumber: number
): ISetHeadCommand {
	const objs = store.state.objects as IObjectsState;
	const obj = objs.objects[objId] as ICharacter;

	return {
		compactable: true,
		desc: `Set head ${headGroup}-${headNumber} of ${objId}`,
		direction: CommandDirection.Apply,
		headGroup,
		headNumber,
		undoable: true,
		target: objId,
		type: 'selectHead',
		reverseData: {
			headGroup: obj.posePositions.headType,
			headNumber: obj.posePositions.head,
		},
	};
}

reverseGenerators.selectHead = (((input: ISetHeadCommand) => ({
	compactable: input.compactable,
	desc: input.desc,
	direction: input.direction,
	target: input.target,
	type: 'selectHead',
	undoable: input.undoable,
	headGroup: input.reverseData.headGroup,
	headNumber: input.reverseData.headNumber,
	reverseData: {
		headGroup: input.headGroup,
		headNumber: input.headNumber,
	},
})) as ((input: ISetHeadCommand) => ISetHeadCommand)) as any;
