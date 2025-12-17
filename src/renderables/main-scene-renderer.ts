import getConstants from '@/constants';
import type { Viewport } from '@/store/viewports';
import { SceneRenderer } from './scene-renderer';

const lookup = new WeakMap<Viewport, SceneRenderer>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).asdwefweg = lookup;

export function getMainSceneRenderer(viewport: Viewport) {
	let sceneRenderer = lookup.get(viewport);
	if (sceneRenderer == null || sceneRenderer.disposed) {
		if (viewport.currentPanel === -1) return null;
		const constants = getConstants().Base;
		sceneRenderer = new SceneRenderer(
			viewport.currentPanel,
			constants.screenWidth,
			constants.screenHeight,
			viewport
		);
		lookup.set(viewport, sceneRenderer);
	}
	return sceneRenderer;
}
