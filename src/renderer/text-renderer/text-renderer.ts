import environment from '@/environments/environment';
import { type ICommandToken, type Token, tokenize } from './tokenizer';

import { makeCanvas } from '@/util/canvas';
import { UnreachableCaseError } from 'ts-essentials';
import textCommands from './text-commands';

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

interface IAlignmentItem extends ITextRenderItem {
	type: 'alignment';
	alignment: 'left' | 'center' | 'right';
}

type RenderItem = IDrawCharacterItem | INewlineItem | IAlignmentItem;

// const widthCache = new Map<ITextStyle, Map<string, number>>();
// const heightCache = new Map<ITextStyle, number>();

export class TextRenderer {
	private renderParts!: RenderItem[];
	private readonly tokens: Token[];
	private readonly loose: boolean;

	public constructor(
		private str: string,
		private readonly baseStyle: ITextStyle
	) {
		this.loose = environment.state.looseTextParsing;
		try {
			this.tokens = tokenize(str, this.loose);
		} catch (e) {
			if (e instanceof Error) {
				this.tokens = [
					{
						type: 'text',
						pos: 0,
						content: e.message,
					},
				];
			} else {
				throw e;
			}
		}
		this.rebuildParts();
	}

	public rebuildParts() {
		this.renderParts = TextRenderer.getRenderParts(
			this.tokens,
			this.baseStyle,
			this.loose
		);
	}

	public loadFonts(): void | Promise<void> {
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

		const promises: Promise<FontFace[]>[] = [];
		for (const font of fonts) {
			const doc = document;
			const fontString = `8px '${font.replaceAll("'", "\\'")}'`;
			if (!doc.fonts.check(fontString)) {
				promises.push(doc.fonts.load(fontString));
			}
		}

		if (promises.length === 0) return;
		return Promise.all(promises).then(() => {
			const tokens = tokenize(this.str);
			this.renderParts = TextRenderer.getRenderParts(
				tokens,
				this.baseStyle,
				this.loose
			);
		});
	}

