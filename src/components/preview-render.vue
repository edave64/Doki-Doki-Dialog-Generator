<!--
	Displays the preview render that makes up most of the user interface
-->
<template>
	<canvas
		id="scaled_display"
		ref="sd"
		:height="bitmapHeight"
		:width="bitmapWidth"
		:style="{
			width: canvasWidth + 'px',
			height: canvasHeight + 'px',
			cursor,
		}"
		draggable="true"
		@click="onUiClick"
		@touchstart="onTouchStart"
		@dragstart="onDragStart"
		@touchmove="onSpriteDragMove"
		@mousemove="onSpriteDragMove"
		@touchend="onSpriteDrop"
		@mouseup="onSpriteDrop"
		@dragover="onDragOver"
		@drop="onDrop"
		@mouseenter="onMouseEnter"
		@contextmenu.prevent
	>
		HTML5 is required to use the Doki Doki Dialog Generator.
	</canvas>
</template>

<script lang="ts" setup>
import { imagePromise } from '@/asset-manager';
import getConstants from '@/constants';
import eventBus, {
	ColorPickedEvent,
	InvalidateRenderEvent,
	RenderUpdatedEvent,
	StateLoadingEvent,
} from '@/eventbus/event-bus';
import { useSelection, useViewport } from '@/hooks/use-viewport';
import { transaction } from '@/plugins/vuex-history';
import { getMainSceneRenderer } from '@/renderables/main-scene-renderer';
import { RenderContext } from '@/renderer/renderer-context';
import { useStore } from '@/store';
import type { ICreateSpriteAction } from '@/store/object-types/sprite';
import type { IObject, ISetObjectPositionMutation } from '@/store/objects';
import { disposeCanvas } from '@/util/canvas';
import { isMouseEvent, isTouchEvent } from '@/util/cross-realm';
import type { DeepReadonly } from 'ts-essentials';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { MutationPayload } from 'vuex';
import { Grabbies } from './render-grabbies';

const props = withDefaults(
	defineProps<{
		canvasWidth?: number;
		canvasHeight?: number;
		preLoading?: boolean;
	}>(),
	{ preLoading: false, canvasWidth: 0, canvasHeight: 0 }
);

const store = useStore();
const sd = ref(null! as HTMLCanvasElement);
const sdCtx = ref(null! as CanvasRenderingContext2D);
const queuedRender = ref(null as null | number);
const showingLast = ref(false);
const dropPreventClick = ref(false);
const viewport = useViewport();

const grabbies = new Grabbies(viewport);

const selection = useSelection();
const currentPanel = computed(
	() => store.state.panels.panels[viewport.value.currentPanel]
);
const lqRendering = computed(() => store.state.ui.lqRendering);
function getSceneRender() {
	if (props.preLoading) return null!;
	const renderer = getMainSceneRenderer(store, viewport.value);
	renderer?.setPanelId(viewport.value.currentPanel);
	return renderer;
}
const bitmapHeight = computed(() => {
	// Stupid hack to make vue reevaluate this property when loading is done.
	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	props.preLoading;
	return getConstants().Base.screenHeight;
});
const bitmapWidth = computed(() => {
	// Stupid hack to make vue reevaluate this property when loading is done.
	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	props.preLoading;
	return getConstants().Base.screenWidth;
});

