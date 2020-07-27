const allowedTags = [
	'h3',
	'h4',
	'h5',
	'h6',
	'blockquote',
	'p',
	'a',
	'ul',
	'ol',
	'nl',
	'li',
	'b',
	'i',
	'strong',
	'em',
	'strike',
	'code',
	'hr',
	'br',
	'div',
	'table',
	'thead',
	'caption',
	'tbody',
	'tr',
	'th',
	'td',
	'pre',
];
const allowedAttributes: { [tagName: string]: string[] | undefined } = {
	a: ['href'],
	img: ['src'],
};
const schemaLimitedAttributes = ['href', 'src'];
const allowedSchemas = ['http', 'https'];
const enforceAttributes: {
	[tagName: string]: { [attr: string]: string } | undefined;
} = {
	a: {
		target: '_blank',
		rel: 'noopener noreferrer',
	},
};

export function sanitize(html: string) {
	const retDoc = document.createElement('div');
	const doc = document.createElement('div');
	doc.innerHTML = html;

	for (const node of Array.from(doc.childNodes)) {
		for (const sanitizedNode of sanitizeElement(node as Element)) {
			retDoc.appendChild(sanitizedNode);
		}
	}

	return retDoc.innerHTML;
}

const protocolMatcher = /^(\w+):/;

function sanitizeElement(node: Node): Node[] {
	if (node.nodeType !== Node.ELEMENT_NODE) return [node];
	const el = node as Element;
	const tagName = el.tagName.toLowerCase();
	if (allowedTags.includes(tagName)) {
		const newEl = document.createElement(tagName) as HTMLElement;
		const attrs: Attr[] = Array.prototype.slice.call(el.attributes);
		const allowedAttrs = allowedAttributes[tagName] || [];
		for (const attr of attrs) {
			if (!allowedAttrs.includes(attr.name)) continue;
			if (schemaLimitedAttributes.includes(attr.name)) {
				const protocolMatch = attr.value.match(protocolMatcher);
				if (protocolMatch && !allowedSchemas.includes(protocolMatch[1]))
					continue;
			}
			newEl.setAttribute(attr.name, el.getAttribute(attr.name)!);
		}
		const enforce = enforceAttributes[tagName];
		if (enforce) {
			for (const attrName in enforce) {
				if (!Object.prototype.hasOwnProperty.call(enforce, attrName)) continue;
				newEl.setAttribute(attrName, enforce[attrName]);
			}
		}
		const children: Node[] = Array.prototype.slice.call(el.childNodes);
		for (const childNode of children) {
			const subNodes = sanitizeElement(childNode);
			for (const subNode of subNodes) {
				newEl.appendChild(subNode);
			}
		}
		return [newEl];
	} else {
		let ret: Node[] = [];
		ret.push(document.createTextNode(`<${tagName}>`));
		for (const subNode of el.childNodes) {
			ret = ret.concat(sanitizeElement(subNode));
		}
		ret.push(document.createTextNode(`</${tagName}>`));
		return ret;
	}
}
