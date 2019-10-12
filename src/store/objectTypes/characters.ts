import { ICommand } from '@/eventbus/command';
import { Pose, characters, IHeads } from '@/asset-manager';
import {
	IObjectsState,
	ICreateObjectMutation,
	IObject,
	ISetPositionAction,
	ISetObjectPositionMutation,
} from '@/store/objects';
import { MutationTree, ActionTree } from 'vuex';
import { Part, characterPositions } from '@/models/constants';
import { ICharacter as ICharacterData } from '@/asset-manager';
import { nsfwArraySeeker } from '@/models/seekers';
import { IHistoryOptions } from '@/plugins/vuex-history';

export interface ICharacter extends IObject {
	type: 'character';
	characterType: string;
	freeMove: boolean;
	close: boolean;
	poseId: number;
	posePositions: {
		variant: number;
		left: number;
		right: number;
		head: number;
		headType: number;
	};
}

export const CloseUpYOffset = -74;
export const BaseCharacterYPos = -26;

export const characterMutations: MutationTree<IObjectsState> = {
	setPose(state, command: ISetPoseMutation) {
		const obj = state.objects[command.id] as ICharacter;
		obj.poseId = command.poseId;
		++obj.version;
	},
	setPosePosition(state, command: ISetPosePositionMutation) {
		const obj = state.objects[command.id] as ICharacter;
		obj.posePositions = {
			...obj.posePositions,
			...command.posePositions,
		};
		++obj.version;
	},
	setClose(state, command: ISetCloseMutation) {
		const obj = state.objects[command.id] as ICharacter;
		obj.close = command.close;
		obj.y += CloseUpYOffset * (obj.close ? 1 : -1);
	},
	setFreeMove(state, command: ISetFreeMoveMutation) {
		const obj = state.objects[command.id] as ICharacter;
		obj.freeMove = command.freeMove;
		if (!obj.freeMove) {
			obj.x = characterPositions[closestCharacterSlot(obj.x)];
			obj.y = BaseCharacterYPos + CloseUpYOffset * (obj.close ? 1 : 0);
		}
	},
};

export function getData(
	state: Readonly<ICharacter>
): Readonly<ICharacterData<any>> {
	return characters[state.characterType];
}

export function getPose(state: Readonly<ICharacter>): Readonly<Pose<any>> {
	return getData(state).poses[state.poseId];
}

export function getParts(state: Readonly<ICharacter>): Part[] {
	const pose = getPose(state);
	const head: Array<'head'> = pose.compatibleHeads.length > 0 ? ['head'] : [];

	if ('variant' in pose) {
		return [...head, 'variant'];
	}
	if ('left' in pose) {
		return [...head, 'left', 'right'];
	}
	return head;
}

export function getHeads(
	state: Readonly<ICharacter>,
	headTypeId: number = state.posePositions.headType
): IHeads | null {
	const data = getData(state);
	const compatibleHeads = getPose(state).compatibleHeads;
	if (!compatibleHeads || compatibleHeads.length === 0) {
		return null;
	}
	const heads = data.heads[compatibleHeads[headTypeId]];
	if (heads instanceof Array) {
		return {
			all: heads,
		};
	}
	return heads;
}

export function closestCharacterSlot(pos: number): number {
	const sorted = characterPositions
		.map((x, idx) => ({ pos: Math.abs(pos - x), idx }))
		.sort((a, b) => a.pos - b.pos);
	return sorted[0].idx;
}

let lastSpriteId = 0;

