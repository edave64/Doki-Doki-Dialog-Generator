export class StringWalker {
	private i: number = 0;
	public constructor(private readonly str: string) {}

	public get pos(): number {
		return this.i;
	}

	public current(): string {
		return this.str[this.i];
	}

	public get around(): string {
		return this.str.slice(Math.max(0, this.i - 5), this.i + 5);
	}

	public get ahead(): string {
		return this.str[this.i + 1];
	}

	public get behind(): string {
		return this.str[this.i + 1];
	}

	public next(): string {
		++this.i;
		return this.current();
	}
}
