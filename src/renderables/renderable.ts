import { RenderContext } from '@/renderer/rendererContext';

export interface IRenderable {
	readonly id: string;

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
