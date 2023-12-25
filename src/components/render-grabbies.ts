/**
 * This is a part of render-view that draws helpers on the screen to scale and rotate the currently selected object.
 */

import { getAssetByUrl } from '@/asset-manager';
import scale from '@/assets/open_in_full.svg';
import scaleDark from '@/assets/open_in_full_dark.svg';
import rotate from '@/assets/rotate_left.svg';
import rotateDark from '@/assets/rotate_left_dark.svg';
import getConstants from '@/constants';
import { SelectedState } from '@/constants/shared';
import { IAsset } from '@/render-utils/assets/asset';
import { getMainSceneRenderer } from '@/renderables/main-scene-renderer';
import { Renderable } from '@/renderables/renderable';
import { ctxScope } from '@/renderer/canvas-tools';
import { RStore } from '@/store';
import {
	IObject,
	ISetObjectScaleMutation,
	ISetSpriteRotationMutation,
} from '@/store/objects';
import { safeAsync } from '@/util/errors';
import { between, mod } from '@/util/math';

const pixelRatio = window.devicePixelRatio ?? 1;

export function paint(ctx: CanvasRenderingContext2D, center: DOMPointReadOnly) {
	const offsetCenter = movePointIntoView(center);

	ctx.save();
	if (dragData) {
		paintDashedLine(center, dragData.lastPos);
		dragData.grabby.paint(ctx, dragData);

		ctx.translate(dragData.lastPos.x, dragData.lastPos.y);
		ctx.scale(pixelRatio, pixelRatio);
		drawGrabby(ctx, dragData.grabby, new DOMPointReadOnly());
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

	function paintDashedLine(start: DOMPointReadOnly, end: DOMPointReadOnly) {
		ctx.save();
		try {
			ctx.beginPath();
			ctx.moveTo(start.x, start.y);
			ctx.lineTo(end.x, end.y);
			ctx.setLineDash([5 * pixelRatio, 5 * pixelRatio]);
			ctx.strokeStyle = '#000';
			ctx.stroke();
			ctx.closePath();
		} finally {
			ctx.restore();
		}
	}
}

const tau = 2 * Math.PI;

const grabbies: Grabby[] = [
	{
		icon: rotate,
		iconDark: rotateDark,
		paint(
			ctx: CanvasRenderingContext2D,
			{ lastPos, center, initialDragAngle }: IRotationDragData
		) {
			const { angle } = vectorToAngleAndDistance(
				pointsToVector(center, lastPos!)
			);
			const constants = getConstants().Base;
			let normAngle = mod(initialDragAngle - angle, tau);

			ctx.beginPath();
			ctx.moveTo(center.x, center.y);
			let start = initialDragAngle - Math.PI;
			let end = start + angle - initialDragAngle;

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
		onStartMove(store: RStore, obj: IObject, dragData: IRotationDragData) {
			dragData.initalObjRotation = obj.rotation;
			const { angle } = vectorToAngleAndDistance(
				pointsToVector(dragData.center, dragData.lastPos)
			);
			dragData.initialDragAngle = angle;
		},
		onMove(
			store: RStore,
			obj: IObject,
			shift: boolean,
			{ center, initalObjRotation, initialDragAngle }: IRotationDragData
		) {
			const { angle } = vectorToAngleAndDistance(
				pointsToVector(center, dragData!.lastPos)
			);

			let rotation = mod(
				initalObjRotation + ((angle - initialDragAngle) / Math.PI) * 180,
				360
			);

			if (shift) {
				rotation = Math.round(rotation / 22.5) * 22.5;
			}

			if (obj.rotation === rotation) return;
			store.commit('panels/setRotation', {
				panelId: obj.panelId,
				id: obj.id,
				rotation,
			} as ISetSpriteRotationMutation);
		},
	},
	{
		icon: scale,
		iconDark: scaleDark,
		paint(
			ctx: CanvasRenderingContext2D,
			{ renderObj, originalObjTransform }: IScaleDragData
		) {
			if (!originalObjTransform) return;
			const currentTransform = renderObj.preparedTransform;
			try {
				renderObj.preparedTransform = originalObjTransform;
				ctxScope(ctx, () => {
					ctx.globalAlpha = 0.5;
					renderObj.render(ctx, SelectedState.None, true, false, true);
					ctx.globalAlpha = 1;
				});
			} finally {
				renderObj.preparedTransform = currentTransform;
			}
		},
		onStartMove(store: RStore, obj: IObject, dragData: IScaleDragData) {
			dragData.originalObjTransform = dragData.renderObj.preparedTransform;
			dragData.initialScaleX = obj.scaleX;
			dragData.initialScaleY = obj.scaleY;
			dragData.initialDelta = pointsToVector(dragData.center, dragData.lastPos);
		},
		onMove(
			store: RStore,
			obj: IObject,
			shift: boolean,
			{
				initialScaleX,
				initialScaleY,
				initialDelta,
				center,
				lastPos,
			}: IScaleDragData
		) {
			const constants = getConstants();
			const currentDelta = pointsToVector(center, lastPos);
			let scaleX = (currentDelta.x / initialDelta.x) * initialScaleX;
			let scaleY = (currentDelta.y / initialDelta.y) * initialScaleY;

			if (shift) {
				let startAdjustedDelta = currentDelta;
				if (center.x > constants.Base.screenWidth / 2) {
					startAdjustedDelta = new DOMPointReadOnly(
						-startAdjustedDelta.x,
						startAdjustedDelta.y
					);
				}
				if (center.y > constants.Base.screenHeight / 2) {
					startAdjustedDelta = new DOMPointReadOnly(
						startAdjustedDelta.x,
						-startAdjustedDelta.y
					);
				}

				const { angle } = vectorToAngleAndDistance(startAdjustedDelta);
				const angleDirection = Math.round((angle / tau) * 11);
				const avg =
					(Math.abs(currentDelta.x) / Math.abs(initialDelta.x) +
						Math.abs(currentDelta.y) / Math.abs(initialDelta.y)) /
					2;

				if (angleDirection === 0 || angleDirection === 11) {
					scaleY = initialScaleY;
				} else if (angleDirection === 1) {
					scaleX = -avg * initialScaleX;
					scaleY = -avg * initialScaleY;
				} else if (angleDirection === 2 || angleDirection === 3) {
					scaleX = initialScaleX;
				} else if (angleDirection === 4) {
					scaleX = avg * initialScaleX;
					scaleY = -avg * initialScaleY;
				} else if (angleDirection === 5 || angleDirection === 6) {
					scaleY = initialScaleY;
				} else if (angleDirection === 7) {
					scaleX = avg * initialScaleX;
					scaleY = avg * initialScaleY;
				} else if (angleDirection === 8 || angleDirection === 9) {
					scaleX = initialScaleX;
				} else if (angleDirection === 10) {
					scaleX = -avg * initialScaleX;
					scaleY = avg * initialScaleY;
				}
			}

			if (obj.scaleX === scaleX && obj.scaleY === scaleY) return;
			store.commit('panels/setObjectScale', {
				panelId: obj.panelId,
				id: obj.id,
				scaleX,
				scaleY,
			} as ISetObjectScaleMutation);
		},
	},
];

let dragData: IDragData | null = null;

export function onDown(pos: DOMPointReadOnly) {
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
		dragData = {
			lastPos: pos,
			started: false,
			grabby: grabbyHit,
			center: null!,
			renderObj: null!,
		};
		return true;
	}
	return false;
}

export function onMove(store: RStore, pos: DOMPointReadOnly, shift: boolean) {
	if (!dragData) return false;
	const panels = store.state.panels;
	const currentPanel = panels.panels[panels.currentPanel];
	const obj = currentPanel.objects[store.state.ui.selection!];
	if (!dragData.started) {
		dragData.started = true;
		const sceneRenderer = getMainSceneRenderer(store);
		const renderObj = sceneRenderer?.getLastRenderObject(obj.id)!;
		const linkedTransform =
			sceneRenderer?.getLastRenderObject(obj.linkedTo!)?.preparedTransform ??
			new DOMMatrixReadOnly();

		dragData.renderObj = renderObj;
		dragData.center = linkedTransform.transformPoint(
			new DOMPointReadOnly(obj.x, obj.y)
		);
		dragData.grabby.onStartMove(store, obj, dragData);
	}
	dragData.lastPos = pos;
	dragData.grabby.onMove(store, obj, shift, dragData);
	return true;
}

export function onDrop() {
	if (!dragData) return false;
	dragData = null;
	return true;
}

const grabbyIcons = new Map<string, IAsset>();
for (const grabby of grabbies) {
	safeAsync(
		'Loading grabby icon',
		(async (grabby: Grabby) => {
			grabbyIcons.set(grabby.icon, await getAssetByUrl(grabby.icon));
			grabbyIcons.set(grabby.iconDark, await getAssetByUrl(grabby.iconDark));
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
		tau
	);
	ctx.closePath();
	const style = getComputedStyle(document.body);
	ctx.fillStyle = style.getPropertyValue('--accent-background');
	ctx.strokeStyle = style.getPropertyValue('--border');
	ctx.lineWidth = 2;
	ctx.fill();
	ctx.stroke();
	const icon = document.body.classList.contains('dark-theme')
		? grabby.iconDark
		: grabby.icon;
	grabbyIcons.get(icon)?.paintOnto(ctx);
	ctx.restore();
}

interface Grabby {
	icon: string;
	iconDark: string;
	onStartMove: (store: RStore, obj: IObject, dragData: any) => void;
	onMove: (store: RStore, obj: IObject, shift: boolean, dragData: any) => void;
	paint: (ctx: CanvasRenderingContext2D, dragData: any) => void;
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
		angle: mod(angle, tau),
		distance: Math.sqrt(v.x * v.x + v.y * v.y),
	};
}

interface IDragData {
	lastPos: DOMPointReadOnly;
	center: DOMPointReadOnly;
	started: boolean;
	grabby: Grabby;
	renderObj: Renderable<IObject>;
}

interface IRotationDragData extends IDragData {
	initialDragAngle: number;
	initalObjRotation: number;
}

interface IScaleDragData extends IDragData {
	initialDelta: DOMPointReadOnly;
	initialScaleX: number;
	initialScaleY: number;
	originalObjTransform: DOMMatrixReadOnly;
}
