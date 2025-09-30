import getConstants from '@/constants';
import { arraySeeker } from '@/util/seekers';
import type {
	Character as CharacterModel,
	HeadCollection,
	Pose,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import type { DeepReadonly } from 'ts-essentials';
import { computed, ref, type Ref } from 'vue';
import { content, type IAssetSwitch } from '../content';
import type { IdTranslationTable, Panel } from '../panels';
import { ui } from '../ui';
import BaseObject, { type GenObject } from './object';

export default class Character extends BaseObject<'character'> {
	public get type() {
		return 'character' as const;
	}

	protected constructor(
		panel: Panel,
		public characterType: string,
		id?: GenObject['id'],
		onTop?: boolean
	) {
		super(panel, onTop ?? false, id);

		const constants = getConstants();
		const data = this.charData;
		const charScale = data.hd
			? constants.Base.hdCharacterScaleFactor
			: constants.Base.sdCharacterScaleFactor;

		this._y.value = constants.Base.BaseCharacterYPos;
		this._width.value = data.size[0];
		this._height.value = data.size[1];
		this._scaleX.value = data.defaultScale[0] * charScale;
		this._scaleY.value = data.defaultScale[1] * charScale;
		this._label.value = data.label ?? data.id;
		this._enlargeWhenTalking.value = ui.defaultCharacterTalkingZoom;
	}

	public static create(panel: Panel, characterType: string) {
		return new Character(panel, characterType);
	}

	public override makeClone(
		panel: Panel,
		idTranslationTable: IdTranslationTable
	) {
		const ret = new Character(
			panel,
			this.characterType,
			idTranslationTable.get(this.id)
		);
		this.moveAllRefs(this, ret);
		return ret;
	}

	public static fromSave(
		panel: Panel,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		save: Record<string, any>,
		idTranslationTable: IdTranslationTable
	): Character {
		const ret = new Character(
			panel,
			save.characterType,
			idTranslationTable.get(save.id),
			save.onTop
		);
		ret.loadPropsFromSave(save, idTranslationTable);
		return ret;
	}

	override save(): Record<string, unknown> {
		const ret = super.save();
		ret.characterType = this.characterType;
		return ret;
	}

	//#region Positioning
	private _freeMove = ref(false);

	get freeMove(): boolean {
		return this._freeMove.value;
	}

	set freeMove(freeMove: boolean) {
		if (!freeMove && this.linkedTo != null) return;
		if (!freeMove) {
			// If free move is disabled, we need to reset the position to the closest slot
			const constants = getConstants();
			this.mutateX(
				[this._freeMove, this._x, this._y],
				[
					false,
					constants.Base.characterPositions[
						closestCharacterSlot(this.x)
					],
					constants.Base.BaseCharacterYPos,
				]
			);
		} else {
			this.mutate(this._freeMove, true);
		}
	}

	override get x(): number {
		return this._x.value;
	}

	override set x(x: number) {
		if (!this.freeMove) {
			const constants = getConstants();
			x = constants.Base.characterPositions[closestCharacterSlot(x)];
		}
		super.x = x;
	}

	override get y(): number {
		return this._y.value;
	}

	override set y(y: number) {
		if (!this.freeMove) {
			const constants = getConstants();
			y = constants.Base.BaseCharacterYPos;
		}
		super.y = y;
	}

	get linkedTo(): number | null {
		return this._linkedTo.value;
	}

	set linkedTo(val: number | null) {
		super.linkedTo = val;

		if (this._linkedTo.value != null) {
			this.mutate(this._freeMove, true);
		}
	}

	shiftCharacterSlot(delta: -1 | 1): void {
		const constants = getConstants();
		const currentSlotNr = closestCharacterSlot(this.x);
		let newSlotNr = currentSlotNr + delta;
		if (newSlotNr < 0) {
			newSlotNr = 0;
		}
		if (newSlotNr >= constants.Base.characterPositions.length) {
			newSlotNr = constants.Base.characterPositions.length - 1;
		}
		this.x = constants.Base.characterPositions[newSlotNr];
	}
	//#endregion Positioning

	//#region Transforms
	/*
	 * `close` is essentially just a second way of zooming, only with a different anchor point.
	 * It is made to mimic the effect in DDLC of characters talking close to the screen.
	 *
	 * Note that there isn't any code modifying the transform here. `Object#localTransform` already
	 * takes into account the `close` property, since it's difficult to insert a new transform
	 * in a child class without duplicating the code.
	 */

	private _close = ref(false);

	get close(): boolean {
		return this._close.value;
	}

	set close(close: boolean) {
		this.mutate(this._close, close);
	}
	//#endregion Transforms

	//#region Character configuration
	private _styleGroupId = ref(0);
	private _styleId = ref(0);
	private _poseId = ref(0);
	private _posePositions: Ref<Record<string, number>> = ref({});

	get styleId(): number {
		return this._styleId.value;
	}

	set styleId(styleId: number) {
		this.mutate(this._styleId, styleId);
	}

	get styleGroupId(): number {
		return this._styleGroupId.value;
	}

	get posePositions(): Record<string, number> {
		return this._posePositions.value;
	}

	get poseId(): number {
		return this._poseId.value;
	}

	setPosePosition(positions: Record<string, number>) {
		this.mutate(this._posePositions, {
			...this._posePositions.value,
			...positions,
		});
	}

	seekPart(part: string, delta: -1 | 1) {
		if (part === 'head') {
			this.seekHead(delta);
			return;
		}
		const pose = this._poseData.value;

		if (!pose.positions[part]) return;
		this.setPosePosition({
			[part]: arraySeeker(
				pose.positions[part],
				this.posePositions[part] || 0,
				delta
			),
		});
	}

	seekPose(delta: number) {
		const data = this._characterData.value;
		const poses =
			data.styleGroups[this._styleGroupId.value].styles[this.styleId]
				.poses;

		this.mutatePoseAndPositions((change) => {
			change.poseId = arraySeeker(poses, change.poseId, delta);
		});
	}

	seekStyle(delta: number) {
		const data = this._characterData.value;
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
			(style) =>
				style.styleGroupIdx === this.styleGroupId &&
				style.styleIdx === this.styleId
		);
		this.mutatePoseAndPositions((change) => {
			const nextIdx = arraySeeker(linearStyles, linearIdx, delta);
			const style = linearStyles[nextIdx];
			change.styleGroupId = style.styleGroupIdx;
			change.styleId = style.styleIdx;
		});
	}

	seekHead(delta: -1 | 1) {
		const data = this._characterData.value;
		const pose = this._poseData.value;
		const posePositions = this.posePositions;
		if (pose.compatibleHeads.length === 0) {
			return null;
		}
		let headType = posePositions.headType || 0;
		let currentHeads = data.heads[pose.compatibleHeads[headType]];
		if (!currentHeads) return;
		let head = (posePositions.head || 0) + delta;
		if (head < 0 || head >= currentHeads.variants.length) {
			headType = arraySeeker(
				pose.compatibleHeads.map((headKey) => data.heads[headKey]),
				headType,
				delta
			);
			currentHeads = data.heads[pose.compatibleHeads[headType]];
			head = delta === 1 ? 0 : currentHeads.variants.length - 1;
		}
		this.setPosePosition({
			head,
			headType,
		});
	}

	setPart(part: string, val: number): void {
		if (part === 'pose') {
			this.mutatePoseAndPositions((change) => {
				change.poseId = val;
			});
		} else if (part === 'style') {
			this.mutatePoseAndPositions((change) => {
				change.styleId = val;
			});
		} else {
			this.mutatePoseAndPositions((change) => {
				change.posePositions[part] = val;
			});
		}
	}

	setCharStyle(styleGroupId: number, styleId: number) {
		this.mutatePoseAndPositions((change) => {
			change.styleGroupId = styleGroupId;
			change.styleId = styleId;
		});
	}
	//#endregion Character configuration

	//#region Helpers
	protected _characterData = computed(
		() => content.characters.get(this.characterType)!
	);

	public get charData(): DeepReadonly<CharacterModel<IAssetSwitch>> {
		return this._characterData.value!;
	}

	protected _poseData = computed(
		() =>
			this._characterData.value?.styleGroups[this._styleGroupId.value]
				?.styles[this._styleId.value]?.poses[this._poseId.value]
	);

	public get poseData(): DeepReadonly<Pose<IAssetSwitch>> {
		return this._poseData.value!;
	}

	protected _headData = computed(() => {
		const compatibleHeads = this._poseData.value?.compatibleHeads;
		if (compatibleHeads == null || compatibleHeads.length === 0) {
			return null;
		}
		return this._characterData.value?.heads[compatibleHeads[0]];
	});

	protected _availablePartsKeys = computed(() => {
		const pose = this._poseData.value;
		if (!pose) return [];
		const positionKeys = Object.keys(pose.positions).filter(
			(positionKey) => pose.positions[positionKey].length > 1
		);
		if (pose.compatibleHeads.length > 0) positionKeys.unshift('head');
		return positionKeys;
	});

	get availablePartsKeys(): string[] {
		return this._availablePartsKeys.value;
	}

	/**
	 * Simple changes to a character's pose or style can impact which other settings are valid.
	 * This function can be used to update values of a character's and have other values automatically updated.
	 */
	protected mutatePoseAndPositions(
		callback: (change: PoseAndPositionChange) => void
	): void {
		const data = this._characterData.value;
		const poseAndPosition = this.buildPoseAndPositionData();
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
				!pose.positions[positionKey][
					poseAndPosition.posePositions[positionKey]
				]
			) {
				poseAndPosition.posePositions[positionKey] = 0;
			}
		}

		// restore head group
		const oldPose =
			data.styleGroups[this._styleGroupId.value].styles[this.styleId]
				.poses[this._poseId.value];
		const oldHeadCollection =
			oldPose.compatibleHeads[this._posePositions.value.headType || 0];
		const newHeadCollectionNr =
			pose.compatibleHeads.indexOf(oldHeadCollection);
		if (newHeadCollectionNr >= 0) {
			poseAndPosition.posePositions.headType = newHeadCollectionNr;
		} else {
			poseAndPosition.posePositions.headType = 0;
			poseAndPosition.posePositions.head = 0;
		}

		this.commitPoseAndPositionChanges(poseAndPosition);
	}

	private commitPoseAndPositionChanges(
		poseAndPosition: PoseAndPositionChange
	) {
		const positionsChanged =
			JSON.stringify(poseAndPosition.posePositions) !==
			JSON.stringify(this._posePositions.value);
		if (positionsChanged) {
			this.mutate(this._posePositions, poseAndPosition.posePositions);
		}
		this.mutateX(
			[this._styleGroupId, this._styleId, this._poseId],
			[
				poseAndPosition.styleGroupId,
				poseAndPosition.styleId,
				poseAndPosition.poseId,
			]
		);
	}

	private buildPoseAndPositionData(): PoseAndPositionChange {
		return {
			styleGroupId: this._styleGroupId.value,
			styleId: this._styleId.value,
			poseId: this._poseId.value,
			posePositions: { ...this._posePositions.value },
		};
	}

	private _heads = computed(() => {
		const compatibleHeads = this._poseData.value?.compatibleHeads;
		if (compatibleHeads == null || compatibleHeads.length === 0) {
			return null;
		}
		return this._characterData.value.heads[
			compatibleHeads[this.posePositions.headType || 0]
		];
	});

	get headsData(): HeadCollection<IAssetSwitch> | null {
		return this._heads.value;
	}
	//#endregion Helpers
}

interface PoseAndPositionChange {
	styleGroupId: number;
	styleId: number;
	poseId: number;
	posePositions: Record<string, number>;
}

export function closestCharacterSlot(pos: number): number {
	const constants = getConstants();
	const sorted = constants.Base.characterPositions
		.map((x, idx) => ({ pos: Math.abs(pos - x), idx }))
		.sort((a, b) => a.pos - b.pos);
	return sorted[0].idx;
}
