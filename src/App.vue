<template>
	<div id="app">
		<div id="container">
			<render ref="render" :canvasWidth="canvasWidth" :canvasHeight="canvasHeight" />
		</div>
		<message-console />
		<tool-box @show-prev-render="drawLastDownload" @download="$refs.render.download()" />
	</div>
</template>

<script lang="ts">
// App.vue has currently so many responsiblities that it's best to break it into chunks
// tslint:disable:member-ordering
import { Component, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class-decorator';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { IRenderable } from '@/renderables/renderable';
import { IHistorySupport } from '@/plugins/vuex-history';
import { ICreateTextBoxAction } from '@/store/objectTypes/textbox';
import {
	IObject,
	ISetObjectPositionMutation,
	IRemoveObjectAction,
} from '@/store/objects';
import { Character } from '@/renderables/character';
import {
	IShiftCharacterSlotAction,
	ICharacter,
} from '@/store/objectTypes/characters';
import ToolBox from '@/components/toolbox/toolbox.vue';
import MessageConsole from '@/components/message-console.vue';
import Render from '@/components/render.vue';
import { ISetCurrentMutation } from '@/store/panels';

// tslint:disable-next-line: no-magic-numbers
const aspectRatio = 16 / 9;
const arrowMoveStepSize = 20;

@Component({
	components: {
		ToolBox,
		MessageConsole,
		Render,
	},
})
export default class App extends Vue {
	public canvasWidth: number = 0;
	public canvasHeight: number = 0;
	public $store!: Store<IRootState>;
	private vuexHistory!: IHistorySupport;
	private blendOver: string | null = null;

	private uiSize: number = 192;
	private currentlyRendering: boolean = false;

	private panel: string = '';

	private drawLastDownload(): void {
		const last = this.$store.state.ui.lastDownload;
		if (!last) return;
		(this.$refs.render as Render).blendOver(last);
	}

	private setBlendOver(): void {
		this.blendOver = this.$store.state.ui.lastDownload;
	}

	private async created(): Promise<void> {
		// Moving this to the "mounted"-handler crashes safari over version 12.
		// My best guess is because it runs in a microtask, which have been added in that Version.
		this.updateArea();
		window.addEventListener('resize', this.updateArea);
		window.removeEventListener('keydown', this.onKeydown);
		window.addEventListener('keydown', this.onKeydown);
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
				current: 'ddlc.clubroom',
				panelId: this.$store.state.panels.currentPanel,
			} as ISetCurrentMutation);
		});
	}

	private destroyed(): void {
		window.removeEventListener('keydown', this.onKeydown);
	}

	private mounted(): void {
		window.addEventListener('keypress', e => {
			if (e.key === 'Escape') {
				this.vuexHistory.transaction(() => {
					this.$store.commit('ui/setSelection', null);
				});
			}
		});
	}

	private optimum(sw: number, sh: number): [number, number] {
		let rh = sw / aspectRatio;
		let rw = sh * aspectRatio;

		if (rh > sh) {
			rh = sh;
		} else {
			rw = sw;
		}

		return [rw, rh];
	}

	private optimizeWithMenu(sw: number, sh: number): [number, number, boolean] {
		const opth = this.optimum(sw, sh - this.uiSize);
		const optv = this.optimum(sw - this.uiSize, sh);

		if (opth[0] * opth[1] > optv[0] * optv[1]) {
			return [opth[0], opth[1], false];
		} else {
			return [optv[0], optv[1], true];
		}
	}

	private updateArea(): void {
		const [cw, ch, v] = this.optimizeWithMenu(
			document.documentElement.clientWidth,
			document.documentElement.clientHeight
		);

		this.canvasWidth = cw;
		this.canvasHeight = ch;
		this.$store.commit('ui/setVertical', v);
	}

	private onKeydown(e: KeyboardEvent) {
		this.vuexHistory.transaction(() => {
			const selection = this.$store.state.objects.objects[
				this.$store.state.ui.selection!
			];
			if (!selection) return;
			if (e.key === 'Delete') {
				this.$store.dispatch('objects/removeObject', {
					id: selection.id,
				} as IRemoveObjectAction);
				return;
			}
			if (e.key === 'z' && e.ctrlKey) {
				this.$store.commit('history/undo');
				return;
			} else if (e.key === 'y' && e.ctrlKey) {
				this.$store.commit('history/redo');
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
				console.log(e);
				return;
			}
			this.$store.dispatch('objects/setPosition', {
				id: selection.id,
				x,
				y,
			} as ISetObjectPositionMutation);
			console.log(e);
			return;
		});
	}
}
</script>

<style lang="scss">
html,
body {
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	font-family: aller, sans-serif;
	font-size: 16px;
}

* {
	margin: 0;
	padding: 0;
	border: 0;
	box-sizing: border-box;
	font-family: aller, sans-serif;
	font-size: 16px;
}

fieldset {
	border: 3px solid #ffbde1;
	overflow: visible;
}

h1 {
	font-size: 24px;
	color: black;
	font-family: riffic, sans-serif;
	text-align: center;
}

input,
textarea {
	border: 2px solid #ffbde1;
}

button,
select,
.btn {
	border: 2px solid #ffbde1;
	background: #ffe6f4;
	padding: 1px;
}

button,
.btn {
	padding: 2px;
	text-align: center;
	text-decoration: none;
	user-select: none;

	i {
		vertical-align: middle;
	}

	&.disabled {
		color: gray;
		pointer-events: none;
	}
}

input[type='number'] {
	text-align: right;
}
</style>
