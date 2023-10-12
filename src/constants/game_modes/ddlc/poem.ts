import { ITextStyle } from '@/renderer/textRenderer/textRenderer';
import { screenHeight, screenWidth, sdCharacterScaleFactor } from './base';

// tslint:disable: no-magic-numbers
export const poemBackgrounds = [
	{ name: 'Normal paper', file: 'poem.jpg' },
	{ name: 'Lightly soiled paper', file: 'poem_y1.jpg' },
	{ name: 'Heavily soiled paper', file: 'poem_y2.jpg' },
	{ name: 'Console', file: 'internal:console' },
	{ name: 'Transparent', file: 'internal:transparent' },
];
export const defaultPoemBackground = 0;
export const defaultPoemStyle = 0;
export const defaultX = screenWidth / 2;
export const defaultY = screenHeight / 2;
export const poemTopPadding = 33;
export const poemBottomPadding = 100;
export const poemPadding = 30;
export const defaultPoemWidth = 800;
export const defaultPoemHeight = 720;
export const backgroundScale = sdCharacterScaleFactor;

//#region Console style
export const consoleBackgroundColor = '#333333bf';
export const consoleWidth = 480;
export const consoleHeight = 180;
export const defaultConsoleBackground = 3;
export const defaultConsoleStyle = 7;
//#endregion Console style

const BasePoemStyle: ITextStyle = {
	alpha: 1,
	color: 'black',
	isBold: false,
	isItalic: false,
	isStrikethrough: false,
	isUnderlined: false,
	letterSpacing: 0,
	lineSpacing: 1.2,
	strokeColor: '',
	strokeWidth: 0,
	fontName: 'aller',
	fontSize: 12,
};

export interface IPoemTextStyle extends ITextStyle {
	name: string;
}

export const poemTextStyles: IPoemTextStyle[] = [
	{
		...BasePoemStyle,
		name: 'Sayori',
		fontName: 'hashtag',
		fontSize: 34,
		lineSpacing: 1.05,
		letterSpacing: 0,
	},
	{
		...BasePoemStyle,
		name: 'Natsuki',
		fontName: 'ammy_handwriting',
		fontSize: 28,
	},
	{
		...BasePoemStyle,
		name: 'Monika',
		fontName: 'journal',
		fontSize: 34,
	},
	{
		...BasePoemStyle,
		name: 'Yuri',
		fontName: 'jp_hand_slanted',
		lineSpacing: 1.5,
		fontSize: 32,
	},
	{
		...BasePoemStyle,
		name: 'Yuri Act 2',
		fontName: 'damagrafik_script',
		fontSize: 18,
		letterSpacing: -8,
		// justify: true,
	},
	{
		...BasePoemStyle,
		name: 'Yuri Unused',
		fontName: 'as_i_lay_dying',
		fontSize: 40,
	},
	{
		...BasePoemStyle,
		name: 'MC',
		fontName: 'halogen',
		fontSize: 30,
		lineSpacing: 1.53,
	},
	{
		...BasePoemStyle,
		name: 'Console',
		fontName: 'f25_bank_printer',
		fontSize: 18,
		color: 'white',
		lineSpacing: 1.1,
	},
];
