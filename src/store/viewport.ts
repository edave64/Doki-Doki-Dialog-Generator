import { CanvasAspectRatio, ToolboxSize } from '@/constants/ui';
import { defineStore } from 'pinia';
import { markRaw, ref, type Raw, type Ref } from 'vue';
import type { GenObject } from './object-types/object';
import type { Panel } from './panels';

export const useViewportStore = defineStore('viewport', {
	state: () => ({
		currentViewportCount: 0,
		viewports: {} as Record<number, Viewport>,
	}),
});

export function setUpViewport(doc: Document): Raw<Viewport> {
	const store = useViewportStore();

	// Viewport already initialized
	if (doc.body.dataset.viewportId != null)
		return markRaw(store.viewports[+doc.body.dataset.viewportId]);

	const newViewportId = store.currentViewportCount++;
	const newViewport = new Viewport(doc);

	store.viewports[newViewportId] = newViewport;

	doc.body.dataset.viewportId = newViewportId.toString();
	return markRaw(newViewport);
}

export class Viewport {
	public _selection: Ref<GenObject['id'] | null> = ref(null);
	public _pickColor = ref(false);
	public _currentPanel: Ref<Panel['id']> = ref(null!);

	private _width: Ref<number>;
	private _height: Ref<number>;

	constructor(public readonly doc: Document) {
		this._width = ref(doc.documentElement.clientWidth);
		this._height = ref(doc.documentElement.clientHeight);

		const store = useViewportStore();
		if (store.viewports[0]?.currentPanel != null) {
			this._currentPanel.value = store.viewports[0].currentPanel;
		}

		doc.defaultView!.addEventListener('resize', () => {
			this._width.value = doc.documentElement.clientWidth;
			this._height.value = doc.documentElement.clientHeight;
		});
	}

	public get width(): number {
		return this._width.value;
	}

	public get height(): number {
		return this._height.value;
	}

	public get selection(): GenObject['id'] | null {
		return this._selection.value;
	}

	public set selection(newValue: GenObject['id'] | null) {
		this._selection.value = newValue;
	}

	public get currentPanel(): Panel['id'] {
		return this._currentPanel.value;
	}

	public set currentPanel(newValue: Panel['id']) {
		this._currentPanel.value = newValue;
	}

	public get pickColor(): boolean {
		return this._pickColor.value;
	}

	public set pickColor(newValue: boolean) {
		this._pickColor.value = newValue;
	}

	public get isVertical(): boolean {
		const h = this.height;
		const w = this.width;

		return (w + ToolboxSize) / h >= CanvasAspectRatio;
	}

	public get canvasWidth() {
		if (this.isVertical) {
			const availableWidth = this.width - ToolboxSize;
			const maxWidthByRatio = this.height * CanvasAspectRatio;

			return Math.min(availableWidth, maxWidthByRatio);
		} else {
			const availableWidth = this.width;
			const maxWidthByRatio =
				(this.height - ToolboxSize) * CanvasAspectRatio;

			return Math.min(availableWidth, maxWidthByRatio);
		}
	}

	public get canvasHeight(): number {
		if (this.isVertical) {
			const availableHeight = this.height;
			const maxHeightByRatio =
				(this.width - ToolboxSize) / CanvasAspectRatio;

			return Math.min(availableHeight, maxHeightByRatio);
		} else {
			const availableHeight = this.height - ToolboxSize;
			const maxHeightByRatio = this.width / CanvasAspectRatio;

			return Math.min(availableHeight, maxHeightByRatio);
		}
	}
}