function invalidateRender() {
	if (queuedRender.value != null) return;
	queuedRender.value = requestAnimationFrame(render_);
}
async function render_(): Promise<void> {
	if (queuedRender.value != null) {
		cancelAnimationFrame(queuedRender.value);
		queuedRender.value = null;
	}
	if (props.preLoading) return;
	if (store.state.unsafe) return;

	try {
		await getSceneRender()?.render(!lqRendering.value, true, true);
	} catch (e) {
		console.log(e);
	}
	display();
	eventBus.fire(new RenderUpdatedEvent());
}
function renderLoadingScreen() {
	const loadingScreen = document.createElement('canvas');
	loadingScreen.height = bitmapHeight.value;
	loadingScreen.width = bitmapWidth.value;
	try {
		const rctx = RenderContext.make(loadingScreen, true, false);
		rctx.drawText({
			text: 'Starting...',
			x: loadingScreen.width / 2,
			y: loadingScreen.height / 2,
			align: 'center',
			outline: {
				width: 5,
				style: '#b59',
			},
			font: '32px riffic',
			fill: {
				style: 'white',
			},
		});
		sdCtx.value!.drawImage(
			loadingScreen,
			props.canvasWidth,
			props.canvasHeight
		);
	} finally {
		disposeCanvas(loadingScreen);
	}
}
function display(): void {
	const renderer = getSceneRender();
	showingLast.value = false;
	renderer?.paintOnto(sdCtx.value, {
		x: 0,
		y: 0,
		w: bitmapWidth.value,
		h: bitmapHeight.value,
	});

	const obj = renderer?.getLastRenderObject(selection.value!);
	if (obj) {
		grabbies.paint(
			sdCtx.value,
			obj.preparedTransform.transformPoint(new DOMPoint(0, 0))
		);
	}

	inBlendOver.value = false;
}
function toRendererCoordinate(
	x: number,
	y: number,
	transform?: DOMMatrixReadOnly
): [number, number] {
	const canvas = sd.value as HTMLCanvasElement;
	const rx = x - canvas.offsetLeft;
	const ry = y - canvas.offsetTop;
	let sx = (rx / canvas.offsetWidth) * canvas.width;
	let sy = (ry / canvas.offsetWidth) * canvas.width;
	if (transform) {
		const point = transform.transformPoint(new DOMPointReadOnly(sx, sy));
		sx = point.x;
		sy = point.y;
	}
	return [sx, sy];
}
function onUiClick(e: MouseEvent): void {
	const [sx, sy] = toRendererCoordinate(e.clientX, e.clientY);

	if (handleColorPickerClick(sx, sy)) return;

	if (dropPreventClick.value) {
		dropPreventClick.value = false;
		return;
	}

	const objects = getSceneRender()!.objectsAt(sx, sy);
	const selectionId = selection.value;

	const currentObjectIdx = objects.findIndex((id) => id === selectionId);
	let selectedObject: IObject['id'] | null;

	if (currentObjectIdx === 0) {
		selectedObject = null;
	} else if (currentObjectIdx !== -1) {
		// Select the next lower character
		selectedObject = objects[currentObjectIdx - 1];
	} else {
		selectedObject = objects[objects.length - 1] ?? null;
	}

	transaction(() => {
		if (viewport.value.selection === selectedObject) return;
		viewport.value.selection = selectedObject;
	});
}

watch(
	() => [props.canvasWidth, props.canvasHeight],
	() => display()
);

eventBus.subscribe(InvalidateRenderEvent, invalidateRender);
eventBus.subscribe(StateLoadingEvent, () => {
	const cache = getSceneRender();
	if (cache) {
		cache.setPanelId(-1);
	}
});
store.subscribe((mut: MutationPayload) => {
	if (mut.type === 'panels/setPanelPreview') return;
	if (mut.type === 'panels/currentPanel') return;
	invalidateRender();
});

watch(
	() => [selection.value, viewport.value.currentPanel],
	() => {
		invalidateRender();
	}
);

onMounted(() => {
	sdCtx.value = sd.value.getContext('2d')!;

	renderLoadingScreen();
	invalidateRender();
});

onUnmounted(() => {
	getSceneRender()!.dispose();
});
//#region Blend over
const inBlendOver = ref(false);
async function blendOver(url: string) {
	if (inBlendOver.value) {
		render_();
		inBlendOver.value = false;
	} else {
		const image = await imagePromise(url, true);
		sdCtx.value.clearRect(0, 0, sd.value.width, sd.value.height);
		image.paintOnto(sdCtx.value, {
			x: 0,
			y: 0,
		});
		inBlendOver.value = true;
	}
}
//#endregion Blend over
//#endregion picker
//#region picker
const pickerMode = computed(() => viewport.value.pickColor);
const cursor = computed((): 'default' | 'crosshair' =>
	pickerMode.value ? 'crosshair' : 'default'
);
function handleColorPickerClick(sx: number, sy: number) {
	if (pickerMode.value) {
		const data = sdCtx.value.getImageData(sx, sy, 1, 1).data;
		const hex = `rgba(${data[0].toString()},${data[1].toString()},${data[2].toString()},${(
			data[3] / 255
		).toString()})`;
		transaction(() => {
			store.commit('ui/setColorPicker', false);
			eventBus.fire(new ColorPickedEvent(hex));
		});
		return true;
	}
	return false;
}
//#endregion picker
//#region download
async function download(): Promise<void> {
	const url = await getSceneRender()!.download();

	await transaction(() => {
		const oldUrl = store.state.ui.lastDownload;

		store.commit('ui/setLastDownload', url);
		if (oldUrl != null) {
			URL.revokeObjectURL(oldUrl);
		}
	});
}
//#endregion download
//#region drag and drop
let draggedObject: DeepReadonly<IObject> | null = null;
let dragTransform: DOMMatrixReadOnly = null!;
let dragXOffset = 0;
let dragYOffset = 0;
let dragXOriginal = 0;
let dragYOriginal = 0;

