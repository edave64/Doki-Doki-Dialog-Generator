import getConstants from '@/constants';
import { undoAble } from '@/history-engine/history';
import { ref, type DeepReadonly, type Ref } from 'vue';
import type { Panel } from '../panels';
import BaseObject, { type GenObject } from './object';

export default class Choice extends BaseObject<'choice'> {
	public get type() {
		return 'choice' as const;
	}

	protected constructor(panel: Panel, id?: GenObject['id']) {
		super(panel, id);

		const constants = getConstants();
		this._choiceDistance = ref(constants.Choices.ChoiceSpacing);
		this._customColor = ref(constants.Choices.ChoiceButtonColor);
	}

	public static create(panel: Panel) {
		return new Choice(panel);
	}

	public override makeClone(
		panel: Panel,
		idTranslationTable: Map<BaseObject['id'], BaseObject['id']>
	): Choice {
		const ret = new Choice(panel, idTranslationTable.get(this.id));
		this.moveAllRefs(this, ret);
		return ret;
	}

	//#region Style

	// TODO: Implement recoloring of choices
	private _customColor: Ref<string>;

	//#region Choices
	private _choices = ref<IChoice[]>([
		{
			selected: false,
			text: 'Click here to edit choice',
		},
	]);
	private _choiceDistance: Ref<number>;
	private _autoWrap = ref(true);

	get choices(): DeepReadonly<IChoice[]> {
		return this._choices.value;
	}

	public addChoice(text: string) {
		const choice = {
			selected: false,
			text,
		};
		undoAble(
			() => void this._choices.value.push(choice),
			() => void this._choices.value.pop()
		);
	}

	public removeChoice(choiceIdx: number) {
		const choice = this._choices.value[choiceIdx];
		undoAble(
			() => void this._choices.value.splice(choiceIdx, 1),
			() => void this._choices.value.splice(choiceIdx, 0, choice)
		);
	}

	public setChoiceProperty<Key extends keyof IChoice>(
		choiceIdx: number,
		key: Key,
		value: IChoice[Key]
	) {
		const oldValue = this._choices.value[choiceIdx][key];
		undoAble(
			() => {
				this._choices.value[choiceIdx][key] = value;
			},
			() => {
				this._choices.value[choiceIdx][key] = oldValue;
			}
		);
	}

	get choiceDistance(): number {
		return this._choiceDistance.value;
	}

	get autoWrap(): boolean {
		return this._autoWrap.value;
	}

	set autoWrap(value: boolean) {
		this.mutate(this._autoWrap, value);
	}
	//#endregion Choices
}

export interface IChoice {
	text: string;
	selected: boolean;
}
