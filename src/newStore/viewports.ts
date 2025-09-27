import { markRaw, reactive, type Raw } from 'vue';
import { Viewport } from './viewport';

export const viewports = reactive(
	new (class Viewports {
		private _list = [] as Raw<Viewport>[];

		constructor() {
			Object.seal(this);
		}

		get list(): readonly Raw<Viewport>[] {
			return this._list;
		}

		addViewport(viewport: Viewport) {
			this._list.push(markRaw(viewport));
		}

		removeViewport(viewport: Viewport) {
			const index = this._list.indexOf(viewport);
			if (index >= 0) {
				this._list.splice(index, 1);
			}
		}
	})()
);
