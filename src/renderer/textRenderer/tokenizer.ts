import { StringWalker } from './string-walker';

interface ITextToken {
	content: string;
	pos: number;
	type: 'text';
}
export interface ICommandToken {
	commandName: string;
	argument: string;
	pos: number;
	type: 'command';
}
interface ICommandCloseToken {
	commandName: string;
	pos: number;
	type: 'commandClose';
}
interface INewlineToken {
	type: 'newline';
	pos: number;
}

export type Token =
	| ITextToken
	| ICommandToken
	| ICommandCloseToken
	| INewlineToken;

export function tokenize(str: string): Token[] {
	const tokens: Token[] = [];
	const stringWalker = new StringWalker(str);
	let currentTokenState: TokenizerState = tokenStateNormal;
	while (currentTokenState !== tokenStateEnd) {
		currentTokenState = currentTokenState(tokens, stringWalker);
	}
	return tokens;
}

type TokenizerState = (
	contents: Token[],
	walker: StringWalker
) => TokenizerState;

function tokenStateNormal(
	contents: Token[],
	walker: StringWalker
): TokenizerState {
	if (walker.current() === undefined) return tokenStateEnd;
	if (walker.current() === '{') return tokenStateCommand;
	if (walker.current() === '\n') return tokenStateNewLine;
	return tokenText;
}

function tokenStateEnd(): TokenizerState {
	return tokenStateEnd;
}

function tokenText(contents: Token[], walker: StringWalker): TokenizerState {
	const { pos } = walker;
	let textContent = '';
	let escape = false;
	let nextState: TokenizerState;
	while (true) {
		if (walker.current() === undefined) {
			nextState = tokenStateEnd;
			break;
		} else if (escape) {
			textContent += walker.current();
			escape = false;
		} else if (walker.current() === '\\') {
			escape = true;
		} else if (walker.current() === '{' || walker.current() === '\n') {
			nextState = tokenStateNormal;
			break;
		} else {
			textContent += walker.current();
		}
		walker.next();
	}
	contents.push({
		type: 'text',
		pos,
		content: textContent,
	});
	return nextState;
}

function error(walker: StringWalker, msg: string): never {
	throw new Error(
		`Error at position ${walker.pos}: (around: ${walker.around}) ${msg}`
	);
}

function tokenStateCommand(
	contents: Token[],
	walker: StringWalker
): TokenizerState {
	const { pos } = walker;
	if (walker.current() !== '{') {
		throw new Error('Parser error: Command does not start with {');
	}
	const closing = walker.next() === '/';
	if (closing) {
		walker.next();
	}
	let commandName = '';
	let argument = '';
	let argumentsState = false;

	while (true) {
		if (walker.current() === undefined) {
			error(walker, 'Unexpected end of text inside a command');
		}
		if (walker.current() === '}') {
			break;
		} else if (!argumentsState) {
			if (walker.current().match(/[a-z]/i)) {
				commandName += walker.current();
			} else if (walker.current() === '=') {
				if (closing) {
					error(walker, 'Closing commands may not contain arguments');
				}
				argumentsState = true;
			} else {
				error(walker, 'Unexpected character in command name.');
			}
		} else {
			argument += walker.current();
		}
		walker.next();
	}
	walker.next();
	if (closing) {
		contents.push({
			type: 'commandClose',
			commandName,
			pos,
		});
	} else {
		contents.push({
			type: 'command',
			pos,
			argument,
			commandName,
		});
	}
	return tokenStateNormal;
}

function tokenStateNewLine(
	contents: Token[],
	walker: StringWalker
): TokenizerState {
	contents.push({ type: 'newline', pos: walker.pos });
	walker.next();
	return tokenStateNormal;
}
