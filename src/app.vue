<template>
	<div id="app" ref="app">
		<div class="hidden-selectors">
			<div
				v-for="obj in objects"
				:key="obj"
				tabindex="0"
				:data-obj-id="obj"
				@focus="rerender()"
				@blur="rerender()"
				@keydown.enter.prevent="select(obj)"
				@keydown.space.prevent="select(obj)"
			></div>
		</div>
		<preview-render
			ref="renderer"
			:canvasWidth="viewport.canvasWidth"
			:canvasHeight="viewport.canvasHeight"
			:preLoading="preLoading"
		/>
		<message-console />
		<tool-box
			@show-prev-render="drawLastDownload"
			@download="renderer.download()"
			@show-dialog="showDialog"
			@show-expression-dialog="showExpressionDialog"
		/>
		<keep-alive>
			<modal-dialog
				v-if="dialogVisable"
				ref="dialog"
				@leave="dialogVisable = false"
			>
				<single-box ref="packDialog" @leave="dialogVisable = false" />
			</modal-dialog>
		</keep-alive>
		<modal-dialog
			v-if="expressionBuilderVisible"
			ref="dialog"
			@leave="expressionBuilderVisible = false"
		>
			<expression-builder
				:character="expressionBuilderCharacter"
				:initHeadGroup="expressionBuilderHeadGroup"
				@leave="expressionBuilderVisible = false"
			/>
		</modal-dialog>
	</div>
	<div id="modal-messages"></div>
</template>

<script lang="ts" setup>
import MessageConsole from '@/components/message-console.vue';
import ModalDialog from '@/components/modal-dialog.vue';
import PreviewRender from '@/components/preview-render.vue';
import ToolBox from '@/components/toolbox/tool-box.vue';
import { packsUrl } from '@/config';
import environment from '@/environments/environment';
import eventBus, { InvalidateRenderEvent } from '@/eventbus/event-bus';
import { transaction } from '@/history-engine/transaction';
import { state as store } from '@/store/root';
import '@/styles/globals.scss';
import {
	computed,
	defineAsyncComponent,
	nextTick,
	onMounted,
	onUnmounted,
	provide,
	ref,
	useTemplateRef,
	watch,
} from 'vue';

const app = useTemplateRef('app');

const SingleBox = defineAsyncComponent(
	() => import('@/components/repo/layouts/single-box.vue')
);
const ExpressionBuilder = defineAsyncComponent(
	() =>
		import(
			'@/components/content-pack-builder/expression-builder/expression-builder.vue'
		)
);
const arrowMoveStepSize = 20;
const preLoading = ref(true);
const renderer = ref(null! as typeof PreviewRender);

function drawLastDownload(): void {
	const last = store.ui.lastDownload;
	if (last == null) return;
	renderer.value.blendOver(last);
}

//#region Multi viewport
const viewport = ref(setUpViewport(document));

provide('viewport', viewport);

watch(
	() => app.value?.ownerDocument,
	(owner, old) => {
		if (owner != null) {
			if (owner !== document) {
				viewport.value = setUpViewport(owner);
			}
			if (old != null) {
				unregisterGlobalEvents(old);
			}
			registerGlobalEvents(owner);
		}
	},
	{ immediate: true }
);

const capturingSymbol = Symbol('capturing');
const docListeners = new Map<string, Array<(e: Event) => void>>();
function onDocEvent<K extends keyof DocumentEventMap>(
	type: K,
	callback: (e: DocumentEventMap[K]) => void,
	capturing = false
) {
	if (capturing) {
		const oldCallback = callback;
		callback = (e: DocumentEventMap[K]) => oldCallback(e);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(callback as any)[capturingSymbol] = true;
	}
	const listeners = docListeners.get(type);
	if (listeners == null) {
		docListeners.set(type, [callback as (e: Event) => void]);
	} else {
		listeners.push(callback as (e: Event) => void);
	}
	const appV = app.value;
	if (appV != null) {
		appV.ownerDocument.addEventListener(type, callback, capturing);
	}
}

const winListeners = new Map<string, Array<(e: Event) => void>>();
function onWinEvent<K extends keyof WindowEventMap>(
	type: K,
	callback: (e: WindowEventMap[K]) => void,
	capturing = false
) {
	if (capturing) {
		const oldCallback = callback;
		callback = (e: WindowEventMap[K]) => oldCallback(e);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(callback as any)[capturingSymbol] = true;
	}
	const listeners = winListeners.get(type);
	if (listeners == null) {
		winListeners.set(type, [callback as (e: Event) => void]);
	} else {
		listeners.push(callback as (e: Event) => void);
	}
	const appV = app.value;
	if (appV != null) {
		appV.ownerDocument.defaultView!.addEventListener(type, callback);
	}
}

function registerGlobalEvents(doc: Document) {
	for (const [type, callbacks] of docListeners) {
		for (const callback of callbacks) {
			doc.addEventListener(type, callback);
		}
	}
	for (const [type, callbacks] of winListeners) {
		for (const callback of callbacks) {
			doc.defaultView?.addEventListener(type, callback);
		}
	}
}

