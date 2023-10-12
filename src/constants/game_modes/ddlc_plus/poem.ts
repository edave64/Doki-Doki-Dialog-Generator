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
export const poemTopPadding = 26;
export const poemBottomPadding = 150;
export const poemPadding = 61;
export const defaultPoemWidth = 1200;
export const defaultPoemHeight = 1080;
export const backgroundScale = sdCharacterScaleFactor;

//#region Console style
export const consoleBackgroundColor = '#333333bf';
export const consoleWidth = 720;
export const consoleHeight = 270;
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
	fontSize: 18,
};

export interface IPoemTextStyle extends ITextStyle {
	name: string;
}

export const poemTextStyles: IPoemTextStyle[] = [
	{
		...BasePoemStyle,
		name: 'Sayori',
		fontName: 'hashtag',
		fontSize: 45,
		lineSpacing: 0.95,
		letterSpacing: 1,
	},
	{
		...BasePoemStyle,
		name: 'Natsuki',
		fontName: 'ammy_handwriting',
		fontSize: 41,
		letterSpacing: -0.5,
	},
	{
		...BasePoemStyle,
		name: 'Monika',
		fontName: 'journal',
		fontSize: 36,
		lineSpacing: 1.4,
		letterSpacing: 0.5,
	},
	{
		...BasePoemStyle,
		name: 'Yuri',
		fontName: 'jp_hand_slanted',
		lineSpacing: 1.55,
		fontSize: 48,
	},
	{
		...BasePoemStyle,
		name: 'Yuri Act 2',
		fontName: 'damagrafik_script',
		fontSize: 27,
		letterSpacing: -12,
		// justify: true,
	},
	{
		...BasePoemStyle,
		name: 'Yuri Unused',
		fontName: 'as_i_lay_dying',
		fontSize: 60,
	},
	{
		...BasePoemStyle,
		name: 'MC',
		fontName: 'halogen',
		fontSize: 45,
		lineSpacing: 1.53,
	},
	{
		...BasePoemStyle,
		name: 'Console',
		fontName: 'f25_bank_printer',
		fontSize: 27,
		color: 'white',
		lineSpacing: 1.1,
	},
];
