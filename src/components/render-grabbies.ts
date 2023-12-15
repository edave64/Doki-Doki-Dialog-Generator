/**
 * This is a part of render-view that draws helpers on the screen to scale and rotate the currently selected object.
 */

import { getAssetByUrl } from '@/asset-manager';
import scale from '@/assets/open_in_full.svg';
import getConstants from '@/constants';
import { ImageAsset } from '@/render-utils/assets/image-asset';
import { between } from '@/util/math';

export function paint(ctx: CanvasRenderingContext2D, center: DOMPointReadOnly) {
	if (rotationGrabOrigin) {
		paintWhileRotating(ctx);
	} else if (scaleGrabOrigin) {
		paintWhileScaling(ctx);
	} else {
		const offsetCenter = movePointIntoView(center);
		paintRotationWheel(ctx, offsetCenter);
		paintScalingGrabby(ctx, offsetCenter);
	}
}

let rotationGrabOrigin: DOMPointReadOnly | null = null;
let scaleGrabOrigin: DOMPointReadOnly | null = null;

function onDown(event: MouseEvent) {}

function onMove(event: MouseEvent) {}

function onUp(event: MouseEvent) {}

function paintRotationWheel(
	ctx: CanvasRenderingContext2D,
	center: DOMPointReadOnly
) {
	const constants = getConstants();
	ctx.globalAlpha = 1;
	ctx.save();
	ctx.translate(center.x, center.y);
	const wheel = constants.Base.wheelInnerRadius + constants.Base.wheelWidth / 2;
	ctx.beginPath();
	ctx.ellipse(0, 0, wheel, wheel, 0, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.strokeStyle = constants.Base.WheelBackground;
	ctx.lineWidth = constants.Base.wheelWidth;
	ctx.stroke();
	ctx.restore();
}

function paintWhileScaling(ctx: CanvasRenderingContext2D) {}

let scaleImg: ImageAsset | null = null;
getAssetByUrl(scale).then((x) => {
	if (x instanceof ImageAsset) scaleImg = x;
});
function paintScalingGrabby(
	ctx: CanvasRenderingContext2D,
	center: DOMPointReadOnly
) {
	const constants = getConstants();
	ctx.save();
	ctx.translate(center.x, center.y);
	const wheel = constants.Base.wheelInnerRadius + constants.Base.wheelWidth / 2;
	ctx.translate(
		center.x > constants.Base.screenWidth / 2 ? -wheel : wheel,
		center.y >= constants.Base.screenHeight / 2 ? -wheel : wheel
	);
	if (center.x <= constants.Base.screenWidth / 2) {
		ctx.scale(1, -1);
	}
	if (center.y >= constants.Base.screenHeight / 2) {
		ctx.scale(1, -1);
	}
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
	ctx.fillStyle = constants.Base.WheelBackground;
	ctx.fill();

	if (scaleImg) scaleImg.paintOnto(ctx);
	ctx.restore();
}

function paintWhileRotating(ctx: CanvasRenderingContext2D) {}

function movePointIntoView(center: DOMPointReadOnly): DOMPointReadOnly {
	const constants = getConstants();
	const fullRadius =
		constants.Base.wheelWidth + constants.Base.wheelInnerRadius;
	return new DOMPointReadOnly(
		between(fullRadius, center.x, constants.Base.screenWidth - fullRadius),
		between(fullRadius, center.y, constants.Base.screenHeight - fullRadius)
	);
}
