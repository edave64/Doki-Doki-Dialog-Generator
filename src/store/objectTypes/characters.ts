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
import { Part, characterPositions } from '@/models/constants';
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

export interface ICharacter extends IObject {
	type: 'character';
	characterType: string;
	freeMove: boolean;
	close: boolean;
	styleId: number;
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
	setCharStyle(state, command: ISetCharStyleMutation) {
		console.log(`Setting style of ${command.id} to ${command.styleId}`);

		const obj = state.objects[command.id] as ICharacter;
		obj.styleId = command.styleId;
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
	store: Store<IRootState>,
	state: Readonly<ICharacter>
): Readonly<Character<IAsset>> {
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
	data: Character<IAsset>,
	state: Readonly<ICharacter>
): Readonly<Pose<IAsset>> {
	return data.poses[state.poseId];
}

export function getParts(
	data: Character<IAsset>,
	state: Readonly<ICharacter>
): Part[] {
	const pose = getPose(data, state);
	const parts: Part[] = [];

	if (pose.compatibleHeads.length > 0) parts.push('head');
	if (pose.variant.length > 1) parts.push('variant');
	if (pose.left.length > 1) parts.push('left');
	if (pose.right.length > 1) parts.push('right');
	return parts;
}

export function getHeads(
	data: Character<IAsset>,
	state: Readonly<ICharacter>,
	headTypeId: number = state.posePositions.headType
): HeadCollection<IAsset> | null {
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
				height: 768,
				width: 768,
				characterType: command.characterType,
				close: false,
				freeMove: false,
				version: 0,
				poseId: 0,
				styleId: 0,
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
		{ state, commit, dispatch, rootGetters },
		{ delta, id, part }: ISeekPosePartAction
	) {
		if (part === 'head') {
			dispatch('seekHead', { id, delta } as ISeekHeadAction);
			return;
		}
		const obj = state.objects[id] as Readonly<ICharacter>;
		const pose = getPose(getDataG(rootGetters, obj), obj);
		if (!(pose as any)[part]) return;
		commit('setPosePosition', {
			id,
			posePositions: {
				[part]: arraySeeker(
					(pose as any)[part],
					obj.posePositions[part],
					delta
				),
			},
		} as ISetPosePositionMutation);
	},

	seekPose({ state, commit, rootGetters }, { id, delta }: ISeekPoseAction) {
		const obj = state.objects[id] as Readonly<ICharacter>;
		const data = getDataG(rootGetters, obj);
		mutatePoseAndPositions(commit, obj, data, change => {
			change.poseId = arraySeeker(data.poses, change.poseId, delta);
		});
	},

	seekStyle({ state, commit, rootGetters }, { id, delta }: ISeekStyleAction) {
		const obj = state.objects[id] as Readonly<ICharacter>;
		const data = getDataG(rootGetters, obj);
		mutatePoseAndPositions(commit, obj, data, change => {
			change.styleId = arraySeeker(data.styles, change.styleId, delta);
		});
	},

