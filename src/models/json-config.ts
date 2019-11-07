import {
	ICharacter,
	Heads,
	INsfwAbleImg,
	IHeads,
	Pose,
	IStyle,
} from '@/asset-manager';

export function normalizeCharacter(
	character: IJSONCharacter<JSONHeads>,
	paths: IPaths
): ICharacter<any> {
	const charFolder = character.folder || '/';
	return {
		id: character.id,
		internalId: character.internalId,
		name: character.name,
		nsfw: !!character.nsfw,
		chibi: character.chibi
			? normalizeUrl(appendUrl(charFolder, character.chibi, paths), paths)
			: undefined,
		eyes: character.eyes || {},
		hairs: character.hairs || {},
		styles: normalizeStyles(character.styles),
		heads: normalizeHeads(character.heads, charFolder, paths),
		poses: normalizePoses(character.poses, charFolder, paths),
	} as ICharacter<any>;
}

function normalizeHeads(
	heads: JSONHeads,
	baseFolder: string,
	paths: IPaths
): Heads {
	const ret: Heads = {};

	for (const headGroupKey in heads) {
		if (!heads.hasOwnProperty(headGroupKey)) continue;
		const headGroup = heads[headGroupKey];
		let newHeadGroup: IHeads;
		if (headGroup instanceof Array) {
			newHeadGroup = {
				all: normalizeNsfwAbleCollection(headGroup, baseFolder, paths),
				nsfw: false,
				offset: [290, 70],
				size: [380, 380],
			};
		} else {
			const subFolder = appendUrl(baseFolder, headGroup.folder, paths);
			newHeadGroup = {
				all: normalizeNsfwAbleCollection(headGroup.all, subFolder, paths),
				nsfw: !!headGroup.nsfw,
				offset: headGroup.offset || [290, 70],
				size: headGroup.size || [380, 380],
			};
		}
		ret[headGroupKey] = newHeadGroup;
	}

	return ret;
}

function appendUrl(base: string, sub: string | undefined, paths: IPaths) {
	if (!sub) return base;
	for (const path in paths) {
		if (sub.startsWith(path)) {
			return sub;
		}
	}
	if (sub[0] === '/' || isWebUrl(sub)) {
		return sub;
	}
	return base + sub;
}

function isWebUrl(path: string) {
	return (
		path.startsWith('blob:') ||
		path.startsWith('http://') ||
		path.startsWith('https://') ||
		path.startsWith('://')
	);
}

function normalizePoses(
	poses: Array<JSONPose<JSONHeads>>,
	baseFolder: string,
	paths: IPaths
): Array<Pose<Heads>> {
	return poses.map(pose => {
		const poseFolder = appendUrl(baseFolder, pose.folder, paths);
		const ret = ({
			compatibleHeads: pose.compatibleHeads,
			headAnchor: pose.headAnchor || [0, 0],
			headInForeground: !!pose.headInForeground,
			name: pose.name,
			nsfw: !!pose.nsfw,
			style: pose.style,
			offset: [0, 0],
			size: [960, 960],
		} as Pose<Heads>) as any;

		if ('static' in pose) {
			ret.static = normalizeUrl(poseFolder + pose.static, paths);
		} else if ('variant' in pose) {
			ret.variant = normalizeNsfwAbleCollection(
				pose.variant,
				poseFolder,
				paths
			);
		} else if ('left' in pose) {
			ret.left = normalizeNsfwAbleCollection(pose.left, poseFolder, paths);
			ret.right = normalizeNsfwAbleCollection(pose.right, poseFolder, paths);
		}

		return ret as Pose<Heads>;
	});
}

function normalizeNsfwAbleCollection(
	collection: Array<string | INsfwAbleImg>,
	poseFolder: string,
	paths: IPaths
) {
	return collection.map(
		(variant): INsfwAbleImg => {
			if (typeof variant === 'string') {
				return {
					img: normalizeUrl(appendUrl(poseFolder, variant, paths), paths),
					nsfw: false,
				};
			} else {
				return {
					img: normalizeUrl(appendUrl(poseFolder, variant.img, paths), paths),
					nsfw: variant.nsfw,
				};
			}
		}
	);
}

function normalizeUrl(str: string, paths: IPaths) {
	for (const path in paths) {
		if (str.startsWith(path)) {
			str = paths[path] + str.slice(path.length);
		}
	}
	if (isWebUrl(str)) return str;
	return str.replace(/\/{2,}/g, '/');
}

function normalizeStyles(styles?: IJSONStyle[]): IStyle[] {
	if (!styles) return [];
	return styles.map(style => ({
		name: style.name,
		label: style.label,
		nsfw: style.nsfw || false,
	}));
}

export interface IJSONHeads {
	folder?: string;
	nsfw?: boolean;
	all: Array<string | INsfwAbleImg>;
	size?: [number, number];
	offset?: [number, number];
}

export interface JSONHeads {
	[id: string]: IJSONHeads | Array<string | INsfwAbleImg>;
}

interface IJSONPose<H> {
	compatibleHeads: Array<keyof H>;
	headInForeground?: boolean;
	folder?: string;
	nsfw?: boolean;
	name: string;
	style: string;
	headAnchor?: [number, number];
	size?: [number, number];
	offset?: [number, number];
}

interface IJSONStaticPose<H> extends IJSONPose<H> {
	static: string;
}

interface IJSONVariantPose<H> extends IJSONPose<H> {
	variant: Array<string | INsfwAbleImg>;
}

interface IJSONTwoSidedPose<H> extends IJSONPose<H> {
	left: Array<string | INsfwAbleImg>;
	right: Array<string | INsfwAbleImg>;
}

export type JSONPose<H extends JSONHeads> =
	| IJSONStaticPose<H>
	| IJSONVariantPose<H>
	| IJSONTwoSidedPose<H>;

export interface IJSONStyle {
	name: string;
	label: string;
	nsfw?: boolean;
}

export interface IJSONStyleClasses {
	[name: string]: string;
}

export interface IJSONCharacter<H extends JSONHeads> {
	id: string;
	packId: string;
	packCredits: string;
	internalId: string;
	name: string;
	folder?: string;
	nsfw?: boolean;
	eyes?: IJSONStyleClasses;
	hairs?: IJSONStyleClasses;
	chibi?: string;
	styles?: IJSONStyle[];
	heads: H;
	poses: Array<JSONPose<H>>;
}

export interface IPaths {
	[prefix: string]: string;
}
