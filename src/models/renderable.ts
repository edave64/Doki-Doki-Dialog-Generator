import { RenderContext } from '../renderer/rendererContext';
import { IObject } from '@/store/objects';

export interface IRenderable {
	readonly id: string;
	obj: IObject;
	readonly infront: boolean;

	render(rx: RenderContext): Promise<void>;
	hitTest(hx: number, hy: number): boolean;
}