function unregisterGlobalEvents(doc: Document) {
	for (const [type, callbacks] of docListeners) {
		for (const callback of callbacks) {
			doc.removeEventListener(type, callback);
		}
	}
	for (const [type, callbacks] of winListeners) {
		for (const callback of callbacks) {
			doc.defaultView?.removeEventListener(type, callback);
		}
	}
}

onUnmounted(() => {
	const doc = viewport.value.doc;
	unregisterGlobalEvents(doc);
});
//#endregion responsive layouting

const objects = computed(() => {
	const panels = store.panels;
	const currentPanel = panels.panels[viewport.value.currentPanel];
	if (currentPanel == null) return [];
	return [...currentPanel.lowerOrder, ...currentPanel.topOrder];
});

//#region drag-and-drop
function cancleEvent(e: Event) {
	e.preventDefault();
}

onDocEvent('drop', cancleEvent, true);
onDocEvent('dragover', cancleEvent, true);
//#endregion drag-and-drop
//#region dark mode
const systemPrefersDarkMode = ref(false);
const userPrefersDarkMode = computed(() => store.ui.useDarkTheme);

watch(
	() => userPrefersDarkMode.value ?? systemPrefersDarkMode.value,
	(value) => {
		viewport.value.doc.body.classList.toggle('dark-theme', value);
	},
	{ immediate: true }
);

if (window.matchMedia != null) {
	// TODO: Setting doesn't depend on viewport. Move to main

	/* The viewport is less than, or equal to, 700 pixels wide */
	const matcher = window.matchMedia('(prefers-color-scheme: dark)');
	systemPrefersDarkMode.value = matcher.matches;
	const handler = (match: MediaQueryListEvent) =>
		(systemPrefersDarkMode.value = match.matches);

	if (matcher.addEventListener) {
		matcher.addEventListener('change', handler);
	} else {
		matcher.addListener(handler);
	}
}
//#endregion dark mode
//#region expression dialog
const expressionBuilderVisible = ref(false);
const expressionBuilderCharacter = ref('');
const expressionBuilderHeadGroup = ref(undefined as string | undefined);

function showExpressionDialog(e: IShowExpressionDialogEvent) {
	expressionBuilderVisible.value = true;
	expressionBuilderCharacter.value = e.character;
	expressionBuilderHeadGroup.value = e.headGroup;
}
//#endregion expression dialog
//#region pack dialog
const packDialogWaitMs = 50;
const packDialog = ref(null! as typeof SingleBox);
const dialogVisable = ref(false);
function showDialog(search: string | undefined) {
	dialogVisable.value = true;
	if (search == null) return;
	const wait = () => {
		if (packDialog.value) {
			// This strange doubling is to get around the async component wrapper
			packDialog.value.setSearch(search);
		} else {
			setTimeout(wait, packDialogWaitMs);
		}
	};
	nextTick(wait);
}
//#endregion pack dialog
//#region nsfw
import { NsfwNames, NsfwPaths } from './constants/nsfw';
import type { GenObject } from './store/object-types/object';
import Textbox from './store/object-types/textbox';
import { setUpViewport } from './store/viewport';
import { isInput, isTextArea } from './util/cross-realm';

const nsfw = computed(() => store.ui.nsfw);
watch(
	() => nsfw.value,
	async (value) => {
		if (value) {
			store.content.loadContentPacks(NsfwPaths);
		} else {
			store.content.removeContentPacks(NsfwNames);
		}
	}
);
//#endregion nsfw
//#region rerender
let queuedRerender: number | null = null;

