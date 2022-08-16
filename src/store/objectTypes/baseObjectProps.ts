import getConstants from '@/constants';

export function baseProps() {
	return {
		flip: false,
		rotation: 0,
		version: 0,
		opacity: 100,
		x: getConstants().Base.screenWidth / 2,
		composite: 'source-over',
		filters: [],
		label: null,
		textboxColor: null,
		enlargeWhenTalking: false,
		nameboxWidth: null,
		zoom: 1,
	};
}
