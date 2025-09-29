import type { IAssetSwitch } from '@/store/content';
import type { IdTranslationTable, Panel } from '../panels';
import { ui } from '../ui';
import BaseObject, { type GenObject } from './object';

export default class Sprite extends BaseObject<'sprite'> {
	public get type() {
		return 'sprite' as const;
	}

	protected constructor(
		panel: Panel,
		public readonly assets: IAssetSwitch[],
		id?: GenObject['id'],
		onTop?: boolean
	) {
		super(panel, onTop ?? false, id);

		this._enlargeWhenTalking.value = ui.defaultCharacterTalkingZoom;
	}

	public static create(panel: Panel, assets: IAssetSwitch[]) {
		return new Sprite(panel, assets);
	}

	public override makeClone(
		panel: Panel,
		idTranslationTable: IdTranslationTable
	): Sprite {
		const ret = new Sprite(
			panel,
			this.assets,
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
	): Sprite {
		const ret = new Sprite(
			panel,
			save.assets,
			idTranslationTable.get(save.id),
			save.onTop
		);
		ret.loadPropsFromSave(save);
		return ret;
	}

	override save(): Record<string, unknown> {
		const ret = super.save();
		ret.assets = this.assets;
		return ret;
	}
}
