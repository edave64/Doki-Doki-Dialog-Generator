import { Background } from './background';

export const backgrounds = [] as Background[];

export const positions = [
	'4-1',
	'3-1',
	'2-1',
	'4-2',
	'center',
	'4-3',
	'2-2',
	'3-3',
	'4-4',
];

export const characterPositions = [
	200,
	240,
	400,
	493,
	640,
	786,
	880,
	1040,
	1080,
];

export const poses = {
	sayori: {
		left: [] as HTMLImageElement[],
		right: [] as HTMLImageElement[],
		head: [] as HTMLImageElement[],
	},
	yuri: {
		left: [] as HTMLImageElement[],
		right: [] as HTMLImageElement[],
		head: [] as HTMLImageElement[],
	},
	natsuki: {
		left: [] as HTMLImageElement[],
		right: [] as HTMLImageElement[],
		head: [] as HTMLImageElement[],
	},
	monika: {
		left: [] as HTMLImageElement[],
		right: [] as HTMLImageElement[],
		head: [] as HTMLImageElement[],
	},
};
