import { RenderContext } from '../renderer/rendererContext';
import { getAsset } from '../asset-manager';
import { ITextBox } from '@/store/objectTypes/textbox';
import { IRenderable } from './renderable';
import {
	TextBoxCorruptedX,
	TextBoxY,
	TextBoxX,
	NameboxX,
	NameboxY,
	NameboxTextX,
	NameboxTextY,
	NameboxTextStyle,
	ControlsXHistory,
	ControlsY,
	ControlsTextStyle,
	ControlsXSkip,
	ControlsXStuff,
	ControlsTextDisabledStyle,
	TextBoxTextY,
	TextBoxTextCorruptedYOffset,
	TextBoxTextX,
	TextBoxTextCorruptedXOffset,
	TextBoxCorruptedStyle,
	TextBoxStyle,
	TextBoxCorruptedKerning,
	TextBoxKerning,
	TextBoxLineHeight,
	TextBoxWidth,
	NameboxHeight,
	TextBoxHeight,
	TextBoxCorruptedWidth,
	NameboxXOffset,
	NameboxWidth,
	NameboxTextYOffset,
	ControlsYOffset,
	ControlsXHistoryOffset,
	ControlsXSkipOffset,
	ControlsXStuffOffset,
	ArrowXRightOffset,
	ArrowYBottomOffset,
	TextBoxTextYOffset,
	TextBoxTextXOffset,
} from './textBoxConstants';
import { Renderer } from '@/renderer/renderer';

export class TextBox implements IRenderable {
	public display: boolean = true;
	private lastVersion = -1;
	private lastX = 0;
	private lastY = 0;
	private localRenderer = new Renderer(1280, 720);

	public get id() {
		return this.obj.id;
	}

	public hitTest(hx: number, hy: number): boolean {
		const w2 = TextBoxWidth / 2;
		const x1 = this.obj.x - w2;
		const x2 = x1 + TextBoxWidth;
		const y1 = this.obj.y;
		const y2 = y1 + NameboxHeight + TextBoxHeight;
		return x1 <= hx && x2 >= hx && y1 <= hy && y2 >= hy;
	}

	public constructor(public obj: ITextBox) {}

	public async render(selected: boolean, rx: RenderContext) {
		if (
			this.lastVersion !== this.obj.version ||
			this.lastX !== this.obj.x ||
			this.lastY !== this.obj.y
		) {
			await this.updateLocalCanvas();
			this.lastVersion = this.obj.version;
			this.lastX = this.obj.x;
			this.lastY = this.obj.y;
		}

		rx.drawImage({
			image: this.localRenderer,
			x: 0,
			y: 0,
			flip: this.obj.flip,
			shadow: selected && rx.preview ? { blur: 20, color: 'red' } : undefined,
			opacity: this.obj.opacity,
		});
	}

	public async updateLocalCanvas() {
		await this.localRenderer.render(async rx => {
			const w =
				this.obj.style === 'corrupt' ? TextBoxCorruptedWidth : TextBoxWidth;
			const w2 = w / 2;
			const x = this.obj.x - w2;
			const y = this.obj.y;

			if (this.obj.style === 'corrupt') {
				rx.drawImage({
					image: await getAsset('textbox_monika'),
					x,
					y: y + NameboxHeight,
				});
			} else {
				rx.drawImage({
					image: await getAsset('textbox'),
					x,
					y: y + NameboxHeight,
				});
			}

			const name = this.obj.talking;
			if (name) {
				rx.drawImage({
					image: await getAsset('namebox'),
					x: x + NameboxXOffset,
					y,
				});
				rx.drawText({
					x: x + NameboxXOffset + NameboxWidth / 2,
					y: y + NameboxTextYOffset,
					text: name,
					...NameboxTextStyle,
				});
			}

			this.renderText(rx, x, y);

			const controlsY = y + NameboxHeight + ControlsYOffset;

			if (this.obj.controls) {
				rx.drawText({
					text: 'History',
					x: x + ControlsXHistoryOffset,
					y: controlsY,
					...ControlsTextStyle,
				});
				rx.drawText({
					text: 'Skip',
					x: x + ControlsXSkipOffset,
					y: controlsY,
					...(this.obj.skip ? ControlsTextStyle : ControlsTextDisabledStyle),
				});
				rx.drawText({
					text: 'Auto   Save   Load   Settings',
					x: x + ControlsXStuffOffset,
					y: controlsY,
					...ControlsTextStyle,
				});
			}

			if (this.obj.continue) {
				const arrowX = x + TextBoxWidth - ArrowXRightOffset;
				const arrowY = y + NameboxHeight + TextBoxHeight - ArrowYBottomOffset;
				rx.drawImage({
					image: await getAsset('next'),
					x: arrowX,
					y: arrowY,
				});
			}
		});
	}

	private renderText(rx: RenderContext, baseX: number, baseY: number): void {
		const text: DialogLetter[][] = [];

		let b = false;

		for (const line of this.obj.text.split('\n')) {
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

		const startX = baseX + TextBoxTextXOffset;
		let y = baseY + NameboxHeight + TextBoxTextYOffset;

		if (text[0] && text[0][0] && text[0][0].b) {
			y += TextBoxTextCorruptedYOffset;
		}

		for (const line of text) {
			let x = startX;

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
