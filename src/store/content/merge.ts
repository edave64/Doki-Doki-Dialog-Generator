import {
	ContentPack,
	Background,
	Character,
	HeadCollections,
	Pose,
	StyleClasses,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAssetSwitch } from '.';

export function mergeContentPacks(
	x: ContentPack<IAssetSwitch>,
	y: ContentPack<IAssetSwitch>
): ContentPack<IAssetSwitch> {
	return {
		backgrounds: mergeBackgrounds(x.backgrounds, y.backgrounds),
		characters: mergeCharacters<IAssetSwitch>(x.characters, y.characters),
		dependencies: mergeArrayUnique(x.dependencies, y.dependencies),
		fonts: mergeIdArrays(
			x.fonts,
			y.fonts,
			(obj) => obj.id,
			(xObj, yObj) => ({
				...xObj,
				files: mergeArrayUnique(xObj.files, yObj.files),
			})
		),
		poemStyles: mergeIdArrays(
			x.poemStyles,
			y.poemStyles,
			(obj) => obj.label,
			() => {
				throw new Error();
			}
		),
		poemBackgrounds: [...x.poemBackgrounds, ...y.poemBackgrounds],
		sprites: mergeIdArrays(
			x.sprites,
			y.sprites,
			(obj) => obj.id,
			(xObj, yObj) => ({
				id: xObj.id,
				label: xObj.label,
				variants: [...xObj.variants, ...yObj.variants],
				defaultScale: xObj.defaultScale,
				hd: xObj.hd,
				sdVersion: xObj.sdVersion || yObj.sdVersion,
			})
		),
		colors: mergeIdArrays(
			x.colors,
			y.colors,
			(obj) => obj.color,
			(xObj) => xObj
		),
	};
}

function mergeBackgrounds<A>(
	x: Array<Background<A>>,
	y: Array<Background<A>>
): Array<Background<A>> {
	return mergeIdArrays(x, y, (obj) => obj.id, mergeBackground);
}

function mergeBackground<A>(x: Background<A>, y: Background<A>): Background<A> {
	return {
		id: x.id,
		label: x.label,
		variants: [...x.variants, ...y.variants],
		scaling: x.scaling,
		sdVersion: x.sdVersion || y.sdVersion,
	};
}

function mergeCharacters<A>(
	x: Array<Character<A>>,
	y: Array<Character<A>>
): Array<Character<A>> {
	return mergeIdArrays(x, y, (obj) => obj.id, mergeCharacter);
}

function mergeCharacter<A>(x: Character<A>, y: Character<A>): Character<A> {
	return {
		chibi: x.chibi,
		id: x.id,
		label: x.label,
		heads: mergeHeadCollections(x.heads, y.heads),
		defaultScale: x.defaultScale,
		hd: x.hd,
		size: x.size,
		sdVersion: x.sdVersion,
		styleGroups: mergeIdArrays(
			x.styleGroups,
			y.styleGroups,
			(obj) => obj.id,
			(xStyleGroup, yStyleGroup) => {
				return {
					id: xStyleGroup.id,
					styleComponents: mergeIdArrays(
						xStyleGroup.styleComponents,
						yStyleGroup.styleComponents,
						(obj) => obj.id,
						(xClasses, yClasses) => {
							return {
								id: xClasses.id,
								label: xClasses.label,
								variants: mergeStyleClasses(
									xClasses.variants,
									yClasses.variants
								),
							};
						}
					),
					styles: mergeIdArrays(
						xStyleGroup.styles,
						yStyleGroup.styles,
						(obj) => JSON.stringify(obj.components),
						(xStyle, yStyle) => ({
							components: xStyle.components,
							poses: mergeIdArrays(
								xStyle.poses,
								yStyle.poses,
								(obj) => obj.id,
								mergePose
							),
						})
					),
				};
			}
		),
	};
}

function mergeStyleClasses<A>(
	x: StyleClasses<A>,
	y: StyleClasses<A>
): StyleClasses<A> {
	const ret: StyleClasses<A> = { ...x };

	for (const classKey in y) {
		if (!y.hasOwnProperty(classKey)) continue;
		if (ret.hasOwnProperty(classKey)) continue;
		ret[classKey] = y[classKey];
	}

	return ret;
}

function mergePose<A>(x: Pose<A>, y: Pose<A>): Pose<A> {
	const positions: Pose<A>['positions'] = { ...x.positions };

	for (const key in y.positions) {
		if (positions[key]) {
			positions[key] = [...positions[key], ...y.positions[key]] as A[][];
		} else {
			positions[key] = y.positions[key];
		}
	}

	return {
		id: x.id,
		compatibleHeads: mergeArrayUnique(x.compatibleHeads, y.compatibleHeads),
		previewOffset: x.previewOffset,
		previewSize: x.previewSize,
		scale: x.scale,
		size: x.size,
		renderCommands: x.renderCommands,
		positions,
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
				previewOffset: oldHeadGroup.previewOffset,
				previewSize: oldHeadGroup.previewSize,
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
