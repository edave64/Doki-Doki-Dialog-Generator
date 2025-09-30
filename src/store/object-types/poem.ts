import getConstants from '@/constants';
import { ref } from 'vue';
import type { IdTranslationTable, Panel } from '../panels';
import BaseObject, { type GenObject } from './object';

export default class Poem extends BaseObject<'poem'> {
	public get type() {
		return 'poem' as const;
	}

	protected constructor(
		panel: Panel,
		public readonly subtype: 'poem' | 'console',
		id?: GenObject['id'],
		onTop?: boolean
	) {
		super(panel, onTop ?? true, id);

		const constants = getConstants();

		if (subtype === 'poem') {
			this._x.value = constants.Poem.defaultX;
			this._y.value = constants.Poem.defaultY;
			this._height.value = constants.Poem.defaultPoemHeight;
			this._width.value = constants.Poem.defaultPoemWidth;
			this._background.value = constants.Poem.defaultPoemBackground;
			this._font.value = constants.Poem.defaultPoemStyle;
			this._text.value = 'New poem\n\nClick here to edit poem';
		} else {
			this._x.value = constants.Poem.consoleWidth / 2;
			this._y.value = constants.Poem.consoleHeight / 2;
			this._height.value = constants.Poem.consoleHeight;
			this._width.value = constants.Poem.consoleWidth;
			this._background.value = constants.Poem.defaultConsoleBackground;
			this._font.value = constants.Poem.defaultConsoleStyle;
			this._text.value =
				'> _\n  \n  Console command\n  Click here to edit';
		}
	}

	public static createPoem(panel: Panel) {
		return new Poem(panel, 'poem');
	}

	public static createConsole(panel: Panel) {
		return new Poem(panel, 'console');
	}

	public override makeClone(
		panel: Panel,
		idTranslationTable: IdTranslationTable
	): Poem {
		const ret = new Poem(
			panel,
			this.subtype,
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
	): Poem {
		const ret = new Poem(
			panel,
			save.subtype,
			idTranslationTable.get(save.id),
			save.onTop
		);
		ret.loadPropsFromSave(save, idTranslationTable);
		return ret;
	}

	override save(): Record<string, unknown> {
		const ret = super.save();
		ret.subtype = this.subtype;
		return ret;
	}

	//#region Text
	private _autoWrap = ref(true);
	private _overflow = ref(false);
	private _text = ref('');

	get autoWrap(): boolean {
		return this._autoWrap.value;
	}

	set autoWrap(value: boolean) {
		this.mutate(this._autoWrap, value);
	}

	get overflow(): boolean {
		return this._overflow.value;
	}

	set overflow(value: boolean) {
		this.mutate(this._overflow, value);
	}

	get text(): string {
		return this._text.value;
	}

	set text(value: string) {
		this.mutate(this._text, value);
	}
	//#endregion Text

	//#region Style
	private _background = ref(0);
	private _font = ref(0);
	private _consoleColor = ref(null as string | null);

	get background(): number {
		return this._background.value;
	}

	set background(value: number) {
		this.mutate(this._background, value);
	}

	get font(): number {
		return this._font.value;
	}

	set font(value: number) {
		this.mutate(this._font, value);
	}

	get consoleColor(): string | null {
		return this._consoleColor.value;
	}

	set consoleColor(value: string | null) {
		this.mutate(this._consoleColor, value);
	}
	//#endregion Style
}
