<template>
	<div v-if="canvasTooSmall && isSafari">
		Protrait mode is not supported by safari. Please turn the device sideways.
	</div>
	<div v-else id="app">
		<div id="container">
			<render
				ref="render"
				:canvasWidth="canvasWidth"
				:canvasHeight="canvasHeight"
				:preLoading="preLoading"
			/>
		</div>
		<message-console />
		<tool-box
			@show-prev-render="drawLastDownload"
			@download="$refs.render.download()"
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

<script lang="ts">
import { ICreateTextBoxAction } from '@/store/objectTypes/textbox';
import {
	ICopyObjectToClipboardAction,
	IPasteFromClipboardAction,
	IRemoveObjectAction,
	ISetObjectPositionMutation,
} from '@/store/objects';
import {
	ICharacter,
	IShiftCharacterSlotAction,
} from '@/store/objectTypes/characters';
import ToolBox from '@/components/toolbox/toolbox.vue';
import MessageConsole from '@/components/message-console.vue';
import Render from '@/components/render.vue';
import ModalDialog from '@/components/ModalDialog.vue';
import { ISetCurrentMutation } from '@/store/panels';
import { defineAsyncComponent, defineComponent } from 'vue';
import { Repo } from './models/repo';
import enviroment from '@/environments/environment';
import { IRemovePacksAction } from './store';

// tslint:disable-next-line: no-magic-numbers
const aspectRatio = 16 / 9;
const arrowMoveStepSize = 20;
const packDialogWaitMs = 50;
const canvasTooSmallThreshold = 200;

const baseUrl = import.meta.env.BASE_URL || '';

const nsfwPacks = {
	'dddg.buildin.backgrounds.nsfw': `${baseUrl}packs/buildin.base.backgrounds.nsfw.json`,
	'dddg.buildin.sayori.nsfw': `${baseUrl}packs/buildin.base.sayori.nsfw.json`,
	'dddg.buildin.base.natsuki.nsfw': `${baseUrl}packs/buildin.base.natsuki.nsfw.json`,
	'dddg.buildin.yuri.nsfw': `${baseUrl}packs/buildin.base.yuri.nsfw.json`,
};

const names = new Set(Object.keys(nsfwPacks));
const paths = Object.values(nsfwPacks);

