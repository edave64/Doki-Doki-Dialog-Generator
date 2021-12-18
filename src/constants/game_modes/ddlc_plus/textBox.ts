import { ITextStyle } from '@/renderer/textRenderer/textRenderer';
import { screenWidth } from '@/constants/game_modes/ddlc_plus/base';
import { nameboxStrokeDefaultColor } from './textBoxCustom';

// tslint:disable: no-magic-numbers
export const TextBoxWidth = 1220;
export const TextBoxCorruptedWidth = 900;
export const TextBoxHeight = 219;
export const TextBoxKerning = 0;
export const TextBoxLineHeight = 29;
export const TextBoxCorruptedKerning = 8;
export const TextBoxTextXOffset = 57;
export const TextBoxTextYOffset = 68;
export const TextBoxBottomSpacing = 54;

export const TextBoxTextCorruptedXOffset = 9;
export const TextBoxTextCorruptedYOffset = 9;

export const NameboxHeight = 59;
export const NameboxWidth = 252;
export const NameboxXOffset = 49;
export const NameboxTextYOffset = 43;

export const ControlsYBottomOffset = 12 * 1.5;
export const ControlsXHistoryOffset = -126 * 1.5;
export const ControlsXSkipOffset = -72 * 1.5;
export const ControlsXStuffOffset = -38 * 1.5;

export const ArrowXRightOffset = 30.75 * 1.5;
export const ArrowYBottomOffset = 26 * 1.5;

export const GlowRX = 426 * 1.5;
export const GlowRY = 58 * 1.5;

export const BaseTextStyle: ITextStyle = {
	alpha: 1,
	color: 'black',
	fontName: 'aller',
	fontSize: 24,
	isBold: false,
	isItalic: false,
	isStrikethrough: false,
	isUnderlined: false,
	letterSpacing: 1,
	lineSpacing: 1.2,
	strokeColor: '',
	strokeWidth: 0,
};

export const NameboxTextStyle: ITextStyle = {
	...BaseTextStyle,
	fontName: 'riffic',
	fontSize: 36,
	strokeColor: nameboxStrokeDefaultColor,
	strokeWidth: 9,
	color: 'white',
	letterSpacing: 2,
};

export const ControlsTextStyle = {
	align: 'left' as CanvasTextAlign,
	font: '24px aller',
	fill: {
		style: '#522',
	},
};

export const ControlsTextDisabledStyle = {
	...ControlsTextStyle,
	fill: {
		style: '#a66',
	},
};

export const TextBoxStyle = {
	alpha: 1,
	color: '#ffffff',
	fontName: 'aller',
	fontSize: 30,
	isBold: false,
	isItalic: false,
	isStrikethrough: false,
	isUnderlined: false,
	letterSpacing: 0,
	strokeColor: '#523140',
	strokeWidth: 5,
	lineSpacing: 1.2,
};

export const TextBoxCorruptedStyle = {
	align: 'left' as CanvasTextAlign,
	font: '24px verily',
	outline: {
		style: '#000',
		width: 20,
	},
	fill: {
		style: '#fff',
	},
};

export const TextBoxX = screenWidth / 2 - TextBoxWidth / 2; // 232
export const TextBoxCorruptedX = screenWidth / 2 - TextBoxCorruptedWidth / 2;
export const TextBoxTextX = TextBoxX + TextBoxTextXOffset;

export const NameboxX = TextBoxX + NameboxXOffset;
export const NameboxTextX = NameboxX + NameboxWidth / 2;

export const ControlsXHistory = TextBoxX + ControlsXHistoryOffset;
export const ControlsXSkip = TextBoxX + ControlsXSkipOffset;
export const ControlsXStuff = TextBoxX + ControlsXStuffOffset;

export const DefaultTextboxStyle = 'custom_plus';
