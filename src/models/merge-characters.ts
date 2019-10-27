import {
	registerAssetWithURL,
	ICharacter,
	Heads,
	INsfwAbleImg,
	Pose,
	IHeads,
} from '@/asset-manager';

function moveCharacterNsfw(character: ICharacter<Heads>) {
	if (!character.nsfw) return;
	for (const key in character.heads) {
		if (!character.heads.hasOwnProperty(key)) continue;
		character.heads[key].nsfw = true;
	}
	for (const pose of character.poses) {
		pose.nsfw = true;
	}
}

function moveHeadGroupNsfw(heads: IHeads) {
	if (!heads.nsfw) return;
	for (const head of heads.all) {
		head.nsfw = true;
	}
}

function movePoseNsfw(pose: Pose<any>) {
	if (!pose.nsfw) return;

	if ('variant' in pose) {
		for (const part of pose.variant) {
			part.nsfw = true;
		}
	} else if ('left' in pose) {
		for (const part of pose.left) {
			part.nsfw = true;
		}
		for (const part of pose.right) {
			part.nsfw = true;
		}
	}
}

export function mergeCharacters(
	characterA: ICharacter<Heads>,
	characterB: ICharacter<Heads>
): void {
	if (characterA.nsfw !== characterB.nsfw) {
		moveCharacterNsfw(characterA);
		moveCharacterNsfw(characterB);
	}
	for (const headGroupKey in characterB.heads) {
		if (!characterB.heads.hasOwnProperty(headGroupKey)) continue;
		const headGroup = characterB.heads[headGroupKey];
		if (characterA.heads[headGroupKey]) {
			const oldHeadGroup = characterA.heads[headGroupKey];
			if (headGroup.nsfw !== oldHeadGroup.nsfw) {
				moveHeadGroupNsfw(headGroup);
				moveHeadGroupNsfw(oldHeadGroup);
			}
			for (const head of headGroup.all) {
				oldHeadGroup.all.push(head);
			}
		} else {
			characterA.heads[headGroupKey] = headGroup;
		}
	}
	for (const pose of characterB.poses) {
		const collidingPose = characterA.poses.find(
			poseA => poseA.name === pose.name
		);
		if (collidingPose) {
			if (pose.nsfw !== collidingPose.nsfw) {
				movePoseNsfw(pose);
				movePoseNsfw(collidingPose);
			}
			if ('left' in pose) {
				if ('left' in collidingPose) {
					(collidingPose as any).left = [...collidingPose.left, ...pose.left];
					(collidingPose as any).right = [
						...collidingPose.right,
						...pose.right,
					];
				} else {
					console.error(
						'Incompatible poses ' + pose.name + ' in content packs'
					);
				}
			} else {
				let oldCollection: INsfwAbleImg[] = [];
				let newCollection: INsfwAbleImg[] = [];
				if ('variant' in collidingPose) {
					oldCollection = collidingPose.variant;
				}
				if ('static' in collidingPose) {
					oldCollection = [
						{
							img: collidingPose.static,
							nsfw: collidingPose.nsfw,
						},
					];
					delete collidingPose.static;
				}
				if ('variant' in pose) {
					newCollection = pose.variant;
				}
				if ('static' in pose) {
					newCollection = [
						{
							img: pose.static,
							nsfw: pose.nsfw,
						},
					];
				}
				(pose as any).variant = [...oldCollection, ...newCollection];
			}
		} else {
			characterA.poses.push(pose);
		}
	}
}

export function freezeAssetUrls(character: ICharacter<Heads>) {
	for (const headGroupKey in character.heads) {
		if (!character.heads.hasOwnProperty(headGroupKey)) continue;
		const headGroup = character.heads[headGroupKey];
		const collection = headGroup.all || headGroup;
		for (const head of collection) {
			const path = head;
			registerAssetWithURL(path.img, path.img);
		}
	}
	for (const poseKey in character.poses) {
		if (!character.poses.hasOwnProperty(poseKey)) continue;
		const pose = character.poses[poseKey];
		const collection: string[] = [];
		if ('static' in pose) {
			collection.push(pose.static);
		}
		if ('left' in pose) {
			for (const left of pose.left) {
				if (typeof left === 'string') {
					collection.push(left);
				} else {
					collection.push(left.img);
				}
			}
		}
		if ('right' in pose) {
			for (const right of pose.right) {
				if (typeof right === 'string') {
					collection.push(right);
				} else {
					collection.push(right.img);
				}
			}
		}
		if ('variant' in pose) {
			for (const variant of pose.variant) {
				if (typeof variant === 'string') {
					collection.push(variant);
				} else {
					collection.push(variant.img);
				}
			}
		}
		for (const part of collection) {
			const path = part;
			registerAssetWithURL(path, path);
		}
	}
}
