<template>
	<div id="app">
		<div id="container">
			<canvas
				id="scaled_display"
				ref="sd"
				height="720"
				width="1280"
				:style="{width: canvasWidth+ 'px', height: canvasHeight + 'px'}"
				@click="onUiClick"
			>
				HTML5 is required to use this
				<strike>shitpost</strike>meme generator.
			</canvas>
		</div>
		<div id="panels" :class="{ vertical }">
			<div id="toolbar">
				<button :class="{ active: panel === 'add' }" @click="panel = panel === 'add' ? '' : 'add'">A</button>
				<button
					:class="{ active: panel === 'backgrounds' }"
					@click="panel = panel === 'backgrounds' ? '' : 'backgrounds'"
				>B</button>
				<button>&nbsp;</button>
				<button @click="download">D</button>
			</div>
			<keep-alive>
				<general-panel
					v-if="panel === ''"
					:options="textbox"
					:vertical="vertical"
					:lqRendering.sync="lqRendering"
				/>
				<add-panel v-if="panel === 'add'" :vertical="vertical" @chosen="onDokiChosen" />
				<backgrounds-panel
					v-if="panel === 'backgrounds'"
					:vertical="vertical"
					v-model="currentBackground"
				/>
				<doki-panel
					v-if="panel === 'doki'"
					:vertical="vertical"
					:girl="selectedGirl"
					@shiftLayer="onDokiLayerShift"
					@invalidate-render="invalidateRender"
				/>
			</keep-alive>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import DokiButton from './components/DokiButton.vue';
import GeneralPanel from './components/panels/general.vue';
import AddPanel from './components/panels/add.vue';
import DokiPanel, { MoveGirl } from './components/panels/doki.vue';
import BackgroundsPanel from './components/panels/backgrounds.vue';
import { girlPositions } from './models/constants';
import { Textbox } from './models/textbox';
import { Girl, GirlName } from './models/girl';
import { backgrounds, getAsset } from './asset-manager';
import { Renderer } from './renderer/renderer';
import { RenderContext } from './renderer/rendererContext';
import { Background } from './models/background';

@Component({
	components: {
		DokiButton,
		GeneralPanel,
		AddPanel,
		DokiPanel,
		BackgroundsPanel,
	},
})
export default class App extends Vue {
	public canvasWidth: number = 0;
	public canvasHeight: number = 0;
	public currentBackground: Background | null = null;

	private sdCtx: CanvasRenderingContext2D | undefined;
	private girls: Girl[] = [];
	private selectedGirl: Girl | null = null;
	private dokiSelectorOpen: boolean = false;
	private backgroundSelectorOpen: boolean = false;
	private editDialog: boolean = false;

	private vertical: boolean = false;
	private textbox = new Textbox();

	private renderer: Renderer = new Renderer();
	private showUI: boolean = true;
	private loaded: boolean = false;
	private uiSize: number = 192;
	private lqRendering: boolean = true;

	private panel: string = '';

	private renderInProgress: boolean = false;
	private queuedRender: number | null = null;

	@Watch('selectedGirl')
	public onSelectedGirlChange(newGirl: Girl, oldGirl: Girl) {
		if (oldGirl) oldGirl.unselect();
		if (newGirl) {
			newGirl.select();
			this.panel = 'doki';
		}
		this.invalidateRender();
	}

	@Watch('panel')
	public onPanel(newPanel: string) {
		if (newPanel !== 'doki') {
			this.selectedGirl = null;
		}
	}

	@Watch('textbox', { deep: true })
	@Watch('lqRendering')
	@Watch('currentBackground')
	public invalidateRender() {
		if (this.queuedRender) return;
		this.queuedRender = requestAnimationFrame(() => this.render_());
	}

	public async render_(downloadRendering?: boolean): Promise<void> {
		if (this.queuedRender) {
			cancelAnimationFrame(this.queuedRender);
			this.queuedRender = null;
		}
		if (this.renderInProgress) {
			// Delay rerender when render already in progress
			this.invalidateRender();
		}
		this.renderInProgress = true;

		try {
			const hq = downloadRendering || !this.lqRendering;
			await this.renderer.render(this.renderCallback, hq);
			this.display();
		} finally {
			this.renderInProgress = false;
		}
	}

	private async renderCallback(rx: RenderContext): Promise<void> {
		if (!this.loaded) {
			rx.drawText(
				'Starting...',
				this.renderer.width / 2,
				this.renderer.height / 2,
				'center',
				5,
				'white',
				'#b59',
				'32px riffic'
			);
		} else {
			if (this.currentBackground) {
				await this.currentBackground.render(rx);
			}

			for (const girl of this.girls) {
				if (!girl.infront) {
					await girl.render(rx);
				}
			}

			await this.textbox.render(rx);

			for (const girl of this.girls) {
				if (girl.infront) {
					await girl.render(rx);
				}
			}
		}
	}

	private created(): void {
		(window as any).cats = this;
	}

