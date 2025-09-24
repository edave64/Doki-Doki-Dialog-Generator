import { CanvasAspectRatio, ToolboxSize } from '@/constants/ui';
import type { IObject } from '@/store/objects';
import { defineStore } from 'pinia';
import { markRaw, ref, type Raw, type Ref } from 'vue';

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
	public _selection: Ref<IObject['id'] | null> = ref(null);
	public _pickColor = ref(false);

	private _width: Ref<number>;
	private _height: Ref<number>;

	constructor(public readonly doc: Document) {
		this._width = ref(doc.documentElement.clientWidth);
		this._height = ref(doc.documentElement.clientHeight);

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

	public get selection(): IObject['id'] | null {
		return this._selection.value;
	}

	public set selection(newValue: IObject['id'] | null) {
		this._selection.value = newValue;
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
