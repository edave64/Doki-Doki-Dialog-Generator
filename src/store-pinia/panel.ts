import type { IObject } from '@/store/objects';
import type { ScalingModes } from '@/store/panels';

class Panel {
	readonly background: IPanelBackground = {
		color: '#000000',
		current: transparentId,
		flipped: false,
		scaling: ScalingModes.Cover,
		variant: 0,
		composite: 'source-over',
		filters: [],
	};
	lastRender = '';
	lastObjId: IObject['id'] = -1;
	order: IObject['id'][] = [];
	onTopOrder: IObject['id'][] = [];
	objects: { [id: IObject['id']]: IObject } = {};

	public constructor(readonly id: number) {}
}

interface IPanelBackground extends IHasSpriteFilters {
	current: string;
	color: string;
	flipped: boolean;
	variant: number;
	scaling: ScalingModes;
}
