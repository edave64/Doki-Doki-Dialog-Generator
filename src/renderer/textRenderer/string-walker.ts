const aroundContextSize = 5;

export class StringWalker {
	public pos: number = 0;
	public constructor(private readonly str: string) {}

	public current(): string {
		return this.str[this.pos];
	}

	public get around(): string {
		return this.str.slice(
			Math.max(0, this.pos - aroundContextSize),
			this.pos + aroundContextSize
		);
	}

	public get ahead(): string {
		return this.str[this.pos + 1];
	}

	public get behind(): string {
		return this.str[this.pos + 1];
	}

	public next(): string {
		++this.pos;
		return this.current();
	}
}
