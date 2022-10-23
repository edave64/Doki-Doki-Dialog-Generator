import environment from '@/environments/environment';
import { ITextStyle } from '@/renderer/textRenderer/textRenderer';
import { ITextBox } from '@/store/objectTypes/textbox';
import { HSLAColor } from '@/util/colors/hsl';
import Ddlc from './game_modes/ddlc';
import { IPoemTextStyle } from './game_modes/ddlc/poem';
import DdlcPlus from './game_modes/ddlc_plus';

export default function getConstants() {
	if (environment.gameMode === 'ddlc_plus') return DdlcPlus;
	return Ddlc;
}

export interface IConstants {
	readonly Base: {
		readonly screenWidth: number;
		readonly screenHeight: number;
		readonly sdCharacterScaleFactor: number;
		readonly hdCharacterScaleFactor: number;
		readonly positions: string[];
		readonly characterPositions: number[];
	};
	readonly Choices: {
		readonly nameboxTextOutlineDelta: HSLAColor;
		readonly ChoiceButtonColor: string;
		readonly ChoiceButtonBorderColor: string;
		readonly ChoiceButtonWidth: number;
		readonly ChoiceSpacing: number;
		readonly ChoiceX: number;
		readonly ChoiceYOffset: number;
		readonly ChoicePadding: number;
		readonly ChoiceY: number;
		readonly ChoiceTextStyle: ITextStyle;
		readonly Outline: number;
	};
	readonly Notification: {
		readonly NotificationBackgroundColor: string;
		readonly NotificationBorderColor: string;
		readonly NotificationBackdropColor: string;
		readonly NotificationPadding: number;
		readonly NotificationSpacing: number;
		readonly NotificationOkTextStyle: ITextStyle;
		readonly NotificationTextStyle: ITextStyle;
	};
	readonly Poem: {
		readonly poemBackgrounds: { name: string; file: string }[];
		readonly defaultPoemBackground: number;
		readonly defaultPoemStyle: number;
		readonly defaultX: number;
		readonly defaultY: number;
		readonly poemTopPadding: number;
		readonly poemBottomPadding: number;
		readonly poemPadding: number;
		readonly defaultPoemWidth: number;
		readonly defaultPoemHeight: number;

		//#region Console style
		readonly consoleBackgroundColor: string;
		readonly consoleWidth: number;
		readonly consoleHeight: number;
		readonly defaultConsoleBackground: number;
		readonly defaultConsoleStyle: number;
		//#endregion Console style

		readonly poemTextStyles: IPoemTextStyle[];
	};
	readonly TextBox: {
		readonly DefaultTextboxStyle: ITextBox['style'];
	};
	readonly TextBoxCustom: {};
}
