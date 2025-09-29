import getConstants from '@/constants';
import { ref, type Ref } from 'vue';
import type { IdTranslationTable, Panel } from '../panels';
import BaseObject, { type GenObject } from './object';

export default class Notification extends BaseObject<'notification'> {
	public get type() {
		return 'notification' as const;
	}

	protected constructor(panel: Panel, id?: GenObject['id'], onTop?: boolean) {
		super(panel, onTop ?? true, id);

		const constants = getConstants();
		this._customColor = ref(constants.Choices.ChoiceButtonColor);
	}

	public static create(panel: Panel) {
		return new Notification(panel);
	}

	public override makeClone(
		panel: Panel,
		idTranslationTable: IdTranslationTable
	): Notification {
		const ret = new Notification(panel, idTranslationTable.get(this.id));
		this.moveAllRefs(this, ret);
		return ret;
	}

	public static fromSave(
		panel: Panel,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		save: Record<string, any>,
		idTranslationTable: IdTranslationTable
	): Notification {
		const ret = new Notification(
			panel,
			idTranslationTable.get(save.id),
			save.onTop
		);
		ret.loadPropsFromSave(save);
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
