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
import { transaction } from '@/history-engine/transaction';
import type { IAsset } from '@/render-utils/assets/asset';
import { getMainSceneRenderer } from '@/renderables/main-scene-renderer';
import { Renderable } from '@/renderables/renderable';
import { ctxScope } from '@/renderer/canvas-tools';
import type { GenObject } from '@/store/object-types/object';
import { state } from '@/store/root';
import type { Viewport } from '@/store/viewport';
import { safeAsync } from '@/util/errors';
import { between, mod } from '@/util/math';
import type { Ref } from 'vue';

const pixelRatio = window.devicePixelRatio ?? 1;

export class Grabbies {
	private dragData: IDragData | null = null;
	private grabbies = [new ScaleGrabby(), new RotateGrabby()];

	constructor(private readonly viewport: Ref<Viewport>) {}
	paint(ctx: CanvasRenderingContext2D, center: DOMPointReadOnly) {
		const offsetCenter = movePointIntoView(center);
		const viewport = this.viewport.value;

		ctx.save();
		if (this.dragData && this.dragData.viewport === viewport) {
			paintDashedLine(center, this.dragData.lastPos);
			this.dragData.grabby.paint(ctx, this.dragData);

			ctx.translate(this.dragData.lastPos.x, this.dragData.lastPos.y);
			ctx.scale(pixelRatio, pixelRatio);
			this.dragData.grabby.drawGrabby(ctx, new DOMPointReadOnly());
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
			for (let i = 0; i < this.grabbies.length; i++) {
				const grabby = this.grabbies[i];
				if (!grabby.pos) {
					grabby.pos = getRadialPos(rotationOneSixth * (i + 1));
				}
				grabby.drawGrabby(ctx, grabby.pos!);
			}
		}
		ctx.restore();

		function paintDashedLine(
			start: DOMPointReadOnly,
			end: DOMPointReadOnly
		) {
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

	onDown(pos: DOMPointReadOnly) {
		const viewport = this.viewport.value;
		const constants = getConstants();
		const grabbyHit = this.grabbies.find((grabby) => {
			const grabbyPos = grabby.lastDrawPos;
			if (!grabbyPos) return false;
			const distance = Math.sqrt(
				Math.pow(pos.x - grabbyPos.x, 2) +
					Math.pow(pos.y - grabbyPos.y, 2)
			);
			return distance <= (constants.Base.wheelWidth / 2) * pixelRatio;
		});
		if (grabbyHit) {
			this.dragData = {
				lastPos: pos,
				started: false,
				grabby: grabbyHit as Grabby,
				center: null!,
				renderObj: null!,
				viewport,
			};
			return true;
		}
		return false;
	}

	onMove(pos: DOMPointReadOnly, shift: boolean) {
		if (!this.dragData) return false;
		const viewport = this.viewport.value;
		const panels = state.panels;
		const currentPanel = panels.panels[viewport.currentPanel];
		const obj = currentPanel.objects[viewport.selection!];
		if (!this.dragData.started) {
			this.dragData.started = true;
			const sceneRenderer = getMainSceneRenderer(viewport);
			const renderObj = sceneRenderer!.getLastRenderObject(obj.id)!;
			const linkedTransform =
				sceneRenderer?.getLastRenderObject(obj.linkedTo!)
					?.preparedTransform ?? new DOMMatrixReadOnly();

			this.dragData.renderObj = renderObj;
			this.dragData.center = linkedTransform.transformPoint(
				new DOMPointReadOnly(obj.x, obj.y)
			);
			this.dragData.grabby.onStartMove(obj, this.dragData);
		}
		this.dragData.lastPos = pos;
		this.dragData.grabby.onMove(obj, shift, this.dragData);
		return true;
	}

	onDrop() {
		if (!this.dragData) return false;
		this.dragData = null;
		return true;
	}
}

const tau = 2 * Math.PI;

abstract class Grabby<T extends IDragData = IDragData> {
	public pos: DOMPointReadOnly | null = null;
	public lastDrawPos: DOMPointReadOnly | null = null;

	abstract icon: string;
	abstract iconDark: string;
	abstract onStartMove(obj: GenObject, dragData: T): void;
	abstract onMove(obj: GenObject, shift: boolean, dragData: T): void;
	abstract paint(ctx: CanvasRenderingContext2D, dragData: T): void;

	drawGrabby(ctx: CanvasRenderingContext2D, pos: DOMPointReadOnly) {
		const constants = getConstants();
		ctx.save();
		ctx.translate(pos.x, pos.y);
		this.lastDrawPos = ctx
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
			? this.iconDark
			: this.icon;
		grabbyIcons.get(icon)?.paintOnto(ctx);
		ctx.restore();
	}
}
class RotateGrabby extends Grabby<IRotationDragData> {
	public readonly icon = rotate;
	public readonly iconDark = rotateDark;

	public pos: DOMPointReadOnly | null = null;
	public lastDrawPos: DOMPointReadOnly | null = null;

	paint(
		ctx: CanvasRenderingContext2D,
		{ lastPos, center, initialDragAngle }: IRotationDragData
	) {
		const { angle } = vectorToAngleAndDistance(
			pointsToVector(center, lastPos!)
		);
		const constants = getConstants().Base;
		const normAngle = mod(initialDragAngle - angle, tau);

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
	}
	onStartMove(obj: GenObject, dragData: IRotationDragData) {
		dragData.initalObjRotation = obj.rotation;
		const { angle } = vectorToAngleAndDistance(
			pointsToVector(dragData.center, dragData.lastPos)
		);
		dragData.initialDragAngle = angle;
	}
	onMove(
		obj: GenObject,
		shift: boolean,
		{
			center,
			initalObjRotation,
			initialDragAngle,
			lastPos,
		}: IRotationDragData
	) {
		const { angle } = vectorToAngleAndDistance(
			pointsToVector(center, lastPos)
		);

		let rotation = mod(
			initalObjRotation + ((angle - initialDragAngle) / Math.PI) * 180,
			360
		);

		if (shift) {
			rotation = Math.round(rotation / 22.5) * 22.5;
		}

		if (obj.rotation === rotation) return;
		transaction(() => {
			state.panels.panels[obj.panelId].objects[obj.id].rotation =
				rotation;
		});
	}
}

class ScaleGrabby extends Grabby<IScaleDragData> {
	public readonly icon = scale;
	public readonly iconDark = scaleDark;

	public pos: DOMPointReadOnly | null = null;
	public lastDrawPos: DOMPointReadOnly | null = null;

	paint(
		ctx: CanvasRenderingContext2D,
		{ renderObj, originalObjTransform }: IScaleDragData
	) {
		if (originalObjTransform == null) return;
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
	}
	onStartMove(obj: GenObject, dragData: IScaleDragData) {
		dragData.originalObjTransform = dragData.renderObj.preparedTransform;
		dragData.initialScaleX = obj.scaleX;
		dragData.initialScaleY = obj.scaleY;
		dragData.initialDelta = pointsToVector(
			dragData.center,
			dragData.lastPos
		);
	}
	onMove(
		obj: GenObject,
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
		transaction(() => {
			state.panels.panels[obj.panelId].objects[obj.id].scaleX = scaleX;
			state.panels.panels[obj.panelId].objects[obj.id].scaleY = scaleY;
		});
	}
}

const grabbyIcons = new Map<string, IAsset>();
for (const klass of [ScaleGrabby, RotateGrabby]) {
	safeAsync('Loading grabby icon', async () => {
		const grabby = new klass();
		grabbyIcons.set(grabby.icon, await getAssetByUrl(grabby.icon));
		grabbyIcons.set(grabby.iconDark, await getAssetByUrl(grabby.iconDark));
	});
}

function movePointIntoView(center: DOMPointReadOnly): DOMPointReadOnly {
	const constants = getConstants();
	const fullRadius =
		constants.Base.wheelWidth +
		constants.Base.wheelInnerRadius * pixelRatio;
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
	grabby: Grabby<IDragData>;
	renderObj: Renderable<GenObject>;
	viewport: Viewport;
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
