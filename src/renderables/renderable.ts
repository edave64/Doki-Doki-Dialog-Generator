import getConstants from '@/constants';
import { ctxScope } from '@/renderer/canvas-tools';
import { IRootState } from '@/store';
import { ITextBox } from '@/store/object-types/textbox';
import { IObject } from '@/store/objects';
import { IPanel } from '@/store/panels';
import { makeCanvas } from '@/util/canvas';
import { matrixEquals } from '@/util/math';
import { DeepReadonly } from 'vue';
import { Store } from 'vuex';
import { SelectedState } from './offscreen-renderable';

/**
 * An object that can be rendered onto the image. Every object type has it's own class that inherits from here.
 *
 * All object are (generally) first drawn onto a local canvas, which is then drawn onto the scene-canvas.
 * This allows us to cache objects that didn't change between renders, as well as scale objects that consist of
 * multiple images (like characters) without any gaps from rounding errors in between. It also allows objects that
 * draw over the same pixels multiple times to work properly with reduced opacity.
 */
export abstract class Renderable<ObjectType extends IObject> {
	public constructor(public obj: DeepReadonly<ObjectType>) {}

	public get id() {
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
		transform = transform.translate(
			this.x - this.width / 2,
			this.y - this.height / 2
		);
		if (this.isTalking && obj.enlargeWhenTalking) {
			transform = transform.translate(+this.width / 2, +this.height);
			transform = transform.scale(1.05, 1.05);
			transform = transform.translate(-this.width / 2, -this.height);
		}
		if (
			obj.flip ||
			obj.rotation !== 0 ||
			obj.scaleX !== 1 ||
			obj.scaleY !== 1 ||
			obj.skewX !== 0 ||
			obj.skewY !== 0
		) {
			transform = transform.translate(+this.width / 2, +this.height / 2);
			if (obj.rotation !== 0) {
				transform = transform.rotate(0, 0, obj.rotation);
			}
			if (obj.skewX !== 1) {
				transform = transform.skewX(obj.skewX);
			}
			if (obj.skewY !== 1) {
				transform = transform.skewY(obj.skewY);
			}
			if (obj.flip) {
				transform = transform.flipX();
			}
			if (obj.scaleX !== 1 || obj.scaleY !== 1) {
				transform = transform.scale(obj.scaleX, obj.scaleY);
			}
			transform = transform.translate(-this.width / 2, -this.height / 2);
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

	/**
	 * An optionally async method that prepares the object to be rendered by resolving assets, processing the transform
	 * of linked objects, check if the object is talking, etc.
	 * Also determines if, given it's newer information, the object needs to be repainted.
	 *
	 * @param panel - The state of the objects panel
	 * @param renderables - All renderables in the current scene
	 * @param renderables - All renderables in the current scene
	 */
	public prepareRender(
		panel: DeepReadonly<IPanel>,
		_store: Store<IRootState>,
		_renderables: Map<IObject['id'], DeepReadonly<Renderable<never>>>,
		_lq: boolean
	): void | Promise<unknown> {
		if (this.lastVersion !== this.obj.version) {
			this.localCanvasInvalid = true;
			this.lastVersion = this.obj.version;
		}
		if (this.transformIsLocal) {
			const newTransform = this.getTransfrom();
			if (!matrixEquals(newTransform, this.lastLocalTransform)) {
				this.localCanvasInvalid = true;
				this.lastLocalTransform = newTransform;
			}
		} else {
			this.lastLocalTransform = null;
		}

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
				localCtx.setTransform(this.getTransfrom());
			}
			this.renderLocal(localCtx, hq);
			this.localCanvasInvalid = false;
			localCtx.resetTransform();
		}

		const shadow: string | undefined = {
			[SelectedState.None]: undefined,
			[SelectedState.Selected]: 'red',
			[SelectedState.Focused]: 'blue',
			[SelectedState.Both]: 'purple',
		}[selection];
		ctxScope(ctx, () => {
			if (shadow != null) {
				ctx.shadowColor = shadow;
				ctx.shadowBlur = 20;
			}
			if (!this.transformIsLocal || skipLocal) {
				ctx.setTransform(this.getTransfrom());
			}

			ctx.globalCompositeOperation = this.obj.composite ?? 'source-over';
			if (skipLocal) {
				//ctx.translate(-this.width / 2, -this.height);
				this.renderLocal(ctx, hq);
			} else {
				ctx.drawImage(this.localCanvas!, 0, 0);
			}
			// if (this.lastHit) {
			// 	ctx.fillStyle = '#00f';
			// 	ctx.lineWidth = 1;
			// 	ctx.strokeStyle = '#fff';
			// 	ctx.fillRect(this.lastHit.x - 2, this.lastHit.y - 2, 5, 5);
			// 	ctx.strokeRect(this.lastHit.x - 2, this.lastHit.y - 2, 5, 5);
			// }
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
		const transposed = point.matrixTransform(this.getTransfrom().inverse());
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
			const ctx = this.localCanvas.getContext('2d')!;
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
