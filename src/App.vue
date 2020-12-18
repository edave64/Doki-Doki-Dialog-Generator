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
</template>

<script lang="ts">
// App.vue has currently so many responsiblities that it's best to break it into chunks
import { ICreateTextBoxAction } from '@/store/objectTypes/textbox';
import {
	ISetObjectPositionMutation,
	IRemoveObjectAction,
	ICopyObjectToClipboardAction,
	IPasteFromClipboardAction,
} from '@/store/objects';
import {
	IShiftCharacterSlotAction,
	ICharacter,
} from '@/store/objectTypes/characters';
import ToolBox from '@/components/toolbox/toolbox.vue';
import MessageConsole from '@/components/message-console.vue';
import Render from '@/components/render.vue';
import ModalDialog from '@/components/ModalDialog.vue';
import { ISetCurrentMutation } from '@/store/panels';
import { defineAsyncComponent, defineComponent } from 'vue';

// tslint:disable-next-line: no-magic-numbers
const aspectRatio = 16 / 9;
const arrowMoveStepSize = 20;
const packDialogWaitMs = 50;
const canvasTooSmallThreshold = 200;

export default defineComponent({
	components: {
		ToolBox,
		MessageConsole,
		Render,
		ModalDialog,
		SingleBox: defineAsyncComponent(() =>
			import('@/components/repo/layouts/SingleBox.vue')
		),
		ExpressionBuilder: defineAsyncComponent(() =>
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
					if (
						this.$refs.packDialog &&
						(this.$refs.packDialog as any).$refs.packDialog
					) {
						// This strange doubling is to get around the async component wrapper
						(this.$refs.packDialog as any).$refs.packDialog.setSearch(search);
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
				const selection = this.$store.state.objects.objects[
					this.$store.state.ui.selection!
				];
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
							'objects/pasteObjectFromClipboard',
							{} as IPasteFromClipboardAction
						);
						e.preventDefault();
						return;
					}
				}
				if (!selection) return;
				if (e.key === 'Delete') {
					this.$store.dispatch('objects/removeObject', {
						id: selection.id,
					} as IRemoveObjectAction);
					return;
				}

				if (e.key === 'c' || e.key === 'x') {
					this.$store.dispatch('objects/copyObjectToClipboard', {
						id: selection.id,
					} as ICopyObjectToClipboardAction);
					if (e.key === 'x') {
						this.$store.dispatch('objects/removeObject', {
							id: selection.id,
						} as IRemoveObjectAction);
					}
					e.preventDefault();
					return;
				}

				if (selection.type === 'character') {
					const character = selection as ICharacter;
					if (character.freeMove) {
						if (e.key === 'ArrowLeft') {
							this.$store.dispatch('objects/shiftCharacterSlot', {
								id: character.id,
								delta: -1,
							} as IShiftCharacterSlotAction);
							return;
						}
						if (e.key === 'ArrowRight') {
							this.$store.dispatch('objects/shiftCharacterSlot', {
								id: character.id,
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
				this.$store.dispatch('objects/setPosition', {
					id: selection.id,
					x,
					y,
				} as ISetObjectPositionMutation);
				return;
			});
		},
		destroyed(): void {
			window.removeEventListener('keydown', this.onKeydown);
		},
	},
	mounted(): void {
		window.addEventListener('keypress', e => {
			if (e.key === 'Escape') {
				this.vuexHistory.transaction(() => {
					if (this.$store.state.ui.selection === null) return;
					this.$store.commit('ui/setSelection', null);
				});
			}
		});
	},
	async created(): Promise<void> {
		// Moving this to the "mounted"-handler crashes safari over version 12.
		// My best guess is because it runs in a microtask, which have been added in that Version.
		this.updateArea();
		window.addEventListener('resize', this.updateArea);
		window.removeEventListener('keydown', this.onKeydown);
		window.addEventListener('keydown', this.onKeydown);

		(window as any).app = this;
		(window as any).store = this.$store;

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

		this.vuexHistory.transaction(async () => {
			await this.$store.dispatch('content/loadContentPacks', [
				`${process.env.BASE_URL}packs/buildin.base.backgrounds.json`,
				`${process.env.BASE_URL}packs/buildin.base.monika.json`,
				`${process.env.BASE_URL}packs/buildin.base.sayori.json`,
				`${process.env.BASE_URL}packs/buildin.base.natsuki.json`,
				`${process.env.BASE_URL}packs/buildin.base.yuri.json`,
				`${process.env.BASE_URL}packs/buildin.extra.mc.json`,
				`${process.env.BASE_URL}packs/buildin.extra.mc_chad.json`,
				`${process.env.BASE_URL}packs/buildin.extra.mc_classic.json`,
				`${process.env.BASE_URL}packs/buildin.extra.femc.json`,
				`${process.env.BASE_URL}packs/buildin.extra.classic_amy.json`,
				`${process.env.BASE_URL}packs/buildin.extra.amy.json`,
			]);

			await this.$store.dispatch('panels/createPanel');
			if (Object.keys(this.$store.state.objects.objects).length === 0) {
				this.$store.dispatch(
					'objects/createTextBox',
					{} as ICreateTextBoxAction
				);
			}
			await this.$store.commit('panels/setCurrentBackground', {
				current: 'dddg.buildin.backgrounds:ddlc.clubroom',
				panelId: this.$store.state.panels.currentPanel,
			} as ISetCurrentMutation);
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
