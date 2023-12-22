/**
 * This is a part of render-view that draws helpers on the screen to scale and rotate the currently selected object.
 */

import { getAssetByUrl } from '@/asset-manager';
import scale from '@/assets/open_in_full.svg';
import rotate from '@/assets/rotate_left.svg';
import getConstants from '@/constants';
import { IAsset } from '@/render-utils/assets/asset';
import { getMainSceneRenderer } from '@/renderables/main-scene-renderer';
import { RStore } from '@/store';
import { IObject, ISetSpriteRotationMutation } from '@/store/objects';
import { safeAsync } from '@/util/errors';
import { between } from '@/util/math';

const pixelRatio = window.devicePixelRatio ?? 1;

export function paint(ctx: CanvasRenderingContext2D, center: DOMPointReadOnly) {
	const offsetCenter = movePointIntoView(center);

	ctx.save();
	if (currentGrabby && lastPos) {
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(center.x, center.y);
		ctx.lineTo(lastPos.x, lastPos.y);
		ctx.setLineDash([5 * pixelRatio, 5 * pixelRatio]);
		ctx.strokeStyle = '#000';
		ctx.stroke();
		ctx.closePath();
		ctx.restore();

		currentGrabby.paint(ctx, center);

		ctx.translate(lastPos.x, lastPos.y);
		ctx.scale(pixelRatio, pixelRatio);
		drawGrabby(ctx, currentGrabby, new DOMPointReadOnly());
	} else {
		const constants = getConstants();
		ctx.translate(offsetCenter.x, offsetCenter.y);
		ctx.scale(pixelRatio, pixelRatio);
		if (center.x > constants.Base.screenWidth / 2) {
			ctx.scale(-1, 1);
		}
		if (center.y > constants.Base.screenHeight / 2) {
			ctx.scale(1, -1);
		}
		for (let i = 0; i < grabbies.length; i++) {
			const grabby = grabbies[i];
			if (!grabby.pos) {
				grabby.pos = getRadialPos(rotationOneSixth * (i + 1));
			}
			drawGrabby(ctx, grabby, grabby.pos!);
		}
	}
	ctx.restore();
}

let initialDragAngle: number = 0;
let initalObjRotation: number = 0;
const tau = 2 * Math.PI;

const grabbies: Grabby[] = [
	{
		icon: rotate,
		paint(ctx: CanvasRenderingContext2D, center: DOMPointReadOnly) {
			const { angle, distance } = vectorToAngleAndDistance(
				pointsToVector(center, lastPos!)
			);
			const constants = getConstants().Base;
			let normAngle = (initialDragAngle - angle + tau) % tau;

			ctx.beginPath();
			ctx.moveTo(center.x, center.y);
			let start = initialDragAngle - Math.PI;
			let end = start + angle - initialDragAngle;

			console.log(normAngle);
			// Flipping start and end if the rotation is less than half a circle
			if (normAngle <= Math.PI) {
				const tmp = end;
				end = start;
				start = tmp;
			}

			ctx.arc(center.x, center.y, constants.wheelInnerRadius, start, end);
			ctx.lineTo(center.x, center.y);
			ctx.globalCompositeOperation = 'difference';
			ctx.fillStyle = 'rgba(255, 255, 255, 1)';
			ctx.fill();
			ctx.globalCompositeOperation = 'source-over';
		},
		onStartMove(store: RStore, obj: IObject, center: DOMPointReadOnly) {
			initalObjRotation = obj.rotation;
			const { angle, distance } = vectorToAngleAndDistance(
				pointsToVector(center, lastPos!)
			);
			initialDragAngle = angle;
		},
		onMove(store: RStore, obj: IObject, center: DOMPointReadOnly) {
			const { angle, distance } = vectorToAngleAndDistance(
				pointsToVector(center, lastPos!)
			);

			console.log('angle', angle, 'Grad angle', (angle / Math.PI) * 180);

			store.commit('panels/setRotation', {
				panelId: obj.panelId,
				id: obj.id,
				rotation:
					initalObjRotation + ((angle - initialDragAngle) / Math.PI) * 180,
			} as ISetSpriteRotationMutation);
		},
	},
	{
		icon: scale,
		paint(ctx: CanvasRenderingContext2D, center: DOMPointReadOnly) {},
		onStartMove(store: RStore, obj: IObject, center: DOMPointReadOnly) {},
		onMove(store: RStore, obj: IObject) {},
	},
];

let currentGrabby: Grabby | null = null;
let grabStarted = false;
let startPos: DOMPointReadOnly | null = null;
let lastPos: DOMPointReadOnly | null = null;

