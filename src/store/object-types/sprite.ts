import { getAAsset } from '@/asset-manager';
import getConstants from '@/constants';
import { ImageAsset } from '@/render-utils/assets/image-asset';
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
		onTop?: boolean,
		{ width, height }: { width?: number; height?: number } = {}
	) {
		super(panel, onTop ?? false, id);

		if (width != null) this._width.value = width;
		if (height != null) this._height.value = height;

		const constants = getConstants();
		this._y.value = constants.Base.screenHeight / 2;
		this._enlargeWhenTalking.value = ui.defaultCharacterTalkingZoom;
	}

	public static async create(panel: Panel, assets: IAssetSwitch[]) {
		const asset = await getAAsset(assets[0], false);
		if (!(asset instanceof ImageAsset)) return;
		return new Sprite(panel, assets, undefined, false, {
			width: asset.width,
			height: asset.height,
		});
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
		ret.loadPropsFromSave(save, idTranslationTable);
		return ret;
	}

	override save(): Record<string, unknown> {
		const ret = super.save();
		ret.assets = this.assets;
		return ret;
	}
}