	seekHead({ state, commit, rootGetters }, { id, delta }: ISeekHeadAction) {
		const obj = state.objects[id] as Readonly<ICharacter>;
		const data = getDataG(rootGetters, obj);
		const pose = getPose(data, obj);
		let currentHeads = getHeads(data, obj);
		if (!currentHeads) return;
		let head = obj.posePositions.head + delta;
		let headType = obj.posePositions.headType;
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
	const poseAndPositionChange = buildPoseAndPositionData(obj);
	const oldStyle = oldCharData.styles[obj.styleId];
	const newStyleIdx = newCharData.styles.findIndex(
		style => style.name === oldStyle.name
	);
	if (newStyleIdx === -1) {
		poseAndPositionChange.styleId = 0;
		const oldPoseInStyle = oldCharData.poses[poseAndPositionChange.poseId];
		const oldPoseInStyleIndex = oldCharData.poses
			.filter(pose => pose.style === oldStyle.name)
			.indexOf(oldPoseInStyle);
		const newPosesInStyle = newCharData.poses.filter(
			pose => pose.style === oldStyle.name
		);
		if (newPosesInStyle.length < oldPoseInStyleIndex) {
			// Restore a pose of the same index within its style
			poseAndPositionChange.poseId = newCharData.poses.indexOf(
				newPosesInStyle[oldPoseInStyleIndex]
			);
		} else {
			poseAndPositionChange.poseId = 0;
		}
	} else {
		if (newStyleIdx !== obj.styleId) {
			poseAndPositionChange.styleId = newStyleIdx;
		}
		const newStyle = newCharData.styles[poseAndPositionChange.styleId];
		const oldPoseInStyle = oldCharData.poses[obj.poseId];
		const newPoseIdx = newCharData.poses.findIndex(
			pose => pose.name === oldPoseInStyle.name
		);
		if (newPoseIdx === -1) {
			poseAndPositionChange.poseId = newCharData.poses.findIndex(
				pose => pose.style === newStyle.name
			);
		} else if (newPoseIdx !== obj.poseId) {
			poseAndPositionChange.poseId = newPoseIdx;
		}
	}
	// Styles and poses have been restored. Proceding with pose parts
	const oldPose = oldCharData.poses[obj.poseId];
	const newPose = newCharData.poses[poseAndPositionChange.poseId];

	for (const part of ['variant', 'left', 'right'] as Array<
		'variant' | 'left' | 'right'
	>) {
		const oldPart = JSON.stringify(oldPose[part][obj.posePositions[part]]);
		const newPartIdx = newPose[part].findIndex(
			variant => JSON.stringify(variant) === oldPart
		);
		if (newPartIdx === -1) {
			poseAndPositionChange.posePositions[part] = 0;
		} else if (newPartIdx !== obj.posePositions[part]) {
			poseAndPositionChange.posePositions[part] = newPartIdx;
		}
	}

	const oldVariant = JSON.stringify(oldPose.variant[obj.posePositions.variant]);
	const newVariantIdx = newPose.variant.findIndex(
		variant => JSON.stringify(variant) === oldVariant
	);
	if (newVariantIdx === -1) {
		poseAndPositionChange.posePositions.variant = 0;
	} else if (newVariantIdx !== obj.posePositions.variant) {
		poseAndPositionChange.posePositions.variant = newVariantIdx;
	}
	const oldLeft = JSON.stringify(oldPose.variant[obj.posePositions.left]);
	const newLeftIdx = newPose.variant.findIndex(
		left => JSON.stringify(left) === oldLeft
	);
	if (newLeftIdx === -1) {
		poseAndPositionChange.posePositions.left = 0;
	} else if (newLeftIdx !== obj.posePositions.left) {
		poseAndPositionChange.posePositions.left = newLeftIdx;
	}
	const oldRigth = JSON.stringify(oldPose.variant[obj.posePositions.right]);
	const newRightIdx = newPose.variant.findIndex(
		right => JSON.stringify(right) === oldRigth
	);
	if (newRightIdx === -1) {
		poseAndPositionChange.posePositions.right = 0;
	} else if (newRightIdx !== obj.posePositions.right) {
		poseAndPositionChange.posePositions.right = newRightIdx;
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

	if (!data.styles[poseAndPosition.styleId]) {
		poseAndPosition.styleId = 0;
	}
	const style = data.styles[poseAndPosition.styleId];

	// ensure pose integrity
	if (!data.poses[poseAndPosition.poseId]) {
		poseAndPosition.poseId = 0;
	}
	if (data.poses[poseAndPosition.poseId].style !== style.name) {
		poseAndPosition.poseId = data.poses.findIndex(
			(val, idx) => idx > poseAndPosition.poseId && val.style === style.name
		);
		poseAndPosition.poseId = data.poses.findIndex(
			val => val.style === style.name
		);
	}
	const pose = data.poses[poseAndPosition.poseId];
	if (!pose.left[poseAndPosition.posePositions.left]) {
		poseAndPosition.posePositions.left = 0;
	}
	if (!pose.right[poseAndPosition.posePositions.right]) {
		poseAndPosition.posePositions.right = 0;
	}
	if (!pose.variant[poseAndPosition.posePositions.variant]) {
		poseAndPosition.posePositions.variant = 0;
	}

	// restore head group
	const oldPose = data.poses[character.poseId];
	const oldHeadCollection =
		oldPose.compatibleHeads[character.posePositions.headType];
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
	styleId: ICharacter['styleId'];
	poseId: ICharacter['poseId'];
	posePositions: ICharacter['posePositions'];
}

export interface ISetPoseMutation extends ICommand {
	readonly poseId: number;
}

export interface ISetCharStyleMutation extends ICommand {
	readonly styleId: number;
}

export interface ISetPosePositionMutation extends ICommand {
	readonly posePositions: {
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
	readonly delta: -1 | 1;
}

export interface ISeekStyleAction extends ICommand {
	readonly delta: -1 | 1;
}

export interface ISeekHeadAction extends ICommand {
	readonly delta: -1 | 1;
}

export interface ISetPartAction extends ICommand {
	readonly part: Part | 'headType' | 'pose' | 'style';
	readonly val: number;
}

export interface INsfwCheckAction extends ICommand {}

export interface ISeekPosePartAction extends ICommand {
	readonly part: Part;
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
