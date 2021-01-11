import { screenWidth } from '@/constants/base';

export function baseProps() {
	return {
		flip: false,
		rotation: 0,
		version: 0,
		opacity: 100,
		x: screenWidth / 2,
		composite: 'source-over',
		filters: [],
		label: null,
		textboxColor: null,
		enlargeWhenTalking: false,
	};
}
