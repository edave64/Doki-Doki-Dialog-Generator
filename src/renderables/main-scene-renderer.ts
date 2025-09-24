import getConstants from '@/constants';
import { Viewport } from '@/newStore/viewport';
import type { IRootState } from '@/store';
import { Store } from 'vuex';
import { SceneRenderer } from './scene-renderer';

const lookup = new WeakMap<Viewport, SceneRenderer>();

export function getMainSceneRenderer(
	store: Store<IRootState> | null,
	viewport: Viewport
) {
	let sceneRenderer = lookup.get(viewport);
	if (sceneRenderer == null || sceneRenderer.disposed) {
		if (store == null) return null;
		if (store.state.panels.currentPanel === -1) return null;
		const constants = getConstants().Base;
		sceneRenderer = new SceneRenderer(
			store,
			store.state.panels.currentPanel,
			constants.screenWidth,
			constants.screenHeight,
			viewport
		);
		lookup.set(viewport, sceneRenderer);
	}
	return sceneRenderer;
}
