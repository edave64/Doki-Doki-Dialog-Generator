import { ICommand } from '@/eventbus/command';
import {
	IObjectsState,
	ICreateObjectMutation,
	IObject,
	ISetPositionAction,
	ISetObjectPositionMutation,
	IRemoveObjectAction,
} from '@/store/objects';
import { MutationTree, ActionTree, Store, Commit, ActionContext } from 'vuex';
import { characterPositions } from '@/constants/base';
import { arraySeeker } from '@/models/seekers';
import { IHistoryOptions } from '@/plugins/vuex-history';
import {
	Character,
	Pose,
	HeadCollection,
	ContentPack,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAsset } from '../content';
import { IRootState } from '..';
import { DeepReadonly } from '@/util/readonly';

export interface ICharacter extends IObject {
	type: 'character';
	characterType: string;
	freeMove: boolean;
	close: boolean;
	styleGroupId: number;
	styleId: number;
	poseId: number;
	posePositions: {
		[id: string]: number;
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
	setCharStyleGroup(state, { id, styleGroupId }: ISetCharStyleGroupMutation) {
		const obj = state.objects[id] as ICharacter;
		obj.styleGroupId = styleGroupId;
		++obj.version;
	},
	setCharStyle(state, { id, styleId }: ISetCharStyleMutation) {
		const obj = state.objects[id] as ICharacter;
		obj.styleId = styleId;
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
		++obj.version;
	},
	setFreeMove(state, command: ISetFreeMoveMutation) {
		const obj = state.objects[command.id] as ICharacter;
		obj.freeMove = command.freeMove;
		if (!obj.freeMove) {
			obj.x = characterPositions[closestCharacterSlot(obj.x)];
			obj.y = BaseCharacterYPos;
		}
	},
};

export function getData(
	store: Store<DeepReadonly<IRootState>>,
	state: DeepReadonly<ICharacter>
): DeepReadonly<Character<IAsset>> {
	const characters = store.getters['content/getCharacters'] as Map<
		Character<IAsset>['id'],
		Character<IAsset>
	>;
	return characters.get(state.characterType)!;
}

export function getDataG(
	rootGetters: any,
	state: Readonly<ICharacter>
): Readonly<Character<IAsset>> {
	const characters = rootGetters['content/getCharacters'] as Map<
		Character<IAsset>['id'],
		Character<IAsset>
	>;
	return characters.get(state.characterType)!;
}

export function getPose(
	data: DeepReadonly<Character<IAsset>>,
	state: DeepReadonly<ICharacter>
): DeepReadonly<Pose<IAsset>> {
	return data.styleGroups[state.styleGroupId].styles[state.styleId].poses[
		state.poseId
	];
}

export function getParts(
	data: DeepReadonly<Character<IAsset>>,
	state: DeepReadonly<ICharacter>
): DeepReadonly<string[]> {
	const pose = getPose(data, state);
	const positionKeys = [
		...Object.keys(pose.positions).filter(
			positionKey => pose.positions[positionKey].length > 1
		),
	];
	if (pose.compatibleHeads.length > 0) positionKeys.unshift('head');
	return positionKeys;
}

export function getHeads(
	data: DeepReadonly<Character<IAsset>>,
	state: DeepReadonly<ICharacter>,
	headTypeId: number = state.posePositions.headType || 0
): DeepReadonly<HeadCollection<IAsset>> | null {
	const compatibleHeads = getPose(data, state).compatibleHeads;
	if (!compatibleHeads || compatibleHeads.length === 0) {
		return null;
	}
	const heads = data.heads[compatibleHeads[headTypeId]];
	return heads;
}

export function closestCharacterSlot(pos: number): number {
	const sorted = characterPositions
		.map((x, idx) => ({ pos: Math.abs(pos - x), idx }))
		.sort((a, b) => a.pos - b.pos);
	return sorted[0].idx;
}

let lastSpriteId = 0;

export const characterActions: ActionTree<IObjectsState, IRootState> = {
	createCharacters({ rootState, commit }, command: ICreateCharacterAction) {
		commit('create', {
			object: {
				flip: false,
				id: 'characters_' + ++lastSpriteId,
				panelId: rootState.panels.currentPanel,
				onTop: false,
				opacity: 100,
				type: 'character',
				x: 640,
				y: BaseCharacterYPos,
				preserveRatio: true,
				ratio: 1,
				rotation: 0,
				height: 768,
				width: 768,
				characterType: command.characterType,
				close: false,
				freeMove: false,
				version: 0,
				poseId: 0,
				styleId: 0,
				styleGroupId: 0,
				posePositions: {},
				composite: 'source-over',
				filters: [],
			} as ICharacter,
		} as ICreateObjectMutation);
	},

	seekPart(
		{ state, commit, dispatch, rootGetters },
		{ delta, id, part }: ISeekPosePartAction
	) {
		if (part === 'head') {
			dispatch('seekHead', { id, delta } as ISeekHeadAction);
			return;
		}
		const obj = state.objects[id] as Readonly<ICharacter>;
		const pose = getPose(getDataG(rootGetters, obj), obj);
		if (!pose.positions[part]) return;
		commit('setPosePosition', {
			id,
			posePositions: {
				[part]: arraySeeker(
					pose.positions[part],
					obj.posePositions[part] || 0,
					delta
				),
			},
		} as ISetPosePositionMutation);
	},

	seekPose({ state, commit, rootGetters }, { id, delta }: ISeekPoseAction) {
		const obj = state.objects[id] as Readonly<ICharacter>;
		const data = getDataG(rootGetters, obj);
		const poses = data.styleGroups[obj.styleGroupId].styles[obj.styleId].poses;
		mutatePoseAndPositions(commit, obj, data, change => {
			change.poseId = arraySeeker(poses, change.poseId, delta);
		});
	},

	seekStyle({ state, commit, rootGetters }, { id, delta }: ISeekStyleAction) {
		const obj = state.objects[id] as Readonly<ICharacter>;
		const data = getDataG(rootGetters, obj);
		const linearStyles = data.styleGroups
			.flatMap((styleGroup, styleGroupIdx) => {
				return styleGroup.styles.map((style, styleIdx) => {
					return {
						styleGroupIdx,
						styleIdx,
						styleGroupJson: JSON.stringify(style.components),
					};
				});
			})
			.sort((styleA, styleB) =>
				styleA.styleGroupJson.localeCompare(styleB.styleGroupJson)
			);
		const linearIdx = linearStyles.findIndex(
			style =>
				style.styleGroupIdx === obj.styleGroupId &&
				style.styleIdx === obj.styleId
		);
		mutatePoseAndPositions(commit, obj, data, change => {
			const nextIdx = arraySeeker(linearStyles, linearIdx, delta);
			const style = linearStyles[nextIdx];
			change.styleGroupId = style.styleGroupIdx;
			change.styleId = style.styleIdx;
		});
	},

	seekHead({ state, commit, rootGetters }, { id, delta }: ISeekHeadAction) {
		const obj = state.objects[id] as Readonly<ICharacter>;
		const data = getDataG(rootGetters, obj);
		const pose = getPose(data, obj);
		let currentHeads = getHeads(data, obj);
		if (!currentHeads) return;
		let head = (obj.posePositions.head || 0) + delta;
		let headType = obj.posePositions.headType || 0;
		if (head < 0 || head >= currentHeads.variants.length) {
			headType = arraySeeker(
				pose.compatibleHeads.map(headKey => data.heads[headKey]),
				headType,
				delta
			);
			currentHeads = getHeads(data, obj, headType)!;
			head = delta === 1 ? 0 : currentHeads.variants.length - 1;
		}
		commit('setPosePosition', {
			id,
			posePositions: {
				head,
				headType,
			},
		} as ISetPosePositionMutation);
	},

	setPart(
		{ state, commit, rootGetters },
		{ id, part, val }: ISetPartAction
	): void {
		const obj = state.objects[id] as Readonly<ICharacter>;
		const data = getDataG(rootGetters, obj);
		if (part === 'pose') {
			mutatePoseAndPositions(commit, obj, data, change => {
				change.poseId = val;
			});
		} else if (part === 'style') {
			mutatePoseAndPositions(commit, obj, data, change => {
				change.styleId = val;
			});
		} else {
			mutatePoseAndPositions(commit, obj, data, change => {
				change.posePositions[part] = val;
			});
		}
	},

	setCharStyle(
		{ state, commit, rootGetters },
		{ id, styleGroupId, styleId }: ISetStyleAction
	) {
		const obj = state.objects[id] as Readonly<ICharacter>;
		const data = getDataG(rootGetters, obj);
		mutatePoseAndPositions(commit, obj, data, change => {
			change.styleGroupId = styleGroupId;
			change.styleId = styleId;
		});
	},

	setCharacterPosition(
		{ state, commit },
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
		{ state, commit },
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

export async function fixContentPackRemovalFromCharacter(
	context: ActionContext<IObjectsState, IRootState>,
	id: string,
	oldPack: ContentPack<IAsset>
) {
	const obj = context.state.objects[id] as ICharacter;
	const oldCharData = oldPack.characters.find(
		char => char.id === obj.characterType
	);
	if (!oldCharData) {
		console.error('Character data is missing. Dropping the character.');
		context.dispatch('removeObject', {
			id,
		} as IRemoveObjectAction);
		return;
	}
	const poseAndPositionChange = buildPoseAndPositionData(obj);
	const oldStyleGroup = oldCharData.styleGroups[obj.styleGroupId];
	const oldStyle = oldStyleGroup.styles[poseAndPositionChange.styleId];
	const oldPose = oldStyle.poses[poseAndPositionChange.poseId];

	const newCharData = context.rootState.content.current.characters.find(
		chr => chr.id === oldCharData.id
	);
	if (!newCharData) {
		console.error('Character data is missing. Dropping the character.');
		context.dispatch('removeObject', {
			id,
		} as IRemoveObjectAction);
		return;
	}
	const newStyleGroupIdx = newCharData.styleGroups.findIndex(
		styleGroup => styleGroup.id === oldStyleGroup.id
	);
	poseAndPositionChange.styleGroupId =
		newStyleGroupIdx === -1 ? 0 : newStyleGroupIdx;

	const newStyleGroup =
		newCharData.styleGroups[poseAndPositionChange.styleGroupId];
	const styleProperies = JSON.stringify(oldStyle.components);
	const newStyleIdx = newStyleGroup.styles.findIndex(
		style => JSON.stringify(style.components) === styleProperies
	);
	poseAndPositionChange.styleId = newStyleIdx === -1 ? 0 : newStyleIdx;

	const newStyle = newStyleGroup.styles[poseAndPositionChange.styleId];
	const newPoseIdx = newStyle.poses.findIndex(pose => pose.id === oldPose.id);
	poseAndPositionChange.poseId = newPoseIdx === -1 ? 0 : newPoseIdx;

	// Styles and poses have been restored. Proceding with pose parts
	const newPose = newStyle.poses[poseAndPositionChange.poseId];

	const newPosePositions: ICharacter['posePositions'] = {};

	for (const key in newPose.positions) {
		if (!newPose.positions.hasOwnProperty(key)) continue;
		const newPosition = newPose.positions[key];

		if (oldPose.positions[key]) {
			const oldPositionIdx = poseAndPositionChange.posePositions[key];
			if (oldPositionIdx >= 0 && oldPositionIdx < newPosition.length) {
				newPosePositions[key] = oldPositionIdx;
			} else {
				newPosePositions[key] = 0;
			}
		} else {
			newPosePositions[key] = 0;
		}
	}

	const oldHeadGroup = oldPose.compatibleHeads[obj.posePositions.headType];
	const newHeadGroupIdx = newPose.compatibleHeads.indexOf(oldHeadGroup);

	if (newHeadGroupIdx === -1) {
		poseAndPositionChange.posePositions.headType = 0;
		poseAndPositionChange.posePositions.head = 0;
	} else {
		if (newHeadGroupIdx !== obj.posePositions.headType) {
			poseAndPositionChange.posePositions.headType = newHeadGroupIdx;
		}
		const oldHead = JSON.stringify(
			oldCharData.heads[oldHeadGroup].variants[obj.posePositions.head]
		);
		const newHeadIdx = newCharData.heads[oldHeadGroup].variants.findIndex(
			variant => JSON.stringify(variant) === oldHead
		);
		if (newHeadIdx === -1) {
			poseAndPositionChange.posePositions.head = 0;
		} else {
			poseAndPositionChange.posePositions.head = newHeadIdx;
		}
	}

	commitPoseAndPositionChanges(context.commit, obj, poseAndPositionChange);
}

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

function buildPoseAndPositionData(
	character: Readonly<ICharacter>
): PoseAndPositionChange {
	return {
		styleGroupId: character.styleGroupId,
		styleId: character.styleId,
		poseId: character.poseId,
		posePositions: { ...character.posePositions },
	};
}

function commitPoseAndPositionChanges(
	commit: Commit,
	character: Readonly<ICharacter>,
	poseAndPosition: PoseAndPositionChange
) {
	if (poseAndPosition.styleGroupId !== character.styleGroupId) {
		commit('setCharStyleGroup', {
			id: character.id,
			styleGroupId: poseAndPosition.styleGroupId,
		} as ISetCharStyleGroupMutation);
	}
	if (poseAndPosition.styleId !== character.styleId) {
		console.log(
			`Setting style of ${character.id} to ${poseAndPosition.styleId}`
		);
		commit('setCharStyle', {
			id: character.id,
			styleId: poseAndPosition.styleId,
		} as ISetCharStyleMutation);
	}
	if (poseAndPosition.poseId !== character.poseId) {
		commit('setPose', {
			id: character.id,
			poseId: poseAndPosition.poseId,
		} as ISetPoseMutation);
	}
	if (
		JSON.stringify(poseAndPosition.posePositions) !==
		JSON.stringify(character.posePositions)
	) {
		commit('setPosePosition', {
			id: character.id,
			posePositions: poseAndPosition.posePositions,
		} as ISetPosePositionMutation);
	}
}

function mutatePoseAndPositions(
	commit: Commit,
	character: Readonly<ICharacter>,
	data: Character<IAsset>,
	callback: (change: PoseAndPositionChange) => void
) {
	const poseAndPosition = buildPoseAndPositionData(character);
	callback(poseAndPosition);

	if (!data.styleGroups[poseAndPosition.styleGroupId]) {
		poseAndPosition.styleGroupId = 0;
	}
	const styleGroup = data.styleGroups[poseAndPosition.styleGroupId];

	if (!styleGroup.styles[poseAndPosition.styleId]) {
		poseAndPosition.styleId = 0;
	}
	const style = styleGroup.styles[poseAndPosition.styleId];

	// ensure pose integrity
	if (!style.poses[poseAndPosition.poseId]) {
		poseAndPosition.poseId = 0;
	}
	const pose = style.poses[poseAndPosition.poseId];

	for (const positionKey in pose.positions) {
		if (!pose.positions[positionKey]) continue;
		if (
			!pose.positions[positionKey][poseAndPosition.posePositions[positionKey]]
		) {
			poseAndPosition.posePositions[positionKey] = 0;
		}
	}

	// restore head group
	const oldPose =
		data.styleGroups[character.styleGroupId].styles[character.styleId].poses[
			character.poseId
		];
	const oldHeadCollection =
		oldPose.compatibleHeads[character.posePositions.headType || 0];
	const newHeadCollectionNr = pose.compatibleHeads.indexOf(oldHeadCollection);
	if (newHeadCollectionNr >= 0) {
		poseAndPosition.posePositions.headType = newHeadCollectionNr;
	} else {
		poseAndPosition.posePositions.headType = 0;
		poseAndPosition.posePositions.head = 0;
	}

	commitPoseAndPositionChanges(commit, character, poseAndPosition);
}

interface PoseAndPositionChange {
	styleGroupId: ICharacter['styleGroupId'];
	styleId: ICharacter['styleId'];
	poseId: ICharacter['poseId'];
	posePositions: ICharacter['posePositions'];
}

export interface ISetPoseMutation extends ICommand {
	readonly poseId: number;
}

export interface ISetCharStyleGroupMutation extends ICommand {
	readonly styleGroupId: number;
}

export interface ISetCharStyleMutation extends ICommand {
	readonly styleId: number;
}

export interface ISetPosePositionMutation extends ICommand {
	readonly posePositions: {
		[id: string]: number;
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
	readonly delta: -1 | 1;
}

export interface ISeekStyleAction extends ICommand {
	readonly delta: -1 | 1;
}

export interface ISeekHeadAction extends ICommand {
	readonly delta: -1 | 1;
}

export interface ISetPartAction extends ICommand {
	readonly part: string;
	readonly val: number;
}

export interface ISetStyleAction extends ICommand {
	readonly styleGroupId: number;
	readonly styleId: number;
}

export interface INsfwCheckAction extends ICommand {}

export interface ISeekPosePartAction extends ICommand {
	readonly part: string;
	readonly delta: -1 | 1;
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
	readonly delta: -1 | 1;
}
