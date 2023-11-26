import getConstants from '@/constants';
import { IRootState } from '@/store';
import { Store } from 'vuex';
import { SceneRenderer } from './scene-renderer';

let sceneRenderer: SceneRenderer | null = null;

export function getMainSceneRenderer(store: Store<IRootState>) {
	if (sceneRenderer === null || sceneRenderer.disposed) {
		if (store.state.panels.currentPanel === -1) return null;
		const constants = getConstants().Base;
		sceneRenderer = new SceneRenderer(
			store,
			store.state.panels.currentPanel,
			constants.screenWidth,
			constants.screenHeight
		);
	}
	return sceneRenderer;
}