function rerender() {
	if (queuedRerender != null) return;
	queuedRerender = requestAnimationFrame(() => {
		queuedRerender = null;
		eventBus.fire(new InvalidateRenderEvent());
	});
}
//#endregion rerender
//#region keyboard actions
function onKeydown(e: KeyboardEvent) {
	if (isInput(e.target) || isTextArea(e.target)) {
		console.log('skip keydown on potential target');
		return;
	}

	transaction(async () => {
		const ctrl = e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey;
		const noMod = !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey;
		if (ctrl && e.key === 'v') {
			// TODO: Fix this
			/*store.panels.panels[viewport.value.currentPanel].pasteObjectFromClipboard({
				panelId: viewport.value.currentPanel,
			});*/
			e.preventDefault();
			return;
		}
		if (noMod && e.key === 'Escape') {
			if (viewport.value.selection === null) return;
			viewport.value.selection = null;
			return;
		}
		const selectionPanel = store.panels.panels[viewport.value.currentPanel];
		const selection = selectionPanel.objects[viewport.value.selection!];
		if (selection == null) return;
		if (ctrl) {
			if (e.key === 'c' || e.key === 'x') {
				// TODO: Fix this
				/*await store.dispatch('panels/copyObjectToClipboard', {
					id: selection.id,
					panelId: selection.panelId,
				} as ICopyObjectToClipboardAction);
				if (e.key === 'x') {
					await store.dispatch('panels/removeObject', {
						id: selection.id,
						panelId: selection.panelId,
					} as IRemoveObjectAction);
				}*/
				e.preventDefault();
				return;
			}
		} else if (noMod) {
			if (e.key === 'Delete') {
				store.panels.panels[viewport.value.currentPanel].removeObject(
					selection
				);
				return;
			}

			if (e.key === '/' || e.key === '*') {
				let delta = e.key === '/' ? -10 : 10;
				if (e.shiftKey) {
					delta /= Math.abs(delta);
				}
				selection.rotation += delta;
				e.stopPropagation();
				e.preventDefault();
				return;
			}

			if (selection.type === 'character') {
				if (!selection.freeMove) {
					if (e.key === 'ArrowLeft') {
						selection.shiftCharacterSlot(-1);
						return;
					}
					if (e.key === 'ArrowRight') {
						selection.shiftCharacterSlot(1);
						return;
					}
				}
			}
			const stepSize = e.shiftKey ? 1 : arrowMoveStepSize;
			switch (e.key) {
				case 'ArrowLeft':
					selection.x -= stepSize;
					break;
				case 'ArrowRight':
					selection.x += stepSize;
					break;
				case 'ArrowUp':
					selection.y -= stepSize;
					break;
				case 'ArrowDown':
					selection.y += stepSize;
					break;
				default:
					return;
			}
		}
	});
}
onWinEvent('keydown', onKeydown);
//#endregion keyboard actions
//#region shortcuts
let ctrlTimeout: number | null = null;
let ctrlShown = false;
function testShortcutKey(e: MouseEvent | KeyboardEvent) {
	if (e.ctrlKey) {
		if (!ctrlShown && ctrlTimeout === null) {
			ctrlTimeout = setTimeout(showCtrlLabels);
		}
	} else {
		removeCtrlLables();
	}
}
function showCtrlLabels() {
	document.body.classList.add('ctrl-key');
	ctrlShown = true;
}
function removeCtrlLables() {
	if (ctrlTimeout !== null) {
		clearTimeout(ctrlTimeout);
		ctrlTimeout = null;
	}
	document.body.classList.remove('ctrl-key');
	ctrlShown = false;
}
onWinEvent('keydown', testShortcutKey, true);
onWinEvent('keyup', testShortcutKey, true);
onWinEvent('mousemove', testShortcutKey, true);
onWinEvent('blur', removeCtrlLables);
//#endregion shortcuts
//#region selection
function select(id: GenObject['id']): void {
	transaction(() => {
		if (viewport.value.selection === id) return;
		viewport.value.selection = id;
	});
}

watch(
	() => viewport.value.selection,
	(id) => {
		if (document.activeElement?.getAttribute('data-obj-id') !== '' + id) {
			(
				document.querySelector(`*[data-obj-id='${id}']`) as HTMLElement
			)?.focus({
				focusVisible: false,
				preventScroll: true,
			});
		}
	},
	{ immediate: true }
);
//#endregion selection
//#region initialize
window.store = store;
window.env = environment;

onMounted(async () => {
	await environment.loadGameMode();
	preLoading.value = false;
	const settings = await environment.loadSettings();

	if (store.panels.lastPanelId === -1) {
		await transaction(async () => {
			environment.state.looseTextParsing =
				settings.looseTextParsing || true;

			store.ui.lqRendering = settings.lq ?? false;
			store.ui.useDarkTheme = settings.darkMode ?? null;
			store.ui.defaultCharacterTalkingZoom =
				settings.defaultCharacterTalkingZoom ?? true;

			await store.content.loadContentPacks([
				`${packsUrl}buildin.base.backgrounds.json`,
				`${packsUrl}buildin.base.monika.json`,
				`${packsUrl}buildin.base.sayori.json`,
				`${packsUrl}buildin.base.natsuki.json`,
				`${packsUrl}buildin.base.yuri.json`,
				`${packsUrl}buildin.extra.mc.json`,
				`${packsUrl}buildin.extra.concept_mc_v2.json`,
				`${packsUrl}buildin.extra.mc_chad.json`,
				`${packsUrl}buildin.extra.femc.json`,
				`${packsUrl}buildin.extra.concept_femc.json`,
				`${packsUrl}buildin.extra.amy.json`,
			]);

			if (!(await environment.loadDefaultTemplate())) {
				environment.loadContentPacks();

				const panel = store.panels.createPanel();
				viewport.value.currentPanel = panel.id;
				if (Object.keys(panel.objects).length === 0) {
					Textbox.create(
						panel,
						'Hi! Click here to edit this textbox! ' +
							`${viewport.value.isVertical ? 'To the right' : 'At the bottom'}` +
							' you find the toolbox. There you can add things (try clicking the chibis), change backgrounds and more! Use the camera icon to download the image.'
					);
				}
				panel.background.current = 'ddlc.clubroom';
				store.ui.nsfw = settings.nsfw ?? false;
			}
		});
	}
});
//#endregion Initialize

export interface IShowExpressionDialogEvent {
	character: string;
	headGroup?: string;
}
</script>

<style lang="scss">
.hidden-selectors {
	opacity: 0;
	pointer-events: none;
}
</style>
