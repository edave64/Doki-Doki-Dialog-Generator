import { ICommandToken, Token, tokenize } from './tokenizer';

import textCommands from './textCommands';
import { UnreachableCaseError } from 'ts-essentials';

export interface ITextStyle {
	fontName: string;
	fontSize: number;
	isBold: boolean;
	isUnderlined: boolean;
	isStrikethrough: boolean;
	isItalic: boolean;
	color: string;
	strokeWidth: number;
	strokeColor: string;
	letterSpacing: number;
	lineSpacing: number;
	alpha: number;
}

interface ITextRenderItem {
	x: number;
	y: number;
	height: number;
	width: number;
}

interface IDrawCharacterItem extends ITextRenderItem {
	type: 'character';
	character: string;
	style: ITextStyle;
}

interface INewlineItem extends ITextRenderItem {
	type: 'newline';
}

type RenderItem = IDrawCharacterItem | INewlineItem;

// const widthCache = new Map<ITextStyle, Map<string, number>>();
// const heightCache = new Map<ITextStyle, number>();

export class TextRenderer {
	public static textCommands = textCommands;
	private renderParts!: RenderItem[];
	private readonly tokens: Token[];

	public constructor(
		private str: string,
		private readonly baseStyle: ITextStyle
	) {
		this.tokens = tokenize(str);
		this.rebuildParts();
	}

	public rebuildParts() {
		this.renderParts = TextRenderer.getRenderParts(this.tokens, this.baseStyle);
	}

	public async loadFonts() {
		if (!('fonts' in document)) return;
		const fonts = new Set<string>();
		let currentStyle: ITextStyle | null = null;
		for (const part of this.renderParts) {
			if (!('style' in part)) continue;
			if (part.style !== currentStyle) {
				currentStyle = part.style;
				if (currentStyle.fontName) {
					fonts.add(currentStyle.fontName);
				}
			}
		}

		let neededToLoad = false;
		for (const font of fonts) {
			const doc = document as any;
			const fontString = `8px ${font}`;
			if (!doc.fonts.check(fontString)) {
				neededToLoad = true;
				await doc.fonts.load(fontString);
			}
		}

		if (neededToLoad) {
			const tokens = tokenize(this.str);
			this.renderParts = TextRenderer.getRenderParts(tokens, this.baseStyle);
		}
	}

	public render(ctx: CanvasRenderingContext2D): void {
		ctx.save();
		let currentStyle: ITextStyle | null = null;
		for (const part of this.renderParts) {
			if (part.type === 'newline') continue;
			if (part.style !== currentStyle) {
				currentStyle = part.style;
				applyTextStyleToCanvas(currentStyle, ctx);
			}
			if (currentStyle.strokeWidth > 0 && currentStyle.strokeColor > '') {
				ctx.strokeText(part.character, part.x, part.y);
			}
		}
		for (const part of this.renderParts) {
			if (part.type === 'newline') continue;
			if (part.style !== currentStyle) {
				currentStyle = part.style;
				applyTextStyleToCanvas(currentStyle, ctx);
			}
			ctx.fillText(part.character, part.x, part.y);
		}
		ctx.restore();
	}

	public quote() {
		enum State {
			None,
			ExplictQuote,
			ImplictQuote,
			Star,
		}

		let lastChar = -1;
		let state = State.None;

		for (let i = 0; i < this.renderParts.length; ++i) {
			const part = this.renderParts[i];
			if (part.type !== 'character') continue;
			switch (state) {
				case State.None:
					if (part.character.match(/\s/)) continue;
					if (part.character === '"') {
						state = State.ExplictQuote;
						lastChar = i;
					} else if (part.character === '*') {
						state = State.Star;
						lastChar = i;
					} else {
						this.renderParts.splice(i, 0, {
							type: 'character',
							x: 0,
							y: 0,
							style: part.style,
							character: '"',
							height: part.height,
							width: measureWidth(part.style, '"'),
						});
						i++;
						lastChar = i;
						state = State.ImplictQuote;
					}
					break;
				case State.ExplictQuote:
					lastChar = i;
					if (part.character === '"') {
						state = State.None;
					}
					break;
				case State.ImplictQuote:
					if (part.character.match(/\s/)) continue;
					if (part.character === '*') {
						this.renderParts.splice(lastChar + 1, 0, {
							type: 'character',
							x: 0,
							y: 0,
							style: part.style,
							character: '"',
							height: part.height,
							width: measureWidth(part.style, '"'),
						});
						state = State.Star;
						i++;
					}
					lastChar = i;
					break;
				case State.Star:
					if (part.character === '*') {
						state = State.None;
					}
					lastChar = i;
					break;
				default:
					throw new UnreachableCaseError(state);
			}
		}

		const lastPart = this.renderParts[lastChar] as IDrawCharacterItem;
		if (lastPart && state === State.Star) {
			this.renderParts.splice(lastChar + 1, 0, {
				type: 'character',
				x: 0,
				y: 0,
				style: lastPart.style,
				character: '*',
				height: lastPart.height,
				width: measureWidth(lastPart.style, '"'),
			});
		}
		if (
			lastPart &&
			(state === State.ExplictQuote || state === State.ImplictQuote)
		) {
			this.renderParts.splice(lastChar + 1, 0, {
				type: 'character',
				x: 0,
				y: 0,
				style: lastPart.style,
				character: '"',
				height: lastPart.height,
				width: measureWidth(lastPart.style, '"'),
			});
		}
	}

