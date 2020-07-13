export function exhaust(a: never): never {
	throw new Error(`Unexpected value "${a}"`);
}
