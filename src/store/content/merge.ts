import {
	ContentPack,
	Background,
	Character,
	HeadCollections,
	Pose,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAsset } from '.';

export function mergeContentPacks(
	x: ContentPack<IAsset>,
	y: ContentPack<IAsset>
): ContentPack<IAsset> {
	return {
		backgrounds: mergeBackgrounds(x.backgrounds, y.backgrounds),
		characters: mergeCharacters<IAsset>(x.characters, y.characters),
		fonts: mergeIdArrays(
			x.fonts,
			y.fonts,
			obj => obj.id,
			(xObj, yObj) => ({
				...xObj,
				files: mergeArrayUnique(xObj.files, yObj.files),
			})
		),
		poemStyles: mergeIdArrays(
			x.poemStyles,
			y.poemStyles,
			obj => obj.label,
			() => {
				throw new Error();
			}
		),
		sprites: mergeIdArrays(
			x.sprites,
			y.sprites,
			obj => obj.label,
			(xObj, yObj) => ({
				label: xObj.label,
				variants: [...xObj.variants, ...yObj.variants],
			})
		),
		colors: mergeIdArrays(
			x.colors,
			y.colors,
			obj => obj.color,
			xObj => xObj
		),
	};
}

function mergeBackgrounds<A>(
	x: Array<Background<A>>,
	y: Array<Background<A>>
): Array<Background<A>> {
	return mergeIdArrays(x, y, obj => obj.id, mergeBackground);
}

function mergeBackground<A>(x: Background<A>, y: Background<A>): Background<A> {
	return {
		id: x.id,
		label: x.label,
		variants: [...x.variants, ...y.variants],
	};
}

function mergeCharacters<A>(
	x: Array<Character<A>>,
	y: Array<Character<A>>
): Array<Character<A>> {
	return mergeIdArrays(x, y, obj => obj.id, mergeCharacter);
}

function mergeCharacter<A>(x: Character<A>, y: Character<A>): Character<A> {
	return {
		chibi: x.chibi,
		id: x.id,
		label: x.label,
		size: x.size,
		styleComponents: mergeIdArrays(
			x.styleComponents,
			y.styleComponents,
			obj => obj.name,
			(xObj, yObj) => ({
				label: xObj.label,
				name: xObj.name,
				variants: {
					...yObj.variants,
					...xObj.variants,
				},
			})
		),
		heads: mergeHeadCollections(x.heads, y.heads),
		poses: mergeIdArrays(x.poses, y.poses, obj => obj.name, mergePose),
		styles: mergeIdArrays(
			x.styles,
			y.styles,
			obj => obj.name,
			(xStyle, yStyle) => {
				throw new Error('Colliding style definitions');
			}
		),
	};
}

function mergePose<A>(x: Pose<A>, y: Pose<A>): Pose<A> {
	if (x.static && x.static.length > 0 && y.static && y.static.length > 0) {
		throw new Error('Colliding static poses');
	}

	return {
		compatibleHeads: mergeArrayUnique(x.compatibleHeads, y.compatibleHeads),
		headAnchor: x.headAnchor,
		left: [...x.left, ...y.left],
		right: [...x.right, ...y.right],
		name: x.name,
		offset: x.offset,
		renderOrder: x.renderOrder,
		size: x.size,
		static: x.static,
		style: x.style,
		variant: [...x.variant, ...y.variant],
	};
}

function mergeHeadCollections<A>(
	x: HeadCollections<A>,
	y: HeadCollections<A>
): HeadCollections<A> {
	const ret = { ...x };

	for (const headGroupKey in y) {
		if (!y.hasOwnProperty(headGroupKey)) continue;
		const headGroup = y[headGroupKey];
		if (ret[headGroupKey]) {
			const oldHeadGroup = ret[headGroupKey];
			ret[headGroupKey] = {
				offset: oldHeadGroup.offset,
				size: oldHeadGroup.size,
				variants: [...oldHeadGroup.variants, ...headGroup.variants],
			};
		} else {
			ret[headGroupKey] = headGroup;
		}
	}

	return ret;
}

function mergeArrayUnique<A>(x: A[], y: A[]): A[] {
	const ret = [...x];
	for (const yObj of y) {
		if (!ret.includes(yObj)) {
			ret.push(yObj);
		}
	}
	return ret;
}

function mergeIdArrays<A, B>(
	x: A[],
	y: A[],
	getId: (obj: A) => B,
	merge: (x: A, y: A) => A
): A[] {
	const ret = [...x];
	const definedIds = new Map<B, number>(
		x.map((xObj, idx) => [getId(xObj), idx])
	);

	for (const yObj of y) {
		const yId = getId(yObj);
		if (definedIds.has(yId)) {
			const existingIdx = definedIds.get(yId)!;
			const existing = ret[existingIdx];
			ret.splice(existingIdx, 1, merge(existing, yObj));
		} else {
			definedIds.set(yId, ret.length);
			ret.push(yObj);
		}
	}

	return ret;
}
