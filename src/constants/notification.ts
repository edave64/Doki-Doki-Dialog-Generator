import { ITextStyle } from '@/renderer/textRenderer/textRenderer';
import { BaseTextStyle } from './textBox';

// tslint:disable: no-magic-numbers
export const NotificationBackgroundColor = '#ffe6f4';
export const NotificationBorderColor = '#ffbde1';
export const NotificationBackdropColor = 'rgba(255,255,255,0.6)';
// export const NotificationMaxWidth = 744;
export const NotificationPadding = 40;
export const NotificationSpacing = 30;

export const NotificationOkTextStyle: ITextStyle = {
	...BaseTextStyle,
	fontName: 'riffic',
	fontSize: 24,
	strokeColor: '#bb5599',
	strokeWidth: 8,
	letterSpacing: 1,
	color: 'white',
};

export const NotificationTextStyle: ITextStyle = {
	alpha: 1,
	color: 'black',
	fontName: 'aller',
	fontSize: 24,
	isBold: false,
	isItalic: false,
	isStrikethrough: false,
	isUnderlined: false,
	letterSpacing: 0,
	lineSpacing: 1.2,
	strokeColor: '',
	strokeWidth: 0,
};
