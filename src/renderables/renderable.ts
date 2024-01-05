import getConstants from '@/constants';
import { SelectedState, selectionColors } from '@/constants/shared';
import { applyFilter, ctxScope } from '@/renderer/canvas-tools';
import { IRootState } from '@/store';
import { ITextBox } from '@/store/object-types/textbox';
import { IObject } from '@/store/objects';
import { IPanel } from '@/store/panels';
import { makeCanvas } from '@/util/canvas';
import { matrixEquals } from '@/util/math';
import { DeepReadonly } from 'vue';
import { Store } from 'vuex';

/**
 * An object that can be rendered onto the image. Every object type has it's own class that inherits from here.
 *
 * All object are (generally) first drawn onto a local canvas, which is then drawn onto the scene-canvas.
 * This allows us to cache objects that didn't change between renders, as well as scale objects that consist of
 * multiple images (like characters) without any gaps from rounding errors in between. It also allows objects that
 * draw over the same pixels multiple times to work properly with reduced opacity.
 *
 * If you want to render an object, you need to call the following methods in the following order:
 * - prepareData: Updates data from the vuex-store
 * - prepareTransform: Sets a new transform. Needs the transform that was returned by the prepareTransform call
 *                     of the object this object is linked to.
 * - prepareRender: May return a promise that needs to be awaited that will fetch required assets.
 * - render: Paints the object to a given canvas.
 */
export abstract class Renderable<ObjectType extends IObject> {
	public constructor(public obj: DeepReadonly<ObjectType>) {}

	public get id(): ObjectType['id'] {
		return this.obj.id;
	}

	/**
	 * Some objects can be rendered without needing a local canvas. This is handy for running on memory constrained
	 * platforms. (iPhones)
	 */
	protected get canSkipLocal(): boolean {
		return false;
	}
	/**
	 * The transform of a renderable object can either be global, where a smaller local canvas is placed on the larger
	 * global canvas, or local, where the local canvas has the same size as the global canvas and the local render
	 * function is translated onto the local canvas.
	 */
	protected get transformIsLocal(): boolean {
		return false;
	}
	protected get height(): number {
		return this.obj.height;
	}
	protected get width(): number {
		return this.obj.width;
	}
	protected get x(): number {
		return this.obj.x;
	}
	protected get y(): number {
		return this.obj.y;
	}
	/**
	 * A transform that transforms the global or local canvas (depending on transformIsLocal) to the center of the
	 * object.
	 * Also used for transforming linked objects.
	 */
	protected getTransfrom(): DOMMatrixReadOnly {
		let transform = new DOMMatrix();
		const obj = this.obj;
		transform = transform.translate(this.x, this.y);
		const h2 = (this.height / 2) * obj.scaleX;
		if ('close' in obj && obj.close) {
			transform = transform.translate(0, getConstants().Base.CloseUpYOffset);
			// const scaleOffset = 1.03 * this.height;
			transform = transform.translate(0, -h2);
			transform = transform.scale(2, 2);
			transform = transform.translate(0, h2);
		}
		if (this.isTalking && obj.enlargeWhenTalking) {
			transform = transform.translate(0, +h2);
			transform = transform.scale(1.05, 1.05);
			transform = transform.translate(0, -h2);
		}
		if (
			obj.flip ||
			obj.rotation !== 0 ||
			obj.scaleX !== 1 ||
			obj.scaleY !== 1 ||
			obj.skewX !== 0 ||
			obj.skewY !== 0
		) {
			if (obj.rotation !== 0) {
				transform = transform.rotate(0, 0, obj.rotation);
			}
			if (obj.skewX !== 0) {
				transform = transform.skewX(obj.skewX);
			}
			if (obj.skewY !== 0) {
				transform = transform.skewY(obj.skewY);
			}
			if (obj.flip) {
				transform = transform.flipX();
			}
			if (obj.scaleX !== 1 || obj.scaleY !== 1) {
				transform = transform.scale(obj.scaleX, obj.scaleY);
			}
		}
		return transform;
	}

	/**
	 * The size of the local canvas
	 */
	protected getLocalSize(): DOMPointReadOnly {
		if (this.transformIsLocal) {
			const constants = getConstants();
			return new DOMPointReadOnly(
				constants.Base.screenWidth,
				constants.Base.screenHeight
			);
		} else {
			return new DOMPointReadOnly(this.width, this.height);
		}
	}

	/**
	 * The last version of the rendered object. Used to test if an object must be rendered again.
	 */
	protected lastVersion: IObject['version'] = null!;
	protected localCanvasInvalid = true;
	protected lastHit: DOMPointReadOnly | null = null;
	protected lastLocalTransform: DOMMatrixReadOnly | null = null;
	/**
	 * Indicates if the object is currently talking, since talking objects receive a zoom of 1.05.
	 */
	protected get isTalking() {
		return this.refTextbox !== null;
	}
	protected refTextbox: ITextBox | null = null;

	public get linkedTo(): ObjectType['id'] | null {
		return this.obj.linkedTo;
	}

	/**
	 * Fetches changes in data from the vuex store.
	 *
	 * @param panel - The currently active panel
	 * @param _store - The vuex store
	 * @returns
	 */
	public prepareData(
		panel: DeepReadonly<IPanel>,
		_store: Store<DeepReadonly<IRootState>>
	): void {
		this.refTextbox = null;
		const inPanel = [...panel.order, ...panel.onTopOrder];
		for (const key of inPanel) {
			const obj = panel.objects[key] as ITextBox;
			if (obj.type === 'textBox' && obj.talkingObjId === this.obj.id) {
				this.refTextbox = obj;
				return;
			}
		}
	}

