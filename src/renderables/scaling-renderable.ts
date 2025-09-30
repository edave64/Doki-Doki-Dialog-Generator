import envX from '@/environments/environment';
import type { GenObject } from '@/store/object-types/object';
import { Renderable } from './renderable';

/**
 * A scaling renderable is a component drawn from pure code, that can be scaled to any size without pixelation.
 * Because of text overflow, this components can paint over it's border, requireing us to allocate a local canvas
 * of the same size as the main canvas.
 */
export abstract class ScalingRenderable<
	Obj extends GenObject,
> extends Renderable<Obj> {
	protected get canSkipLocal(): boolean {
		return (
			this.obj.composite === 'source-over' &&
			this.obj.filters.length === 0
		);
	}
	protected get transformIsLocal(): boolean {
		const transform = this.obj.globalTransform;
		if ('overflow' in this.obj && this.obj.overflow) return true;
		if (envX.supports.limitedCanvasSpace) return false;
		// Test if the transform one does translation. Anything else looks blury when you first render and then
		// transform
		return !(
			transform.a === 1 &&
			transform.b === 0 &&
			transform.c === 0 &&
			transform.d === 1
		);
	}
}
