import getConstants from '@/constants';
import { Viewport } from '@/store/viewport';
import { SceneRenderer } from './scene-renderer';

const lookup = new WeakMap<Viewport, SceneRenderer>();

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
