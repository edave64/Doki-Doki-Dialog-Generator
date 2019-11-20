import { RenderContext } from '../renderer/rendererContext';
import { getAsset } from '../asset-manager';

const ScreenWidth = 1280;

const TextBoxWidth = 816;
const TextBoxCorruptedWidth = 900;
const TextBoxY = 568;
const TextBoxKerning = 0;
const TextBoxLineHeight = 29;
const TextBoxCorruptedKerning = 8;
const TextBoxTextXOffset = 38;
const TextBoxTextYOffset = 50;

const TextBoxTextCorruptedXOffset = 9;
const TextBoxTextCorruptedYOffset = 9;

const NameboxHeight = 39;
const NameboxWidth = 168;
const NameboxXOffset = 34;
const NameboxTextYOffset = 29;

const ControlsYOffset = 134;
const ControlsXHistoryOffset = 282;
const ControlsXSkipOffset = 336;
const ControlsXStuffOffset = 370;

const ArrowX = 1017.25;
const ArrowY = 688;

const NameboxTextStyle = {
	align: 'center' as CanvasTextAlign,
	font: '24px riffic',
	outline: {
		style: '#b59',
		width: 6,
	},
	fill: {
		style: 'white',
	},
};

const ControlsTextStyle = {
	align: 'left' as CanvasTextAlign,
	font: '13px aller',
	fill: {
		style: '#522',
	},
};

const ControlsTextDisabledStyle = {
	...ControlsTextStyle,
	fill: {
		style: '#a66',
	},
};

const TextBoxStyle = {
	align: 'left' as CanvasTextAlign,
	font: '24px aller',
	outline: {
		style: '#523140',
		width: 4,
	},
	fill: {
		style: '#fff',
	},
};

const TextBoxCorruptedStyle = {
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

const TextBoxX = ScreenWidth / 2 - TextBoxWidth / 2; // 232
const TextBoxCorruptedX = ScreenWidth / 2 - TextBoxCorruptedWidth / 2;
const TextBoxTextX = TextBoxX + TextBoxTextXOffset;
const TextBoxTextY = TextBoxY + TextBoxTextYOffset;

const NameboxY = TextBoxY - NameboxHeight;
const NameboxX = TextBoxX + NameboxXOffset;
const NameboxTextX = NameboxX + NameboxWidth / 2;
const NameboxTextY = NameboxY + NameboxTextYOffset;

const ControlsY = TextBoxY + ControlsYOffset;
const ControlsXHistory = TextBoxX + ControlsXHistoryOffset;
const ControlsXSkip = TextBoxX + ControlsXSkipOffset;
const ControlsXStuff = TextBoxX + ControlsXStuffOffset;

export class Textbox {
	public display: boolean = true;
	public corrupted: boolean = false;
	public showControls: boolean = true;
	public allowSkipping: boolean = true;
	public showContinueArrow: boolean = true;
	public autoQuote: boolean = true;
	public talking: string = '';
	public customName: string = '';
	public dialog: string = '';

	public async render(rx: RenderContext) {
		if (!this.display) return;

		if (this.corrupted) {
			rx.drawImage({
				image: await getAsset('textbox_monika'),
				x: TextBoxCorruptedX,
				y: TextBoxY,
			});
		} else {
			rx.drawImage({
				image: await getAsset('textbox'),
				x: TextBoxX,
				y: TextBoxY,
			});
		}

		const name = this.talking;
		if (name) {
			rx.drawImage({
				image: await getAsset('namebox'),
				x: NameboxX,
				y: NameboxY,
			});
			rx.drawText({
				x: NameboxTextX,
				y: NameboxTextY,
				text: name === 'other' ? this.customName : name,
				...NameboxTextStyle,
			});
		}

		this.renderText(rx);

		if (this.showControls) {
			rx.drawText({
				text: 'History',
				x: ControlsXHistory,
				y: ControlsY,
				...ControlsTextStyle,
			});
			rx.drawText({
				text: 'Skip',
				x: ControlsXSkip,
				y: ControlsY,
				...(this.allowSkipping ? ControlsTextStyle : ControlsTextDisabledStyle),
			});
			rx.drawText({
				text: 'Auto   Save   Load   Settings',
				x: ControlsXStuff,
				y: ControlsY,
				...ControlsTextStyle,
			});
		}

		if (this.showContinueArrow) {
			rx.drawImage({ image: await getAsset('next'), x: ArrowX, y: ArrowY });
		}
	}

	private renderText(rx: RenderContext): void {
		const text: DialogLetter[][] = [];

		let b = false;

		let dialog = this.dialog;

		if (this.autoQuote && this.talking) {
			dialog = `"${dialog}"`;
		}

		for (const line of dialog.split('\n')) {
			let cl;
			text.push((cl = []));
			for (const l of line) {
				if (l === '[') {
					b = true;
				} else if (l === ']') {
					b = false;
				} else {
					cl.push({ l, b });
				}
			}
		}

		let y = TextBoxTextY;

		if (text[0] && text[0][0] && text[0][0].b) {
			y += TextBoxTextCorruptedYOffset;
		}

		for (const line of text) {
			let x = TextBoxTextX;

			if (line[0] && line[0].b) {
				x += TextBoxTextCorruptedXOffset;
			}
			for (const letter of line) {
				const ct = letter.l;
				const cb = letter.b;

				rx.drawText({
					text: ct,
					x,
					y,
					...(cb ? TextBoxCorruptedStyle : TextBoxStyle),
				});
				x += rx.measureText({
					text: ct,
					...(cb ? TextBoxCorruptedStyle : TextBoxStyle),
				}).width;
				x += cb ? TextBoxCorruptedKerning : TextBoxKerning;
			}
			y += TextBoxLineHeight;
		}
	}
}

interface DialogLetter {
	l: string;
	b: boolean;
}
