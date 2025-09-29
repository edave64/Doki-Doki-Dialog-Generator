import type { IAssetSwitch } from '@/store/content';
import type { Panel } from '../panels';
import { ui } from '../ui';
import BaseObject, { type GenObject } from './object';

export default class Sprite extends BaseObject<'sprite'> {
	public get type() {
		return 'sprite' as const;
	}

	override get initialOnTop(): boolean {
		return false;
	}

	protected constructor(
		panel: Panel,
		public readonly assets: IAssetSwitch[],
		id?: GenObject['id']
	) {
		super(panel, id);

		this._enlargeWhenTalking.value = ui.defaultCharacterTalkingZoom;
	}

	public static create(panel: Panel, assets: IAssetSwitch[]) {
		return new Sprite(panel, assets);
	}

	public override makeClone(
		panel: Panel,
		idTranslationTable: Map<BaseObject['id'], BaseObject['id']>
	): Sprite {
		const ret = new Sprite(
			panel,
			this.assets,
			idTranslationTable.get(this.id)
		);
		this.moveAllRefs(this, ret);
		return ret;
	}
}
