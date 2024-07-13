import type { ITextStyle } from '@/renderer/text-renderer/text-renderer';
import type { ITextboxRenderer } from '../textbox';

export class TextboxStylePack implements ITextboxRenderer {
	get height(): number {
		return 0;
	}
	get width(): number {
		return 0;
	}
	get nameboxWidth(): number {
		return 0;
	}
	get nameboxHeight(): number {
		return 0;
	}
	get nameboxOffsetX(): number {
		return 0;
	}
	get nameboxOffsetY(): number {
		return 0;
	}
	get nameboxStyle(): ITextStyle {
		return {
			alpha: 0,
			color: '#000',
			fontName: 'Arial',
			fontSize: 0,
			isBold: false,
			isItalic: false,
			isStrikethrough: false,
			isUnderlined: false,
			letterSpacing: 0,
			lineSpacing: 0,
			strokeColor: '#fff',
			strokeWidth: 0,
		};
	}
	get textOffsetX(): number {
		return 0;
	}
	get textOffsetY(): number {
		return 0;
	}
	get textboxStyle(): ITextStyle {
		return {
			alpha: 0,
			color: '#000',
			fontName: 'Arial',
			fontSize: 0,
			isBold: false,
			isItalic: false,
			isStrikethrough: false,
			isUnderlined: false,
			letterSpacing: 0,
			lineSpacing: 0,
			strokeColor: '#fff',
			strokeWidth: 0,
		};
	}
	get allowSkippingLocal(): boolean {
		return false;
	}

	prepare(): void | Promise<any> {
		throw new Error('Method not implemented.');
	}

	render(rx: CanvasRenderingContext2D): void {
		throw new Error('Method not implemented.');
	}
}