	public fixAlignment(
		alignment: 'left' | 'center' | 'right',
		xStart: number,
		xEnd: number,
		yStart: number,
		maxLineWidth: number
	) {
		let lineWidth = 0;
		let currentLine: RenderItem[] = [];

		function fixLine() {
			let x = xStart;
			if (alignment === 'center') {
				x = xStart + (xEnd - xStart) / 2 - lineWidth / 2;
			} else if (alignment === 'right') {
				x = xEnd - lineWidth;
			}
			for (const item of currentLine) {
				item.x = x;
				x += item.width;
			}
		}
		let renderParts = this.renderParts;

		if (maxLineWidth > 0) {
			renderParts = TextRenderer.applyLineWrapping(
				this.renderParts.slice(0),
				maxLineWidth
			);
		}

		let y = yStart;
		const lineHeights = [];
		let lineHeight = 0;

		for (const item of renderParts) {
			lineHeight = Math.max(lineHeight, item.height);

			if (item.type === 'newline') {
				lineHeights.push(lineHeight);
				lineHeight = 0;
			}
		}
		lineHeights.push(lineHeight);

		let line = 0;

		for (const item of renderParts) {
			lineHeight = Math.max(lineHeight, item.height);
			item.y = y;
			currentLine.push(item);
			lineWidth += item.width;

			if (item.type === 'newline') {
				fixLine();
				y += lineHeights[++line] || 0;
				lineWidth = 0;
				lineHeight = 0;
				currentLine = [];
			} else if (item.type === 'character') {
				const lastItem = currentLine[currentLine.length - 1];
				if (lastItem.type === 'character') {
					lineWidth += lastItem.style.letterSpacing;
					lastItem.width += lastItem.style.letterSpacing;
				}
			}
		}
		fixLine();
	}

	public getHeight(maxLineWidth: number) {
		let lineHeight = 0;
		let height = 0;
		const renderParts =
			maxLineWidth === 0
				? this.renderParts
				: TextRenderer.applyLineWrapping(
						this.renderParts.slice(0),
						maxLineWidth
				  );

		for (const item of renderParts) {
			lineHeight = Math.max(lineHeight, item.height);

			if (item.type === 'newline') {
				height += lineHeight;
				lineHeight = 0;
			}
		}
		height += lineHeight;

		return height;
	}

	public getWidth() {
		let lineWidth = 0;
		let maxLineWidth = 0;
		let lastItemInLine: RenderItem | null = null;

		for (const item of this.renderParts) {
			lineWidth += item.width;

			if (item.type === 'newline') {
				maxLineWidth = Math.max(maxLineWidth, lineWidth);
				lineWidth = 0;
				lastItemInLine = null;
			} else if (item.type === 'character') {
				if (lastItemInLine && lastItemInLine.type === 'character') {
					lineWidth += lastItemInLine.style.letterSpacing;
				}
				lastItemInLine = item;
			}
		}
		maxLineWidth = Math.max(maxLineWidth, lineWidth);
		return maxLineWidth;
	}

	private static getRenderParts(
		tokens: Token[],
		baseStyle: ITextStyle
	): RenderItem[] {
		const renderParts: RenderItem[] = [];
		const styleStack: ITextStyle[] = [];
		const tagStack: Array<ICommandToken | null> = [];
		let currentStyleHeight: number = measureHeight(baseStyle);
		let currentStyle = baseStyle;
		let currentTag: ICommandToken | null = null;
		for (const token of tokens) {
			const type = token.type;
			switch (type) {
				case 'command':
					if (TextRenderer.textCommands.has(token.commandName)) {
						styleStack.push(currentStyle);
						tagStack.push(currentTag);
						currentStyle = TextRenderer.textCommands.get(token.commandName)!(
							currentStyle,
							token.argument
						);
						currentStyleHeight = measureHeight(currentStyle);
						currentTag = token;
					} else {
						throw new Error(
							`There is no text command called '${token.commandName}' at position ${token.pos}.`
						);
					}
					break;
				case 'commandClose':
					if (!currentTag) {
						throw new Error(
							`Unmatched closing command at position ${token.pos}. Closed '${token.commandName}', but no commands are currently open.`
						);
					}
					if (token.commandName !== currentTag.commandName) {
						throw new Error(
							`Unmatched closing command at position ${token.pos}. Closed '${token.commandName}', expected to close '${currentTag}' first. (Opened at position ${currentTag.pos})`
						);
					}
					currentTag = tagStack.pop()!;
					currentStyle = styleStack.pop()!;
					break;
				case 'newline':
					renderParts.push({
						height: currentStyleHeight,
						width: 0,
						x: 0,
						y: 0,
						type: 'newline',
					});
					break;
				case 'text':
					for (const character of token.content) {
						renderParts.push({
							type: 'character',
							character,
							height: currentStyleHeight,
							width: measureWidth(currentStyle, character),
							style: currentStyle,
							x: 0,
							y: 0,
						});
					}
					break;
				default:
					throw new UnreachableCaseError(type);
			}
		}
		return renderParts;
	}

