import { CanvasAspectRatio, ToolboxSize } from '@/constants/ui';
import { markRaw, reactive, ref, type Raw, type Ref } from 'vue';
import type { GenObject } from './object-types/object';
import type { Panel } from './panels';
import { state } from './root';

export const viewports = reactive(
	new (class Viewports {
		private _list: Record<number, Raw<Viewport>> = {};
		private _currentViewportCount = 0;

		constructor() {
			Object.seal(this);
		}

		get list(): readonly Raw<Viewport>[] {
			return Object.values(this._list);
		}

		setUpViewport(doc: Document): Raw<Viewport> {
			// Viewport already initialized
			if (doc.body.dataset.viewportId != null)
				return markRaw(this.list[+doc.body.dataset.viewportId]);

			const newViewportId = this._currentViewportCount++;
			const newViewport = new Viewport(doc);

			this._list[newViewportId] = markRaw(newViewport);

			doc.defaultView!.addEventListener('close', (e) => {
				this.removeViewport(e.target as Document);
			});

			doc.body.dataset.viewportId = newViewportId.toString();
			return markRaw(newViewport);
		}

		removeViewport(doc: Document) {
			if (doc.body.dataset.viewportId == null) return;
			const viewportId = +doc.body.dataset.viewportId;
			if (viewportId == null) return;
			delete this._list[viewportId];
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		loadSave(data: any) {
			if (data.currentPanel != null) {
				const primary = this._list[0];
				if (!primary) return;
				primary.currentPanel = data.currentPanel;
			}
			const firstPanel = state.panels.panels[0];

			for (const viewport of this.list) {
				if (!state.panels.panels[viewport.currentPanel]) {
					viewport.currentPanel = firstPanel.id;
				}
				const panel = state.panels.panels[viewport.currentPanel];
				if (panel.objects[viewport.selection!] === undefined) {
					viewport.selection = null;
				}
			}
		}
	})()
);

export class Viewport {
	public _selection: Ref<GenObject['id'] | null> = ref(null);
	public _pickColor = ref(false);
	public _currentPanel: Ref<Panel['id']> = ref(null!);

	private _width: Ref<number>;
	private _height: Ref<number>;

	constructor(public readonly doc: Document) {
		this._width = ref(doc.documentElement.clientWidth);
		this._height = ref(doc.documentElement.clientHeight);

		if (viewports.list[0]?.currentPanel != null) {
			this._currentPanel.value = viewports.list[0].currentPanel;
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
