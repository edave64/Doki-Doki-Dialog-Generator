import { getAAsset } from '@/asset-manager';
import getConstants from '@/constants';
import eventBus, { RenderUpdatedEvent } from '@/eventbus/event-bus';
import { ImageAsset } from '@/render-utils/assets/image-asset';
import type { IAssetSwitch } from '@/store/content';
import type { IdTranslationTable, Panel } from '../panels';
import { ui } from '../ui';
import BaseObject, { type GenObject } from './object';

export default class Sprite extends BaseObject<'sprite'> {
	public get type() {
		return 'sprite' as const;
	}

	/**
	 * Used for migrations from <= 2.4 saves. The needed transformation changes cannot be computed
	 * until we know the size of the sprite. And that format didn't store the size, loading it from
	 * the asset instead. But we don't have the asset yet, so we store the data here and calculate
	 * the transformations once the asset is loaded.
	 */
	private _migrationData?: Record<string, unknown>;

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
		idTranslationTable: IdTranslationTable,
		sourceVersion?: number
	): Sprite {
		const ret = new Sprite(
			panel,
			save.assets,
			idTranslationTable.get(save.id),
			save.onTop
		);
		if (sourceVersion != null && sourceVersion <= 2.4) {
			ret._migrationData = save;
			(async () => {
				const asset = await getAAsset(ret.assets[0], false);
				if (!(asset instanceof ImageAsset)) return;
				await ret.applyMigration({
					url: ret.assets[0].hq,
					size: [asset.width, asset.height],
				});
			})();
		}
		ret.loadPropsFromSave(save, idTranslationTable);
		return ret;
	}

	override save(): Record<string, unknown> {
		const ret = super.save();
		ret.assets = this.assets;
		return ret;
	}

	public async applyMigration(data: { url: string; size: [number, number] }) {
		if (
			this._migrationData &&
			this.assets.length === 1 &&
			this.assets[0].hq === data.url
		) {
			// TODO: This does correctly reconstruct the scale, but the positioning seems wrong if
			// a sprite was scaled down via width/height.
			// The visual regression test actually has two incorrectly positioned sprites in
			// panel 3, compared to if you actually load in 2.4. But it is significantly better
			// than nothing.
			(await import('@/store/migrations/v2-5')).adjustObjectSize2_5(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				this._migrationData as any,
				(this._migrationData.scaleX as number) ?? 1,
				data.size
			);
			this.loadPropsFromSave(this._migrationData, new Map());
			this._migrationData = undefined;
			// Migration can be applied divorced from any transaction, so we need to manually
			// trigger a render update
			eventBus.fire(new RenderUpdatedEvent());
		}
	}

	get mayScale() {
		return !this._migrationData;
	}
}