	private mounted(): void {
		const sd = this.$refs.sd as HTMLCanvasElement;
		this.sdCtx = sd.getContext('2d') || undefined;

		this.updateArea();
		window.addEventListener('resize', this.updateArea);
		window.addEventListener('keypress', e => {
			if (e.keyCode === 27) {
				this.selectedGirl = null;
				this.panel = '';
			}
		});

		this.currentBackground = backgrounds[0];
		this.invalidateRender();

		Promise.all([
			getAsset(this.currentBackground.path, false),
			getAsset('textbox'),
			getAsset('namebox'),
			getAsset('next'),
		])
			.then(() => {
				this.loaded = true;
				this.invalidateRender();
			})
			.catch(() => {
				alert('Error while loading. Sorry :/');
			});
	}

	private optimum(sw: number, sh: number): [number, number] {
		let rh = sw / (16 / 9);
		let rw = sh * (16 / 9);

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
			window.innerWidth,
			window.innerHeight
		);

		this.canvasWidth = cw;
		this.canvasHeight = ch;
		this.vertical = v;
		this.$nextTick(() => {
			this.display();
		});
	}

	private display(): void {
		if (!this.sdCtx) return;
		this.renderer.paintOnto(this.sdCtx, 0, 0, 1280, 780);
	}

	private async download() {
		this.selectedGirl = null;
		this.renderer.download(this.renderCallback, 'panel.png');
	}

	private onDokiChosen(girl: GirlName): void {
		this.dokiSelectorOpen = false;
		this.girls.push(new Girl(girl, this.invalidateRender));
		this.invalidateRender();
	}

	private onUiClick(e: MouseEvent): void {
		this.panel = '';

		const sd = this.$refs.sd as HTMLCanvasElement;
		const rx = e.clientX - sd.offsetLeft;
		const ry = e.clientY - sd.offsetTop;
		const sx = (rx / sd.offsetWidth) * sd.width;
		const sy = (ry / sd.offsetWidth) * sd.width;
		debugger;

		const girls = sy > 50 && sy < 550 ? this.girlsAt(sx) : [];

		const currentCharacterIdx = girls.indexOf(this.selectedGirl!);

		if (currentCharacterIdx === 0) {
			this.selectedGirl = null;
		} else if (currentCharacterIdx !== -1) {
			// Select the next lower girl
			this.selectedGirl = girls[currentCharacterIdx - 1];
		} else {
			this.selectedGirl = girls[girls.length - 1] || null;
		}
	}
	private girlsAt(x: number): Girl[] {
		return this.girls.filter(
			girl => Math.abs(girlPositions[girl.pos]! - x) < 120
		);
	}

	private onDokiLayerShift(event: MoveGirl): void {
		const idx = this.girls.indexOf(event.girl);
		let targetIdx = idx;
		this.girls.splice(idx, 1);
		switch (event.move) {
			case 'Forward':
				targetIdx += 1;
				break;
			case 'Backward':
				targetIdx -= 1;
				break;
			case 'Back':
				targetIdx = 0;
				break;
			case 'Front':
				targetIdx = this.girls.length;
				break;
			case 'Delete':
				this.panel = '';
				this.invalidateRender();
				return;
		}
		if (targetIdx <= 0) {
			this.girls.unshift(event.girl);
		} else if (targetIdx >= this.girls.length) {
			this.girls.push(event.girl);
		} else {
			this.girls.splice(targetIdx, 0, event.girl);
		}
		this.invalidateRender();
	}
}
</script>

<style lang="scss">
html,
body {
	margin: 0;
	padding: 0;
	overflow: hidden;

	font-family: aller;
}
#panels {
	background-color: #ffe6f4;
	border: 3px solid #ffbde1;
	position: absolute;
	display: flex;

	.panel {
		display: flex;
		flex-direction: column;
		padding: 4px;

		h1 {
			margin: 0;
			color: white;
			font-family: riffic;
			text-shadow: 0 0 7px black;
			text-align: center;
		}
	}

	&:not(.vertical) {
		flex-direction: row;
		left: 0;
		bottom: 0;
		height: 186px;
		width: calc(100vw - 6px);

		.panel {
			flex-grow: 1;
			flex-wrap: wrap;
			align-content: flex-start;
			overflow-x: auto;
			overflow-y: hidden;

			> * {
				margin-right: 8px;
			}
		}

		#toolbar {
			width: 48px;
			height: 100%;
			float: left;

			button {
				border-bottom: none;

				&:nth-child(4) {
					border-bottom: 3px solid #ffbde1;
				}

				&.active {
					border-right: 3px solid #ffe6f4;
				}
			}
		}

		h1 {
			writing-mode: vertical-rl;
			height: 100%;
		}
	}

	&.vertical {
		flex-direction: column;
		top: 0;
		right: 0;
		height: calc(100vh - 6px);
		width: 186px;

		.panel {
			overflow-x: hidden;
			overflow-y: auto;
		}

		#toolbar {
			width: calc(100% + 6px);
			button {
				border-right: none;

				&:nth-child(4) {
					border-right: 3px solid #ffbde1;
				}

				&.active {
					border-bottom: 3px solid #ffe6f4;
				}
			}
		}
	}

	#toolbar {
		margin-top: -3px;
		margin-left: -3px;
		button {
			outline: 0;
			box-sizing: border-box;
			width: 48px;
			height: 48px;
			background-color: #ffe6f4;
			border: 3px solid #ffbde1;
		}
	}
}
</style>
