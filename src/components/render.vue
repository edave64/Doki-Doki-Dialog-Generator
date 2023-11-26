<!--
	Displays the preview render that makes up most of the user interface
-->
<template>
	<canvas
		id="scaled_display"
		ref="sd"
		:height="bitmapHeight"
		:width="bitmapWidth"
		:style="{ width: canvasWidth + 'px', height: canvasHeight + 'px', cursor }"
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
import { transaction } from '@/plugins/vuex-history';
import { getMainSceneRenderer } from '@/renderables/main-scene-renderer';
import { RenderContext } from '@/renderer/renderer-context';
import { useStore } from '@/store';
import { ICreateSpriteAction } from '@/store/object-types/sprite';
import { IObject, ISetObjectPositionMutation } from '@/store/objects';
import { disposeCanvas } from '@/util/canvas';
import { DeepReadonly } from 'ts-essentials';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { MutationPayload } from 'vuex';

const store = useStore();
const props = defineProps({
	canvasWidth: { default: 0 },
	canvasHeight: { default: 0 },
	preLoading: { type: Boolean },
});

const sd = ref(null! as HTMLCanvasElement);
const sdCtx = ref(null! as CanvasRenderingContext2D);
const queuedRender = ref(null as null | number);
const showingLast = ref(false);
const dropPreventClick = ref(false);

const selection = computed(() => store.state.ui.selection ?? null);
const currentPanel = computed(
	() => store.state.panels.panels[store.state.panels.currentPanel]
);
const lqRendering = computed(() => store.state.ui.lqRendering);
function getSceneRender() {
	if (props.preLoading) return null!;
	const renderer = getMainSceneRenderer(store);
	renderer?.setPanelId(store.state.panels.currentPanel);
	return renderer;
}
const bitmapHeight = computed(() => {
	// Stupid hack to make vue reevaluate this property when loading is done.
	props.preLoading;
	return getConstants().Base.screenHeight;
});
const bitmapWidth = computed(() => {
	// Stupid hack to make vue reevaluate this property when loading is done.
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
		await getSceneRender()?.render(!lqRendering.value, true, false);
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
	showingLast.value = false;
	getSceneRender()?.paintOnto(sdCtx.value, {
		x: 0,
		y: 0,
		w: bitmapWidth.value,
		h: bitmapHeight.value,
	});
	inBlendOver.value = false;
}
function toRendererCoordinate(x: number, y: number): [number, number] {
	const canvas = sd.value as HTMLCanvasElement;
	const rx = x - canvas.offsetLeft;
	const ry = y - canvas.offsetTop;
	const sx = (rx / canvas.offsetWidth) * canvas.width;
	const sy = (ry / canvas.offsetWidth) * canvas.width;
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

	const currentObjectIdx = objects.findIndex((id) => id === selection.value);
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
		if (store.state.ui.selection === selectedObject) return;
		store.commit('ui/setSelection', selectedObject);
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
	sdCtx.value;
}
//#endregion Blend over
//#endregion picker
//#region picker
const pickerMode = computed(() => store.state.ui.pickColor);
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
const draggedObject = ref(null as DeepReadonly<IObject> | null);
const dragXOffset = ref(0);
const dragYOffset = ref(0);
const dragXOriginal = ref(0);
const dragYOriginal = ref(0);

function onDragStart(e: DragEvent) {
	e.preventDefault();
	if (selection.value === null) return;
	draggedObject.value = currentPanel.value.objects[selection.value];
	const [x, y] = toRendererCoordinate(e.clientX, e.clientY);
	dragXOffset.value = x - draggedObject.value.x;
	dragYOffset.value = y - draggedObject.value.y;
	dragXOriginal.value = draggedObject.value.x;
	dragYOriginal.value = draggedObject.value.y;
}
function onTouchStart(e: TouchEvent) {
	if (selection.value === null) return;
	draggedObject.value = currentPanel.value.objects[selection.value];
	const [x, y] = toRendererCoordinate(
		e.touches[0].clientX,
		e.touches[0].clientY
	);
	dragXOffset.value = x - draggedObject.value.x;
	dragYOffset.value = y - draggedObject.value.y;
	dragXOriginal.value = draggedObject.value.x;
	dragYOriginal.value = draggedObject.value.y;
}
function onDragOver(e: DragEvent) {
	e.stopPropagation();
	e.preventDefault();
	e.dataTransfer!.dropEffect = 'copy';
}
function onSpriteDragMove(e: MouseEvent | TouchEvent) {
	if (!draggedObject.value) return;
	e.preventDefault();
	let [x, y] =
		e instanceof MouseEvent
			? toRendererCoordinate(e.clientX, e.clientY)
			: toRendererCoordinate(e.touches[0].clientX, e.touches[0].clientY);
	x -= dragXOffset.value;
	y -= dragYOffset.value;
	const deltaX = Math.abs(x - dragXOriginal.value);
	const deltaY = Math.abs(y - dragYOriginal.value);
	if (deltaX + deltaY > 1) dropPreventClick.value = true;
	if (e.shiftKey) {
		if (deltaX > deltaY) {
			y = dragYOriginal.value;
		} else {
			x = dragXOriginal.value;
		}
	}
	transaction(async () => {
		await store.dispatch('panels/setPosition', {
			panelId: draggedObject.value!.panelId,
			id: draggedObject.value!.id,
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
				const assetUrl: string = await store.dispatch('uploadUrls/add', {
					name: file.name,
					url,
				});

				await transaction(async () => {
					await store.dispatch('panels/createSprite', {
						panelId: store.state.panels.currentPanel,
						assets: [
							{
								hq: assetUrl,
								lq: assetUrl,
								sourcePack: 'dddg.uploaded.sprites',
							},
						],
					} as ICreateSpriteAction);
				});
			} catch (e) {
				URL.revokeObjectURL(url);
			}
		}
	}
}
function onSpriteDrop(e: MouseEvent | TouchEvent) {
	if (draggedObject.value) {
		if ('TouchEvent' in window && e instanceof TouchEvent) {
			dropPreventClick.value = false;
		}
		draggedObject.value = null;
	}
}
function onMouseEnter(e: MouseEvent) {
	if (e.buttons !== 1) {
		draggedObject.value = null;
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
