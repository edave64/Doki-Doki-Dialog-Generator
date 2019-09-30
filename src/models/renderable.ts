import { RenderContext } from '../renderer/rendererContext';

export interface IRenderable {
	id: string;
	readonly infront: boolean;

	render(rx: RenderContext): Promise<void>;
	hitTest(hx: number, hy: number): boolean;
}
