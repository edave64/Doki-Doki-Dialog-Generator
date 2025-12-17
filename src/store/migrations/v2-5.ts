/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * This file deals with safe file migration from version prior to 2.5
 *
 * In 2.5, the positioning of all objects has been normalized to be at the center. Before this decided on an type-by-
 * type basis. The zoom property has also been split into scaleX and scaleY
 */

import { getAssetByUrl } from '@/asset-manager';
import getConstants from '@/constants';
import { decomposeMatrix } from '@/util/math';
import type Character from '../object-types/character';
import type { GenObject } from '../object-types/object';
import type Sprite from '../object-types/sprite';
import { state } from '../root';

/**
 * Take a save from a version before 2.5 and migrate it.
 *
 * @param data
 * @returns
 */
export function migrateSave2_5(data: typeof state) {
	const panels = Object.values(data.panels.panels);
	// Detect and skip 2.5 prerelease version
	if (panels.find((x) => Object.values(x.objects).find((x) => 'scaleX' in x)))
		return;

	for (const panel of panels) {
		for (const object of Object.values(panel.objects) as (GenObject & {
			zoom?: number;
		})[]) {
			object.scaleX = object.zoom ?? 1;
			object.scaleY = object.zoom ?? 1;
			object.skewX = 0;
			object.skewY = 0;
			object.linkedTo = null;
			const constants = getConstants();

			if (object.type === 'character') {
				const character = object as unknown as Character;
				const charData = data.content.current.characters.find(
					(c) => c.id === character.characterType
				);
				const size = charData?.styleGroups[character.styleGroupId]
					?.styles[character.styleId]?.poses[character.poseId]
					?.size ?? [960, 960];
				adjustObjectSize2_5(character, object.zoom ?? 1, size);
			}
			if (object.type === 'textBox') {
				// Textbox height used to not include the namebox
				object.height += constants.TextBox.NameboxHeight;
				// Textboxes used to be positioned from the top-center
				object.y += object.height / 2;
			}
			if (object.type === 'sprite') {
				// For uploaded sprites, coordinates cannot be fixed here, because the the full size is required, and
				// we didn't store that.
				// So the sprites need to be fixed when they are re-uploaded.
				(object as any).requireFixing25 = true;
				(data as any).requireFixing25 = true;
			}
			delete object.zoom;
		}
	}
}

/**
 * Both sprites and characters have changed where their X/Y position is located, from top-center to center-center.
 * This function corrects that while properly accounting for rotation and scaling.
 *
 * @param obj - The object to fix
 * @param zoom - The old zoom value (was replaced with scaleX and scaleY)
 * @param size - The full, unscaled size of the object
 */
export function adjustObjectSize2_5(
	obj: Sprite | Character,
	zoom: number,
	size: [number, number]
): void {
	let a = new DOMMatrixReadOnly().translate(obj.x, obj.y + obj.height / 2);
	// Resizing -> Scale from the top
	a = a
		.translate(0, -obj.height / 2)
		.scale(obj.width / size[0], obj.height / size[1])
		.translate(0, size[1] / 2);

	// new position at center
	a = a.rotate(obj.flip ? -obj.rotation : obj.rotation);

	// Zoom -> Scale from the bottom
	a = a
		.translate(0, size[1] / 2)
		.scale(zoom)
		.translate(0, -size[1] / 2);

	const oldRot = obj.rotation;

	Object.assign(obj, decomposeMatrix(a));
	obj.rotation = obj.flip ? 360 - oldRot : oldRot;
	obj.skewX = 0;
	obj.skewY = 0;
	obj.width = size[0];
	obj.height = size[1];
}

/**
 * Functions that will be added as migrations to the root model
 */
export function fixSprites2_5(data: { url: string; size: [number, number] }) {
	for (const panel of Object.values(state.panels.panels)) {
		for (const object of Object.values(panel.objects)) {
			if (
				object.type !== 'sprite' ||
				!(object as any).requireFixing25 ||
				object.scaleX !== object.scaleY
			)
				continue;
			const sprite = object as Sprite;
			if (
				sprite.assets.length === 1 &&
				sprite.assets[0].hq === data.url
			) {
				adjustObjectSize2_5(sprite, object.scaleX, data.size);
				delete (object as any).requireFixing25;
			}
		}
	}
}

export async function afterImageUpload2_5(assertUrl: string) {
	if ('requireFixing25' in state) {
		const asset = await getAssetByUrl(assertUrl);
		fixSprites2_5({ url: assertUrl, size: [asset.width, asset.height] });
	}
}

/**
 * Because the sprites the need reuploading need their scale properties intact (As it stores the old zoom value)
 * We mustn't allow any modification of the scale values in an outdated sprite that has yet to be reuploaded.
 */
export function allowScaleModification(obj: GenObject) {
	return !(obj as any).requireFixing25;
}
