interface ITextToken {
	content: string;
	type: 'text';
}
interface ICommandToken {
	commandName: string;
	argument: string;
	type: 'command';
}
interface ICommandCloseToken {
	commandName: string;
	type: 'commandClose';
}
interface INewlineToken {
	type: 'newline';
}

export type Token =
	| ITextToken
	| ICommandToken
	| ICommandCloseToken
	| INewlineToken;

export function tokenize(str: string): Token[] {
	const tokens: Token[] = [];
	let currentTokenState: TokenizerState = tokenStateNormal;
	while (currentTokenState !== tokenStateEnd) {
		[str, currentTokenState] = currentTokenState(tokens, str);
	}
	return tokens;
}

type TokenizerState = (
	contents: Token[],
	str: string
) => [string, TokenizerState];

function tokenStateNormal(
	contents: Token[],
	str: string
): [string, TokenizerState] {
	if (str.length === 0) {
		return ['', tokenStateEnd];
	}
	if (str[0] === '{') return [str, tokenStateCommand];
	if (str[0] === '\n') return [str, tokenStateNewLine];
	return [str, tokenText];
}

function tokenStateEnd(): [string, TokenizerState] {
	return null!;
}

function tokenText(contents: Token[], str: string): [string, TokenizerState] {
	const endIdx = str.search(/[\{\n]/);
	const textContent = endIdx === -1 ? str : str.substr(0, endIdx);
	contents.push({
		type: 'text',
		content: textContent,
	});
	return [endIdx === -1 ? '' : str.slice(endIdx), tokenStateNormal];
}

function tokenStateCommand(
	contents: Token[],
	str: string
): [string, TokenizerState] {
	const endOfCommandIdx = str.indexOf('}');
	if (endOfCommandIdx === -1) {
		throw new Error('Broken');
	}
	const commandText = str.substr(1, endOfCommandIdx - 1).split('=');
	if (commandText[0][0] === '/') {
		if (commandText[1]) {
			throw new Error('Closing tags may not contain arguments');
		}
		contents.push({
			type: 'commandClose',
			commandName: commandText[0].slice(1),
		});
	} else {
		contents.push({
			type: 'command',
			argument: commandText[1],
			commandName: commandText[0],
		});
	}
	return [str.slice(endOfCommandIdx + 1), tokenStateNormal];
}

function tokenStateNewLine(
	contents: Token[],
	str: string
): [string, TokenizerState] {
	contents.push({ type: 'newline' });
	return [str.slice(1), tokenStateNormal];
}