export default defineComponent({
	components: {
		ToolBox,
		MessageConsole,
		Render,
		ModalDialog,
		SingleBox: defineAsyncComponent(
			() => import('@/components/repo/layouts/SingleBox.vue')
		),
		ExpressionBuilder: defineAsyncComponent(
			() =>
				import('@/components/content-pack-builder/expression-builder/index.vue')
		),
	},
	data: () => ({
		canvasWidth: 0,
		canvasHeight: 0,
		blendOver: null as string | null,
		uiSize: 192,
		currentlyRendering: false,
		panel: '',
		dialogVisable: false,
		canvasTooSmall: false,
		expressionBuilderVisible: false,
		expressionBuilderCharacter: '',
		expressionBuilderHeadGroup: undefined as string | undefined,
		systemPrefersDarkMode: false,
		preLoading: true,
	}),
	computed: {
		isSafari(): boolean {
			return false;
			/*		return !!(
			navigator.vendor &&
			navigator.vendor.indexOf('Apple') > -1 &&
			navigator.userAgent &&
			navigator.userAgent.indexOf('CriOS') === -1 &&
			navigator.userAgent.indexOf('FxiOS') === -1
		);*/
		},
		useDarkTheme(): boolean {
			return this.userPrefersDarkMode ?? this.systemPrefersDarkMode;
		},
		userPrefersDarkMode(): boolean | null {
			return this.$store.state.ui.useDarkTheme;
		},
		nsfw(): boolean {
			return this.$store.state.ui.nsfw;
		},
	},
	methods: {
		drawLastDownload(): void {
			const last = this.$store.state.ui.lastDownload;
			if (!last) return;
			(this.$refs.render as typeof Render).blendOver(last);
		},
		setBlendOver(): void {
			this.blendOver = this.$store.state.ui.lastDownload;
		},
		optimum(sw: number, sh: number): [number, number] {
			let rh = sw / aspectRatio;
			let rw = sh * aspectRatio;

			if (rh > sh) {
				rh = sh;
			} else {
				rw = sw;
			}

			return [rw, rh];
		},
		optimizeWithMenu(sw: number, sh: number): [number, number, boolean] {
			const opth = this.optimum(sw, sh - this.uiSize);
			const optv = this.optimum(sw - this.uiSize, sh);

			if (!this.isSafari && opth[0] * opth[1] > optv[0] * optv[1]) {
				return [opth[0], opth[1], false];
			} else {
				return [optv[0], optv[1], true];
			}
		},
		updateArea(): void {
			const [cw, ch, v] = this.optimizeWithMenu(
				document.documentElement.clientWidth,
				document.documentElement.clientHeight
			);

			this.canvasWidth = cw;
			this.canvasHeight = ch;

			this.canvasTooSmall = Math.max(cw, ch) < canvasTooSmallThreshold;

			if (this.$store.state.ui.vertical === v) return;
			this.$store.commit('ui/setVertical', v);
		},
		showDialog(search: string | undefined) {
			this.dialogVisable = true;
			if (search) {
				const wait = () => {
					if (this.$refs.packDialog) {
						// This strange doubling is to get around the async component wrapper
						(this.$refs.packDialog as any).setSearch(search);
					} else {
						setTimeout(wait, packDialogWaitMs);
					}
				};
				this.$nextTick(wait);
			}
		},
		showExpressionDialog(e: IShowExpressionDialogEvent) {
			this.expressionBuilderVisible = true;
			this.expressionBuilderCharacter = e.character;
			this.expressionBuilderHeadGroup = e.headGroup;
		},
		onKeydown(e: KeyboardEvent) {
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			) {
				console.log('skip keydown on potential target');
				return;
			}

			this.vuexHistory.transaction(() => {
				if (e.ctrlKey) {
					if (e.key === 'z') {
						// this.$store.commit('history/undo');
						e.preventDefault();
						return;
					} else if (e.key === 'y') {
						// this.$store.commit('history/redo');
						e.preventDefault();
						return;
					} else if (e.key === 'v') {
						this.$store.dispatch(
							'panels/pasteObjectFromClipboard',
							{} as IPasteFromClipboardAction
						);
						e.preventDefault();
						return;
					}
				}
				const selectionPanel =
					this.$store.state.panels.panels[
						this.$store.state.panels.currentPanel
					];
				if (!selectionPanel) return;
				const selection =
					selectionPanel.objects[this.$store.state.ui.selection!];
				if (!selection) return;
				if (e.key === 'Delete') {
					this.$store.dispatch('panels/removeObject', {
						id: selection.id,
						panelId: selection.panelId,
					} as IRemoveObjectAction);
					return;
				}

				if (e.key === 'c' || e.key === 'x') {
					this.$store.dispatch('panels/copyObjectToClipboard', {
						id: selection.id,
						panelId: selection.panelId,
					} as ICopyObjectToClipboardAction);
					if (e.key === 'x') {
						this.$store.dispatch('panels/removeObject', {
							id: selection.id,
							panelId: selection.panelId,
						} as IRemoveObjectAction);
					}
					e.preventDefault();
					return;
				}

				if (selection.type === 'character') {
					const character = selection as ICharacter;
					if (!character.freeMove) {
						if (e.key === 'ArrowLeft') {
							this.$store.dispatch('panels/shiftCharacterSlot', {
								id: character.id,
								panelId: character.panelId,
								delta: -1,
							} as IShiftCharacterSlotAction);
							return;
						}
						if (e.key === 'ArrowRight') {
							this.$store.dispatch('panels/shiftCharacterSlot', {
								id: character.id,
								panelId: character.panelId,
								delta: 1,
							} as IShiftCharacterSlotAction);
							return;
						}
					}
				}
				let { x, y } = selection;
				if (e.key === 'ArrowLeft') {
					x -= e.shiftKey ? 1 : arrowMoveStepSize;
				} else if (selection && e.key === 'ArrowRight') {
					x += e.shiftKey ? 1 : arrowMoveStepSize;
				} else if (selection && e.key === 'ArrowUp') {
					y -= e.shiftKey ? 1 : arrowMoveStepSize;
				} else if (selection && e.key === 'ArrowDown') {
					y += e.shiftKey ? 1 : arrowMoveStepSize;
				} else {
					return;
				}
				this.$store.dispatch('panels/setPosition', {
					id: selection.id,
					panelId: selection.panelId,
					x,
					y,
				} as ISetObjectPositionMutation);
				return;
			});
		},
		destroyed(): void {
			window.removeEventListener('keydown', this.onKeydown);
		},
		applyTheme(): void {
			document.body.classList.toggle('dark-theme', this.useDarkTheme);
		},
	},
	watch: {
		systemPrefersDarkMode() {
			this.applyTheme();
		},
		userPrefersDarkMode() {
			this.applyTheme();
		},
		async nsfw(value: boolean) {
			if (value) {
				await this.$store.dispatch('content/loadContentPacks', paths);
			} else {
				await this.$store.dispatch('removePacks', {
					packs: names,
				} as IRemovePacksAction);
			}
		},
	},
	mounted(): void {
		window.addEventListener('keypress', (e) => {
			if (e.key === 'Escape') {
				this.vuexHistory.transaction(() => {
					if (this.$store.state.ui.selection === null) return;
					this.$store.commit('ui/setSelection', null);
				});
			}
		});

		if (window.matchMedia) {
			/* The viewport is less than, or equal to, 700 pixels wide */
			const matcher = window.matchMedia('(prefers-color-scheme: dark)');
			this.systemPrefersDarkMode = matcher.matches;
			matcher.addListener((match) => {
				this.systemPrefersDarkMode = match.matches;
			});
		}
	},
	async created(): Promise<void> {
		// Moving this to the "mounted"-handler crashes safari over version 12.
		// My best guess is because it runs in a microtask, which have been added in that Version.
		this.updateArea();
		Repo.setStore(this.$store);
		window.addEventListener('resize', this.updateArea);
		window.removeEventListener('keydown', this.onKeydown);
		window.addEventListener('keydown', this.onKeydown);

		(window as any).app = this;
		(window as any).store = this.$store;
		(window as any).env = enviroment;

		document.body.addEventListener(
			'drop',
			(event: Event) => {
				event.preventDefault();
			},
			true
		);
		document.body.addEventListener(
			'dragover',
			(event: Event) => {
				event.preventDefault();
			},
			true
		);

		await enviroment.loadGameMode();
		this.preLoading = false;
		enviroment.connectToStore(this.vuexHistory, this.$store);
		const settings = await enviroment.loadSettings();

		await this.vuexHistory.transaction(async () => {
			this.$store.commit('ui/setLqRendering', settings.lq ?? false);
			this.$store.commit('ui/setDarkTheme', settings.darkMode ?? null);
			this.$store.commit(
				'ui/setDefaultCharacterTalkingZoom',
				settings.defaultCharacterTalkingZoom ?? true
			);

			await this.$store.dispatch('content/loadContentPacks', [
				`${baseUrl}packs/buildin.base.backgrounds.json`,
				`${baseUrl}packs/buildin.base.monika.json`,
				`${baseUrl}packs/buildin.base.sayori.json`,
				`${baseUrl}packs/buildin.base.natsuki.json`,
				`${baseUrl}packs/buildin.base.yuri.json`,
				`${baseUrl}packs/buildin.extra.mc.json`,
				`${baseUrl}packs/buildin.extra.concept_mc.json`,
				`${baseUrl}packs/buildin.extra.mc_chad.json`,
				`${baseUrl}packs/buildin.extra.femc.json`,
				`${baseUrl}packs/buildin.extra.concept_femc.json`,
				`${baseUrl}packs/buildin.extra.amy.json`,
			]);

			await enviroment.loadContentPacks();

			const panelId = await this.$store.dispatch('panels/createPanel');
			if (
				Object.keys(this.$store.state.panels.panels[panelId].objects).length ===
				0
			) {
				await this.$store.dispatch('panels/createTextBox', {
					panelId,
					text:
						'Hi! Click here to edit this textbox! ' +
						`${
							this.$store.state.ui.vertical ? 'To the right' : 'At the bottom'
						}` +
						' you find the toolbox. There you can add things (try clicking the chibis), change backgrounds and more!',
				} as ICreateTextBoxAction);
			}
			await this.$store.commit('panels/setCurrentBackground', {
				current: 'dddg.buildin.backgrounds:ddlc.clubroom',
				panelId: this.$store.state.panels.currentPanel,
			} as ISetCurrentMutation);

			await this.$store.commit('ui/setNsfw', settings.nsfw ?? false);
		});
	},
});

export interface IShowExpressionDialogEvent {
	character: string;
	headGroup?: string;
}
</script>

<style lang="scss">
@import '@/styles/globals.scss';
</style>