export function onDown(
	pos: DOMPointReadOnly,
	transformedPoint: DOMPointReadOnly
) {
	const constants = getConstants();
	const grabbyHit = grabbies.find((grabby) => {
		const grabbyPos = grabby.lastDrawPos;
		if (!grabbyPos) return false;
		const distance = Math.sqrt(
			Math.pow(pos.x - grabbyPos.x, 2) + Math.pow(pos.y - grabbyPos.y, 2)
		);
		return distance <= (constants.Base.wheelWidth / 2) * pixelRatio;
	});
	if (grabbyHit) {
		currentGrabby = grabbyHit;
		grabStarted = false;
		startPos = transformedPoint;
		lastPos = pos;
		return true;
	}
	return false;
}

export function onMove(
	store: RStore,
	pos: DOMPointReadOnly,
	transformedPoint: DOMPointReadOnly
) {
	if (!currentGrabby) return false;
	const panels = store.state.panels;
	const currentPanel = panels.panels[panels.currentPanel];
	const obj = currentPanel.objects[store.state.ui.selection!];
	const linkedTransform =
		getMainSceneRenderer(store)?.getLastRenderObject(obj.linkedTo!)
			?.preparedTransform ?? new DOMMatrixReadOnly();
	const center = linkedTransform.transformPoint(
		new DOMPointReadOnly(obj.x, obj.y)
	);
	if (!grabStarted) {
		grabStarted = true;
		currentGrabby.onStartMove(store, obj, center);
	}
	lastPos = pos;
	currentGrabby.onMove(store, obj, center);
	return true;
}

export function onDrop() {
	if (!currentGrabby) return false;
	currentGrabby = null;
	lastPos = null;
	return true;
}

const grabbyIcons = new Map<string, IAsset>();
for (const grabby of grabbies) {
	safeAsync(
		'Loading grabby icon',
		(async (grabby: Grabby) => {
			grabbyIcons.set(grabby.icon, await getAssetByUrl(grabby.icon));
		}).bind(this, grabby)
	);
}

function drawGrabby(
	ctx: CanvasRenderingContext2D,
	grabby: Grabby,
	pos: DOMPointReadOnly
) {
	const constants = getConstants();
	ctx.save();
	ctx.translate(pos.x, pos.y);
	grabby.lastDrawPos = ctx
		.getTransform()
		.transformPoint(new DOMPointReadOnly());
	ctx.scale(-1, 1);
	ctx.beginPath();
	ctx.ellipse(
		0,
		0,
		constants.Base.wheelWidth / 2,
		constants.Base.wheelWidth / 2,
		0,
		0,
		2 * Math.PI
	);
	ctx.closePath();
	const style = getComputedStyle(document.body);
	ctx.fillStyle = style.getPropertyValue('--accent-background');
	ctx.strokeStyle = style.getPropertyValue('--border');
	ctx.lineWidth = 2;
	ctx.fill();
	ctx.stroke();

	grabbyIcons.get(grabby.icon)?.paintOnto(ctx);
	ctx.restore();
}

interface Grabby {
	icon: string;
	onStartMove: (store: RStore, obj: IObject, center: DOMPointReadOnly) => void;
	onMove: (store: RStore, obj: IObject, center: DOMPointReadOnly) => void;
	paint: (ctx: CanvasRenderingContext2D, center: DOMPointReadOnly) => void;
	pos?: DOMPointReadOnly;
	lastDrawPos?: DOMPointReadOnly;
}

function movePointIntoView(center: DOMPointReadOnly): DOMPointReadOnly {
	const constants = getConstants();
	const fullRadius =
		constants.Base.wheelWidth + constants.Base.wheelInnerRadius * pixelRatio;
	return new DOMPointReadOnly(
		between(fullRadius, center.x, constants.Base.screenWidth - fullRadius),
		between(fullRadius, center.y, constants.Base.screenHeight - fullRadius)
	);
}

const rotationOneSixth = Math.PI / 6;
function getRadialPos(angle: number): DOMPointReadOnly {
	const constants = getConstants().Base;
	return new DOMPointReadOnly(
		constants.wheelInnerRadius * Math.cos(angle),
		constants.wheelInnerRadius * Math.sin(angle)
	);
}

function pointsToVector(
	a: DOMPointReadOnly,
	b: DOMPointReadOnly
): DOMPointReadOnly {
	return new DOMPointReadOnly(a.x - b.x, a.y - b.y);
}

function vectorToAngleAndDistance(v: DOMPointReadOnly): {
	angle: number;
	distance: number;
} {
	const angle = Math.atan2(v.y, v.x);
	return {
		angle: angle < 0 ? Math.PI * 2 + angle : angle,
		distance: Math.sqrt(v.x * v.x + v.y * v.y),
	};
}
