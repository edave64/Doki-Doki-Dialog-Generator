import { DeepReadonly } from '@/util/readonly';
import { IObject } from '@/store/objects';
import { SpriteFilter } from '@/store/sprite_options';
import { OffscreenRenderable } from './offscreenRenderable';
import { IRootState } from '@/store';
import { Store } from 'vuex';
import { CompositeModes } from '@/renderer/rendererContext';

export abstract class ObjectRenderable<
	Obj extends IObject
> extends OffscreenRenderable {
	public constructor(protected obj: DeepReadonly<Obj>) {
		super();
	}

	public updatedContent(current: Store<DeepReadonly<IRootState>>): void {}
	public get id(): string {
		return this.obj.id;
	}

	protected get x(): number {
		return this.obj.x;
	}
	protected get y(): number {
		return this.obj.y;
	}
	protected get version(): number {
		return this.obj.version;
	}
	protected get flip(): boolean {
		return this.obj.flip;
	}
	protected get composite(): CompositeModes {
		return this.obj.composite;
	}
	protected get filters(): DeepReadonly<SpriteFilter[]> {
		return this.obj.filters;
	}
}