	public render(ctx: CanvasRenderingContext2D): void {
		ctx.save();
		let currentStyle: ITextStyle | null = null;
		for (const part of this.renderParts) {
			if (part.type !== 'character') continue;
			if (part.style !== currentStyle) {
				currentStyle = part.style;
				applyTextStyleToCanvas(currentStyle, ctx);
			}
			if (currentStyle.strokeWidth > 0 && currentStyle.strokeColor > '') {
				ctx.strokeText(part.character, part.x, part.y);
			}
		}
		for (const part of this.renderParts) {
			if (part.type !== 'character') continue;
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

		const lastPart = this.renderParts[lastChar] as
			| IDrawCharacterItem
			| undefined;
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
	private lastLayoutHeight: number | null = null;
	private lastLayoutWidth: number | null = null;

	public applyLayout(
		defaultAlignment: 'left' | 'center' | 'right',
		xStart: number,
		yStart: number,
		w: number,
		automaticLineBreak: boolean
	) {
		// Sorry for the long function, layouting is complicated.
		const renderParts = this.renderParts;

		// build layout groups
		// Joins blocks of text on the same line with the same alignment.
		// Also includes the automatic line break logic.
		const layoutParts: LayoutPart[] = [];
		let currentLayoutGroup: LayoutGroup = null!;
		let remainingLineWidth: number = 0;
		let breakablePosition: number = 0;

		const startNewLayoutGroup = (): void => {
			currentLayoutGroup = {
				type: 'group',
				renderParts: [],
				height: 0,
				width: 0,
			};
			remainingLineWidth = w;
			breakablePosition = -1;
			layoutParts.push(currentLayoutGroup);
		};
		startNewLayoutGroup();

		for (const item of renderParts) {
			if (item.type === 'newline' || item.type === 'alignment') {
				layoutParts.push(item);
				if (item.type === 'alignment' && automaticLineBreak) {
					const lineWidth = remainingLineWidth;
					startNewLayoutGroup();
					remainingLineWidth = lineWidth;
				} else {
					startNewLayoutGroup();
				}
			} else {
				if (remainingLineWidth < item.width && automaticLineBreak) {
					const newLine: INewlineItem = {
						type: 'newline',
						height: item.height,
						width: item.height,
						x: 0,
						y: 0,
					};
					if (item.character === ' ') {
						layoutParts.push(newLine);
						startNewLayoutGroup();
						// Spaces that overflow the line are skipped.
						continue;
					} else if (breakablePosition !== -1) {
						// The current letter would overflow the line, so we need to extract the
						// last word and insert a newline before it.
						const wordParts = currentLayoutGroup.renderParts
							.splice(breakablePosition)
							.slice(1);
						const wordWidth = wordParts.reduce(
							(a, b) => a + b.width,
							0
						);
						const wordHeight = wordParts.reduce(
							(a, b) => (a > b.height ? a : b.height),
							0
						);
						currentLayoutGroup.width -= wordWidth;
						if (currentLayoutGroup.height === wordHeight) {
							currentLayoutGroup.height =
								currentLayoutGroup.renderParts.reduce(
									(a, b) => (a > b.height ? a : b.height),
									0
								);
						}
						layoutParts.push(newLine);
						startNewLayoutGroup();
						currentLayoutGroup.renderParts = wordParts;
						currentLayoutGroup.width = wordWidth;
						currentLayoutGroup.height = wordHeight;
						remainingLineWidth -= wordWidth;
					}
				} else {
					if (item.character === ' ') {
						breakablePosition =
							currentLayoutGroup.renderParts.length;
					}
				}
				currentLayoutGroup.renderParts.push(item);
				currentLayoutGroup.height = Math.max(
					currentLayoutGroup.height,
					item.height
				);
				currentLayoutGroup.width += item.width;
				remainingLineWidth -= item.width;
			}
		}

		// Calculate the height of each line.
		// We need these in advance, so e.g. a chunk of larger text on a line doesn't move from the baseline.
		const lineHeights = [];
		let lineHeight = 0;

		for (const item of layoutParts) {
			lineHeight = Math.max(lineHeight, item.height);

			if (item.type === 'newline') {
				lineHeights.push(lineHeight);
				lineHeight = 0;
			}
		}
		lineHeights.push(lineHeight);

		// Actually place the layout groups.
		let lineNr = 0;
		let currentAlignment = defaultAlignment;
		let y = yStart;
		let start = 0;
		let end = w;

		for (const item of layoutParts) {
			if (item.type === 'newline') {
				y += lineHeights[++lineNr] || 0;
				start = 0;
				end = w;
				continue;
			}
			if (item.type === 'alignment') {
				currentAlignment = item.alignment;
				continue;
			}

			switch (currentAlignment) {
				case 'left':
					placeLayoutGroup(item, start, y);
					start += item.width;
					break;
				case 'center':
					placeLayoutGroup(
						item,
						start + (end - start) / 2 - item.width / 2,
						y
					);
					break;
				case 'right':
					placeLayoutGroup(item, end - item.width, y);
					end -= item.width;
					break;
			}
		}

		this.lastLayoutHeight = y;
		this.lastLayoutWidth = w;

		function placeLayoutGroup(
			group: LayoutGroup,
			startX: number,
			y: number
		) {
			let x = startX;
			for (const part of group.renderParts) {
				part.y = y;
				part.x = xStart + x;
				x += part.width;
			}
		}
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

		for (const item of this.renderParts) {
			lineWidth += item.width;

			if (item.type === 'newline') {
				maxLineWidth = Math.max(maxLineWidth, lineWidth);
				lineWidth = 0;
			}
		}
		maxLineWidth = Math.max(maxLineWidth, lineWidth);
		return maxLineWidth;
	}

	private static getRenderParts(
		tokens: Token[],
		baseStyle: ITextStyle,
		loose: boolean
	): RenderItem[] {
		const renderParts: RenderItem[] = [];
		const styleStack: ITextStyle[] = [];
		const tagStack: Array<ICommandToken | null> = [];
		let currentStyleHeight: number = measureHeight(baseStyle);
		let currentStyle = baseStyle;
		let currentTag: ICommandToken | null = null;

		function pushCharacters(str: string) {
			for (const character of str) {
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
		}

		for (const token of tokens) {
			const type = token.type;
			switch (type) {
				case 'command':
					if (token.commandName === 'align') {
						const alignment = token.argument.toLowerCase();
						if (
							alignment !== 'left' &&
							alignment !== 'center' &&
							alignment !== 'right'
						) {
							if (loose) {
								pushCharacters(
									'{align=' + token.argument + '}'
								);
								continue;
							} else {
								throw new Error(
									`There is no text command called '${token.commandName}' at position ${token.pos}.`
								);
							}
						}
						renderParts.push({
							type: 'alignment',
							alignment,
							height: currentStyleHeight,
							width: 0,
							x: 0,
							y: 0,
						});
					} else if (textCommands.has(token.commandName)) {
						styleStack.push(currentStyle);
						tagStack.push(currentTag);
						try {
							currentStyle = textCommands.get(token.commandName)!(
								currentStyle,
								token.argument
							);
							currentStyleHeight = measureHeight(currentStyle);
							currentTag = token;
						} catch (e) {
							if (loose) {
								styleStack.pop();
								tagStack.pop();
								pushCharacters(
									'{' +
										token.commandName +
										(token.argument
											? '=' + token.argument
											: '') +
										'}'
								);
								console.error('Parsing error', e);
								continue;
							} else {
								throw e;
							}
						}
					} else {
						if (loose) {
							pushCharacters('{' + token.commandName + '}');
						} else {
							throw new Error(
								`There is no text command called '${token.commandName}' at position ${token.pos}.`
							);
						}
					}
					break;
				case 'commandClose':
					if (!currentTag) {
						if (loose) {
							pushCharacters('{/' + token.commandName + '}');
							break;
						} else {
							throw new Error(
								`Unmatched closing command at position ${token.pos}. Closed '${token.commandName}', but no commands are currently open.`
							);
						}
					}
					if (token.commandName !== currentTag.commandName) {
						if (loose) {
							pushCharacters('{/' + token.commandName + '}');
							break;
						} else {
							throw new Error(
								`Unmatched closing command at position ${token.pos}. Closed '${token.commandName}', expected to close '${currentTag}' first. (Opened at position ${currentTag.pos})`
							);
						}
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
					pushCharacters(token.content);
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
			} else if (item.type === 'alignment') {
				// IDK.
				// Texts that support alignment don't use this function.
				console.error("Alignment in context where it's not supported.");
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

					if (
						currentLineWidth > maxLineWidth &&
						lastBreakPoint !== -1
					) {
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

const tmpCanvas = makeCanvas();
tmpCanvas.width = 0;
tmpCanvas.height = 0;
const tmpContext = tmpCanvas.getContext('2d')!;
let lastStyle: ITextStyle | null = null;

function measureWidth(textStyle: ITextStyle, character: string): number {
	if (textStyle !== lastStyle) {
		applyTextStyleToCanvas(textStyle, tmpContext);
		lastStyle = textStyle;
	}
	let spacing = textStyle.letterSpacing;
	if (typeof spacing !== 'number' || isNaN(spacing) || !isFinite(spacing)) {
		spacing = 0;
	}
	return tmpContext.measureText(character).width + spacing;
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

interface LayoutGroup {
	type: 'group';
	renderParts: RenderItem[];
	height: number;
	width: number;
}

type LayoutPart = LayoutGroup | INewlineItem | IAlignmentItem;