	public preparedTransform!: DOMMatrixReadOnly;
	/**
	 * Sets and returns a new 2D transform.
	 * NOTE: Must be called after prepareData, so the "enlargeWithTalking" transform functions correctly.
	 * NOTE: Must be called in order of linkage, so the this must be called after prepareTransform of the object it is
	 *       linked to. The parameter "relative" needs to be the return value of that linkedTo prepareTransform.
	 *
	 * @param relative
	 * @returns
	 */
	public prepareTransform(relative: DOMMatrixReadOnly): DOMMatrixReadOnly {
		this.preparedTransform = relative.multiply(this.getTransfrom());
		return this.preparedTransform;
	}

	/**
	 * An optionally async method that prepares the object to be rendered by resolving assets, processing the transform
	 * of linked objects, check if the object is talking, etc.
	 * Also determines if, given it's newer information, the object needs to be repainted.
	 *
	 * NOTE: Needs to be called after `prepareTransform`, to properly decide if the local canvas needs to be invalidated
	 *
	 * @param panel - The state of the objects panel
	 * @param renderables - All renderables in the current scene
	 * @param renderables - All renderables in the current scene
	 */
	public prepareRender(_lq: boolean): void | Promise<unknown> {
		if (this.lastVersion !== this.obj.version) {
			this.localCanvasInvalid = true;
			this.lastVersion = this.obj.version;
		}
		if (this.transformIsLocal) {
			const newTransform = this.preparedTransform;
			if (!matrixEquals(newTransform, this.lastLocalTransform)) {
				this.localCanvasInvalid = true;
				this.lastLocalTransform = newTransform;
			}
		} else {
			this.lastLocalTransform = null;
		}
	}

	/**
	 * Renders the object onto a canvas.
	 */
	public render(
		ctx: CanvasRenderingContext2D,
		selection: SelectedState,
		preview: boolean,
		hq: boolean,
		skipLocal: boolean
	) {
		if (!preview) selection = SelectedState.None;
		if (!this.canSkipLocal || selection !== SelectedState.None) {
			skipLocal = false;
		}
		const localCanvasSize = this.getLocalSize();
		const transform = this.preparedTransform.translate(
			-this.width / 2,
			-this.height / 2
		);
		if (
			this.localCanvas &&
			(this.localCanvas.width !== localCanvasSize.x ||
				this.localCanvas.height !== localCanvasSize.y)
		) {
			this.localCanvasInvalid = true;
		}
		if (this.localCanvasInvalid && !skipLocal) {
			if (!this.localCanvas) {
				this.localCanvas = makeCanvas();
			}
			this.localCanvas.width = localCanvasSize.x;
			this.localCanvas.height = localCanvasSize.y;
			const localCtx = this.localCanvas.getContext('2d');
			if (!localCtx)
				throw new Error('No canvas context received. Possibly out of memory?');
			if (this.transformIsLocal) {
				localCtx.setTransform(transform);
			}
			this.renderLocal(localCtx, hq);
			this.localCanvasInvalid = false;
			localCtx.resetTransform();
		}

		const shadow: string | undefined = selectionColors[selection];
		ctxScope(ctx, () => {
			if (shadow != null) {
				ctx.shadowColor = shadow;
				ctx.shadowBlur = 20;
			}
			if (!this.transformIsLocal || skipLocal) {
				ctx.setTransform(transform);
			}

			ctx.globalCompositeOperation = this.obj.composite ?? 'source-over';
			applyFilter(ctx, this.obj.filters);
			if (skipLocal) {
				this.renderLocal(ctx, hq);
			} else {
				ctx.drawImage(this.localCanvas!, 0, 0);
			}
			/*
			for (const pos of [
				[0, 0],
				[0, 0.5],
				[0, 1],
				[0.5, 0],
				[0.5, 0.5],
				[0.5, 1],
				[1, 0],
				[1, 0.5],
				[1, 1],
			]) {
				ctx.save();
				ctx.translate(pos[0] * this.width, pos[1] * this.height);
				ctx.fillStyle = pos[0] === 0.5 && pos[1] === 0.5 ? '#fff' : '#f00';
				ctx.fillRect(-2, -2, 5, 5);
				ctx.restore();
			}
			*/
		});
	}

	/**
	 * Renders objects onto the local canvas
	 */
	protected abstract renderLocal(
		ctx: CanvasRenderingContext2D,
		hq: boolean
	): void;
	public dispose(): void {}

	/**
	 * Sometimes, the pixel-perfect hit detection fails on some browsers in some contexts. E.g. CORS can mark sprites as
	 * tainted, preventing data reads. So instead of trying every time, we note when pixel perfect detection doesn't
	 * work and skip it the next time.
	 */
	private hitDetectionFallback = false;
	public hitTest(point: DOMPointReadOnly) {
		const transposed = point.matrixTransform(
			this.preparedTransform
				.translate(-this.width / 2, -this.height / 2)
				.inverse()
		);
		// Step 1: Simple hitbox test;
		const localSize = this.getLocalSize();
		if (
			transposed.x < 0 ||
			transposed.y < 0 ||
			transposed.x > localSize.x ||
			transposed.y > localSize.y
		) {
			console.log('Hitbox text', transposed);
			return false;
		}
		if (
			this.hitDetectionFallback ||
			!this.localCanvas ||
			this.localCanvasInvalid
		)
			return true;

		// Pixel perfect hit test
		try {
			const target = this.transformIsLocal ? point : transposed;
			this.lastHit = target;
			const ctx = this.localCanvas.getContext('2d', {
				willReadFrequently: true,
			})!;
			const data = ctx.getImageData(target.x | 0, target.y | 0, 1, 1).data;
			// Return if the image isn't completely transparent
			return data[3] !== 0;
		} catch (e) {
			this.hitDetectionFallback = true;
			throw e;
		}
	}

	private localCanvas: HTMLCanvasElement | null = null;
}