function onDragStart(e: DragEvent) {
	e.preventDefault();
	dragStart(e.clientX, e.clientY);
}

function onTouchStart(e: TouchEvent) {
	dragStart(e.touches[0].clientX, e.touches[0].clientY);
}

function dragStart(rx: number, ry: number) {
	const selectionId = selection.value;
	if (selectionId === null) return;

	draggedObject = currentPanel.value.objects[selectionId];
	dragTransform =
		getMainSceneRenderer(store, viewport.value)!
			.getLastRenderObject(draggedObject.linkedTo!)
			?.preparedTransform?.inverse() ?? new DOMMatrixReadOnly();
	const [x, y] = toRendererCoordinate(rx, ry, dragTransform);

	if (
		selectionId != null &&
		grabbies.onDown(new DOMPointReadOnly(...toRendererCoordinate(rx, ry)))
	)
		return;

	dragXOffset = x - draggedObject.x;
	dragYOffset = y - draggedObject.y;
	dragXOriginal = draggedObject.x;
	dragYOriginal = draggedObject.y;
}

function onDragOver(e: DragEvent) {
	e.stopPropagation();
	e.preventDefault();
	e.dataTransfer!.dropEffect = 'copy';
}
function onSpriteDragMove(e: MouseEvent | TouchEvent) {
	if (!draggedObject) return;
	e.preventDefault();
	const oX = isMouseEvent(e) ? e.clientX : e.touches[0].clientX;
	const oY = isMouseEvent(e) ? e.clientY : e.touches[0].clientY;
	let [x, y] = toRendererCoordinate(oX, oY, dragTransform);
	if (
		grabbies.onMove(
			store,
			new DOMPointReadOnly(...toRendererCoordinate(oX, oY)),
			e.shiftKey
		)
	) {
		invalidateRender();
		return;
	}
	x -= dragXOffset;
	y -= dragYOffset;
	const deltaX = Math.abs(x - dragXOriginal);
	const deltaY = Math.abs(y - dragYOriginal);
	if (deltaX + deltaY > 1) dropPreventClick.value = true;
	if (e.shiftKey) {
		if (deltaX > deltaY) {
			y = dragYOriginal;
		} else {
			x = dragXOriginal;
		}
	}
	transaction(async () => {
		await store.dispatch('panels/setPosition', {
			panelId: draggedObject!.panelId,
			id: draggedObject!.id,
			x,
			y,
		} as ISetObjectPositionMutation);
	});
}
async function onDrop(e: DragEvent) {
	e.stopPropagation();
	e.preventDefault();

	if (!e.dataTransfer) return;

	for (const item of e.dataTransfer.items) {
		if (item.kind === 'file' && item.type.match(/image.*/)) {
			const file = item.getAsFile()!;
			const url = URL.createObjectURL(file);
			try {
				const assetUrl: string = await store.dispatch(
					'uploadUrls/add',
					{
						name: file.name,
						url,
					}
				);

				await transaction(async () => {
					await store.dispatch('panels/createSprite', {
						panelId: viewport.value.currentPanel,
						assets: [
							{
								hq: assetUrl,
								lq: assetUrl,
								sourcePack: 'dddg.uploaded.sprites',
							},
						],
					} as ICreateSpriteAction);
				});
			} catch {
				URL.revokeObjectURL(url);
			}
		}
	}
}
function onSpriteDrop(e: MouseEvent | TouchEvent) {
	if (grabbies.onDrop()) {
		invalidateRender();
		e.preventDefault();
		draggedObject = null;
		dropPreventClick.value = true;
		return;
	}
	if (draggedObject) {
		if ('TouchEvent' in window && isTouchEvent(e)) {
			dropPreventClick.value = false;
		}
		draggedObject = null;
	}
}
function onMouseEnter(e: MouseEvent) {
	if (e.buttons !== 1) {
		draggedObject = null;
		if (grabbies.onDrop()) {
			invalidateRender();
		}
	}
}
//#endregion drag and drop
defineExpose({ download, blendOver });
</script>

<style lang="scss">
canvas {
	position: fixed;
	display: block;
	user-select: none;
	-webkit-user-select: none;
}
</style>
