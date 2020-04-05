import { RenderContext } from '@/renderer/rendererContext';
import { DeepReadonly } from '@/util/readonly';
import { Store } from 'vuex';
import { IRootState } from '@/store';

export interface IRenderable {
	readonly id: string;

	updatedContent(current: DeepReadonly<Store<IRootState>>): void;
	render(selected: boolean, rx: RenderContext): Promise<void>;
	hitTest(hx: number, hy: number): boolean;
	getHitbox(): IHitbox;
}

export interface IHitbox {
	x0: number;
	x1: number;
	y0: number;
	y1: number;
}
