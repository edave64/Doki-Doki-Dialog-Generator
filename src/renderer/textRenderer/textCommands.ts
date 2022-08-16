import { ITextStyle } from './textRenderer';

type Command = (style: ITextStyle, parameter?: string) => ITextStyle;

export default new Map<string, Command>([
	paramlessOp('i', (style) => ({ ...style, isItalic: true })),
	paramlessOp('b', (style) => ({ ...style, isBold: true })),
	paramlessOp('u', (style) => ({ ...style, isUnderlined: true })),
	paramlessOp('s', (style) => ({
		...style,
		isStrikethrough: true,
	})),
	paramlessOp('plain', (style) => ({
		...style,
		isStrikethrough: false,
		isUnderlined: false,
		isBold: false,
		isItalic: false,
	})),
	paramlessOp('edited', (style) => ({
		...style,
		fontName: 'verily',
		strokeColor: '#000000',
		strokeWidth: 20,
		letterSpacing: 8,
	})),
	relativeNumberOp('k', (style, relative, parameter) => ({
		...style,
		letterSpacing: relative ? style.letterSpacing + parameter : parameter,
	})),
	relativeNumberOp('size', (style, relative, parameter) => ({
		...style,
		fontSize: relative ? style.fontSize + parameter : parameter,
	})),
	relativeNumberOp('alpha', (style, relative, parameter) => ({
		...style,
		alpha: relative ? style.alpha + parameter : parameter,
	})),
	relativeNumberOp('stroke', (style, relative, parameter) => ({
		...style,
		strokeWidth: relative ? style.strokeWidth + parameter : parameter,
	})),
	[
		'font',
		(style, parameter?) => {
			return { ...style, fontName: parameter! };
		},
	],
	[
		'color',
		(style, parameter?) => {
			return { ...style, color: parameter! };
		},
	],
	[
		'outlinecolor',
		(style, parameter?) => {
			return { ...style, strokeColor: parameter! };
		},
	],
]);

function paramlessOp(
	name: string,
	op: (style: ITextStyle) => ITextStyle
): [string, Command] {
	return [
		name,
		(style: ITextStyle, parameter?: string) => {
			if (parameter) {
				throw new Error(`Operator '${name}' does not take any arguments.`);
			}
			return op(style);
		},
	];
}

function numberOp(
	name: string,
	op: (style: ITextStyle, param: number) => ITextStyle
): [string, Command] {
	return [
		name,
		(style: ITextStyle, parameter?: string) => {
			if (!parameter) throw new Error(`Operator '${name}' needs an argument.`);
			const num = Number(parameter);
			if (isNaN(num)) {
				throw new Error(`Operator '${name}' needs a numeric argument.`);
			}
			return op(style, num);
		},
	];
}

function relativeNumberOp(
	name: string,
	op: (style: ITextStyle, relative: boolean, param: number) => ITextStyle
): [string, Command] {
	return [
		name,
		(style: ITextStyle, parameter?: string) => {
			if (!parameter) throw new Error(`Operator '${name}' needs an argument.`);
			const relative = parameter[0] === '+' || parameter[0] === '-';
			const num = Number(parameter);
			if (isNaN(num)) {
				throw new Error(`Operator '${name}' needs a numeric argument.`);
			}
			return op(style, relative, num);
		},
	];
}
