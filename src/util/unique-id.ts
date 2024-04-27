/** Some components require a gloablly unique id. This provides that with a simple incrementing counter. */

let lastId: number | bigint = 0;

if (typeof BigInt !== 'undefined') {
	lastId = BigInt(0);
}

export default function uniqId() {
	const id = lastId;
	lastId++;
	return id + '';
}
