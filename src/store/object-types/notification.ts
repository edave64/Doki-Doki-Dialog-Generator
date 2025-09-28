import getConstants from '@/constants';
import { ref, type Ref } from 'vue';
import type { Panel } from '../panels';
import BaseObject, { type GenObject } from './object';

export default class Notification extends BaseObject<'notification'> {
	public get type() {
		return 'notification' as const;
	}

	protected constructor(panel: Panel, id?: GenObject['id']) {
		super(panel, id);

		const constants = getConstants();
		this._customColor = ref(constants.Choices.ChoiceButtonColor);
	}

	public static create(panel: Panel) {
		return new Notification(panel);
	}

	public override makeClone(
		panel: Panel,
		idTranslationTable: Map<BaseObject['id'], BaseObject['id']>
	): Notification {
		const ret = new Notification(panel, idTranslationTable.get(this.id));
		this.moveAllRefs(this, ret);
		return ret;
	}

	//#region Text
	private _text = ref('');
	private _autoWrap = ref(true);

	get text(): string {
		return this._text.value;
	}

	set text(value: string) {
		this.mutate(this._text, value);
	}

	get autoWrap(): boolean {
		return this._autoWrap.value;
	}

	set autoWrap(value: boolean) {
		this.mutate(this._autoWrap, value);
	}
	//#endregion Text

	//#region Style
	private _backdrop = ref(true);

	// TODO: Implement recoloring of notifications
	private _customColor: Ref<string>;

	get backdrop(): boolean {
		return this._backdrop.value;
	}

	set backdrop(value: boolean) {
		this.mutate(this._backdrop, value);
	}
	//#endregion Style
}