	private static applyLineWrapping(
		parts: RenderItem[],
		maxLineWidth: number
	): RenderItem[] {
		let lastBreakPoint = -1;
		let currentLineWidth = 0;
		let lastBreakLineWidth = 0;
		const newParts: RenderItem[] = [];

		for (const item of parts) {
			if (item.type === 'newline') {
				lastBreakPoint = -1;
				currentLineWidth = 0;
				lastBreakLineWidth = 0;
				newParts.push(item);
			} else if (item.type === 'character') {
				if (item.character === ' ') {
					if (currentLineWidth > maxLineWidth) {
						lastBreakPoint = -1;
						currentLineWidth = 0;
						lastBreakLineWidth = 0;
						newParts.push({
							type: 'newline',
							height: item.height,
							width: 0,
							x: 0,
							y: 0,
						});
					} else {
						currentLineWidth += item.width;
						lastBreakLineWidth = currentLineWidth;
						lastBreakPoint = newParts.length;
						newParts.push(item);
					}
				} else {
					currentLineWidth += item.width;

					if (currentLineWidth > maxLineWidth && lastBreakPoint !== -1) {
						currentLineWidth -= lastBreakLineWidth;
						newParts.splice(lastBreakPoint, 1, {
							type: 'newline',
							height: item.height,
							width: 0,
							x: 0,
							y: 0,
						});
						lastBreakPoint = -1;
						lastBreakLineWidth = 0;
						newParts.push(item);
					} else {
						newParts.push(item);
					}
				}
			} else {
				throw new UnreachableCaseError(item);
			}
		}

		return newParts;
	}
}

const tmpContext = document.createElement('canvas').getContext('2d')!;
let lastStyle: ITextStyle | null = null;

function measureWidth(textStyle: ITextStyle, character: string): number {
	if (textStyle !== lastStyle) {
		applyTextStyleToCanvas(textStyle, tmpContext);
		lastStyle = textStyle;
	}
	return tmpContext.measureText(character).width;
}

const heightCache = new Map<string, number>();

function measureHeight(textStyle: ITextStyle): number {
	const font = textStyle.fontSize + ' ' + textStyle.fontName;
	if (heightCache.has(font)) {
		return heightCache.get(font)! * textStyle.lineSpacing;
	}

	const text = document.createElement('span');
	text.innerHTML = 'Hg';
	text.style.fontFamily = textStyle.fontName;
	text.style.fontSize = `${textStyle.fontSize}px`;
	text.style.lineHeight = '1';

	const div = document.createElement('div');
	div.style.opacity = '0';
	div.style.fontFamily = textStyle.fontName;
	div.style.fontSize = `${textStyle.fontSize}px`;
	div.style.lineHeight = '1';
	div.style.position = 'absolute';
	div.style.top = '0';
	div.style.left = '0';
	div.appendChild(text);

	document.body.appendChild(div);

	try {
		const height = div.offsetHeight;
		heightCache.set(font, height);
		return height * textStyle.lineSpacing;
	} finally {
		div.remove();
	}
}

function applyTextStyleToCanvas(
	style: ITextStyle,
	ctx: CanvasRenderingContext2D
) {
	ctx.textAlign = 'left';
	ctx.font =
		(style.isItalic ? 'italic ' : '') +
		(style.isBold ? 'bold ' : '') +
		style.fontSize +
		'px ' +
		style.fontName;
	ctx.lineJoin = 'round';

	if (style.strokeWidth > 0 && style.strokeColor > '') {
		ctx.strokeStyle = style.strokeColor;
		ctx.lineWidth = style.strokeWidth;
	} else {
		ctx.strokeStyle = '';
		ctx.lineWidth = 0;
	}

	ctx.globalAlpha = style.alpha || 0;
	ctx.fillStyle = style.color;
}