export const characterActions: ActionTree<IObjectsState, never> = {
	createCharacters({ state, commit }, command: ICreateCharacterAction) {
		commit('create', {
			object: {
				flip: false,
				id: 'characters_' + ++lastSpriteId,
				onTop: false,
				opacity: 100,
				preserveRatio: true,
				type: 'character',
				x: 640,
				y: BaseCharacterYPos,
				characterType: command.characterType,
				close: false,
				freeMove: false,
				version: 0,
				poseId: 0,
				posePositions: {
					head: 0,
					headType: 0,
					left: 0,
					right: 0,
					variant: 0,
				},
			} as ICharacter,
		} as ICreateObjectMutation);
	},

	seekPart(
		{ state, commit, dispatch },
		{ delta, id, part, nsfw }: ISeekPosePartAction
	) {
		if (part === 'head') {
			dispatch('seekHead', { id, delta, nsfw } as ISeekHeadAction);
			return;
		}
		const obj = state.objects[id] as Readonly<ICharacter>;
		const pose = getPose(obj);
		if (!(pose as any)[part]) return;
		commit('setPosePosition', {
			id,
			posePositions: {
				[part]: nsfwArraySeeker(
					(pose as any)[part],
					obj.posePositions[part],
					delta,
					nsfw
				),
			},
		} as ISetPosePositionMutation);
	},

	seekPose({ state, commit }, { id, delta, nsfw }: ISeekPoseAction) {
		const obj = state.objects[id] as Readonly<ICharacter>;
		const data = getData(obj);
		const oldHeadCollection = getPose(obj).compatibleHeads[
			obj.posePositions.headType
		];

		const newPoseId = nsfwArraySeeker(data.poses, obj.poseId, delta, nsfw);
		const newPose = data.poses[newPoseId];
		const newHeadCollectionNr = newPose.compatibleHeads.indexOf(
			oldHeadCollection
		);
		let headType: number;
		let head = obj.posePositions.head;
		if (newHeadCollectionNr >= 0) {
			headType = newHeadCollectionNr;
		} else {
			headType = 0;
			head = 0;
		}
		commit('setPose', {
			id,
			poseId: newPoseId,
		} as ISetPoseMutation);
		commit('setPosePosition', {
			id,
			posePositions: {
				head,
				headType,
				left: 0,
				right: 0,
				variant: 0,
			},
		} as ISetPosePositionMutation);
	},

	seekHead({ state, commit }, { id, delta, nsfw }: ISeekHeadAction) {
		const obj = state.objects[id] as Readonly<ICharacter>;
		const data = getData(obj);
		const pose = getPose(obj);
		let currentHeads = getHeads(obj);
		if (!currentHeads) return;
		let head = obj.posePositions.head + delta;
		let headType = obj.posePositions.headType;
		if (head < 0 || head >= currentHeads.all.length) {
			headType = nsfwArraySeeker(
				pose.compatibleHeads.map(headKey => data.heads[headKey]),
				headType,
				delta,
				nsfw
			);
			currentHeads = getHeads(obj, headType)!;
			head = delta === 1 ? 0 : currentHeads.all.length - 1;
		}
		commit('setPosePosition', {
			id,
			posePositions: {
				head,
				headType,
			},
		} as ISetPosePositionMutation);
	},

	nsfwCheck({ state, commit, dispatch }, { id }: INsfwCheckAction): void {
		const obj = state.objects[id] as Readonly<ICharacter>;
		const pose = getPose(obj);
		const partKeys = getParts(obj);

		if (pose.nsfw) {
			dispatch('seekPose', {
				id,
				delta: 1,
				nsfw: false,
			} as ISeekPoseAction);
		}

		for (const key of partKeys) {
			if (key === 'head') continue;
			const image: { nsfw?: boolean } = (pose as any)[key][
				obj.posePositions[key]
			];

			if (image.nsfw) {
				dispatch('seekPart', {
					id,
					delta: 1,
					nsfw: false,
				} as ISeekPosePartAction);
			}
		}

		const heads = getHeads(obj);
		if (heads) {
			if (heads.nsfw) {
				commit('setPosePosition', {
					id,
					posePositions: {
						head: 0,
						headType: 0,
					},
				} as ISetPosePositionMutation);
			}
		}
	},

	setCharacterPosition(
		{ state, commit, dispatch },
		{ id, x, y }: ISetPositionAction
	): void {
		const obj = state.objects[id] as ICharacter;
		if (obj.freeMove) {
			commit('setPosition', {
				id,
				x,
				y,
			} as ISetObjectPositionMutation);
		} else {
			commit('setPosition', {
				id,
				x: characterPositions[closestCharacterSlot(x)],
				y: BaseCharacterYPos + (obj.close ? CloseUpYOffset : 0),
			} as ISetObjectPositionMutation);
		}
	},

	shiftCharacterSlot(
		{ state, commit, dispatch },
		{ id, delta }: IShiftCharacterSlotAction
	): void {
		const obj = state.objects[id] as ICharacter;
		const currentSlotNr = closestCharacterSlot(obj.x);
		let newSlotNr = currentSlotNr + delta;
		if (newSlotNr < 0) {
			newSlotNr = 0;
		}
		if (newSlotNr >= characterPositions.length) {
			newSlotNr = characterPositions.length - 1;
		}
		commit('setPosition', {
			id,
			x: characterPositions[newSlotNr],
			y: obj.y,
		} as ISetObjectPositionMutation);
	},
};

export const propertyOptions: IHistoryOptions = {
	mutations: {
		setPosePosition: {
			combinable: (oldMut, newMut) => oldMut.payload.id === newMut.payload.id,
			combinator: (oldMut, newMut) => ({
				type: newMut.type,
				payload: {
					id: newMut.payload.id,
					posePositions: {
						...oldMut.payload.posePositions,
						...newMut.payload.posePositions,
					},
				} as ISetPosePositionMutation,
			}),
		},
	},
};

export interface ISetPoseMutation extends ICommand {
	readonly poseId: number;
}

export interface ISetPosePositionMutation extends ICommand {
	posePositions: {
		variant: number;
		left: number;
		right: number;
		head: number;
		headType: number;
	};
}

export interface ISetFreeMoveMutation extends ICommand {
	readonly freeMove: boolean;
}

export interface ISetCloseMutation extends ICommand {
	readonly close: boolean;
}

export interface ICreateCharacterAction {
	readonly characterType: string;
}

export interface ISeekPoseAction extends ICommand {
	readonly delta: number;
	readonly nsfw: boolean;
}

export interface ISeekHeadAction extends ICommand {
	delta: -1 | 1;
	nsfw: boolean;
}

export interface INsfwCheckAction extends ICommand {}

export interface ISeekPosePartAction extends ICommand {
	readonly part: Part;
	readonly delta: number;
	readonly nsfw: boolean;
}

export interface ISetSpriteSizeMutation extends ICommand {
	readonly width: number;
	readonly height: number;
}

export interface ISetSpriteRatioMutation extends ICommand {
	readonly preserveRatio: boolean;
	readonly ratio: number;
}

export interface ISetSpriteWidthAction extends ICommand {
	readonly width: number;
}

export interface ISetSpriteHeightAction extends ICommand {
	readonly height: number;
}

export interface ISetSpriteRatioAction extends ICommand {
	readonly preserveRatio: boolean;
}

export interface ICreateSpriteAction extends ICommand {
	readonly assetName: string;
}

export interface IShiftCharacterSlotAction extends ICommand {
	readonly delta: number;
}
