<template>
	<div id="app">
		<div id="container">
			<canvas
				id="scaled_display"
				ref="sd"
				:height="canvasHeight"
				:width="canvasWidth"
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
					:options="textboxOptions"
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
import { IApp } from './models/app';
import { girlPositions } from './models/constants';
import { TextboxOptions } from './models/textbox';
import { Girl, GirlName } from './models/girl';
import { Background, backgrounds, getAsset } from './asset-manager';
import { Renderer } from './renderer/renderer';
import { RenderContext } from './renderer/rendererContext';

@Component({
	components: {
		DokiButton,
		GeneralPanel,
		AddPanel,
		DokiPanel,
		BackgroundsPanel,
	},
})
export default class App extends Vue implements IApp {
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
	private textboxOptions: TextboxOptions = {
		render: true,
		corrupted: false,
		showControls: true,
		allowSkipping: true,
		showContinueArrow: true,
		talking: '',
		customName: '',
		dialog: '',
	};

	private renderer: Renderer = new Renderer();
	private showUI: boolean = true;
	private loaded: boolean = false;
	private uiSize: number = 192;
	private lqRendering: boolean = true;

	private panel: string = '';

	public close_guis(): void {
		this.selectedGirl = null;
		this.dokiSelectorOpen = false;
		this.backgroundSelectorOpen = false;
		this.editDialog = false;
	}

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

	private _queuedRender: number | null = null;
	private _renderInProgress: boolean = false;

	@Watch('textboxOptions.render')
	@Watch('textboxOptions.corrupted')
	@Watch('textboxOptions.showControls')
	@Watch('textboxOptions.allowSkipping')
	@Watch('textboxOptions.showContinueArrow')
	@Watch('textboxOptions.talking')
	@Watch('textboxOptions.customName')
	@Watch('textboxOptions.dialog')
	@Watch('lqRendering')
	@Watch('currentBackground')
	public invalidateRender() {
		if (this._queuedRender) return;
		this._queuedRender = requestAnimationFrame(() => this.render_());
	}

	public async render_(downloadRendering?: boolean): Promise<void> {
		if (this._queuedRender) {
			cancelAnimationFrame(this._queuedRender);
			this._queuedRender = null;
		}
		if (this._renderInProgress) {
			// Delay rerender when render already in progress
			this.invalidateRender();
		}
		this._renderInProgress = true;

		try {
			const hq = downloadRendering || !this.lqRendering;
			await this.renderer.render(async rx => {
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
					await this.render_bg(rx, !!downloadRendering);

					for (const girl of this.girls) {
						if (!girl.infront) {
							await girl.render(rx);
						}
					}

					await this.render_textbox(rx);

					for (const girl of this.girls) {
						if (girl.infront) {
							await girl.render(rx);
						}
					}
				}
			}, hq);
			this.display();
		} finally {
			this._renderInProgress = false;
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
				this.close_guis();
			}
		});

		this.currentBackground = backgrounds[0];

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

	private async render_textbox(rx: RenderContext): Promise<void> {
		if (!this.textboxOptions.render) return;

		if (this.textboxOptions.corrupted) {
			rx.drawImage(await getAsset('textbox_monika'), 190, 565);
		} else {
			rx.drawImage(await getAsset('textbox'), 232, 565);
		}

		const name = this.textboxOptions.talking;
		if (name) {
			rx.drawImage(await getAsset('namebox'), 264, 565 - 39);
			rx.drawText(
				name === 'other' ? this.textboxOptions.customName : name,
				264 + 84,
				565 - 10,
				'center',
				3,
				'white',
				'#b59',
				'24px riffic'
			);
		}

		this.render_text(rx);

		if (this.textboxOptions.showControls) {
			rx.drawText(
				'Skip',
				566,
				700,
				'left',
				1,
				this.textboxOptions.allowSkipping ? '#522' : '#a66',
				null,
				'13px aller'
			);
			rx.drawText('History', 512, 700, 'left', 1, '#522', null, '13px aller');
			rx.drawText(
				'Auto   Save   Load   Settings',
				600,
				700,
				'left',
				1,
				'#522',
				null,
				'13px aller'
			);
		}

		if (this.textboxOptions.showContinueArrow) {
			rx.drawImage(await getAsset('next'), 1020, 685);
		}
	}

	private render_text(rx: RenderContext): void {
		const text: DialogLetter[][] = [];

		let b = false;

		for (const line of this.textboxOptions.dialog.split('\n')) {
			let cl;
			text.push((cl = []));
			for (const l of line) {
				if (l === '[') {
					b = true;
				} else if (l === ']') {
					b = false;
				} else {
					cl.push({ l, b });
				}
			}
		}

		let y = 620;
		for (const line of text) {
			let f = false;
			if (line.length) {
				let x = 270;
				let i = 0;
				while (i < line.length) {
					let ct = '';
					const cb = line[i].b;

					f = f || cb;

					while (i < line.length && line[i].b === cb) {
						ct += line[i].l;
						if (cb) {
							ct += ' ';
						}
						i++;
					}

					rx.drawText(
						ct,
						x,
						y,
						'left',
						cb ? 8 : 2,
						'#fff',
						cb ? '#000' : '#523140',
						'24px aller'
					);
					x += rx.measureText(ct).width;
				}
			}
			y += 26;
		}
	}

	private display(): void {
		if (!this.sdCtx) return;
		this.renderer.paintOnto(
			this.sdCtx,
			0,
			0,
			this.canvasWidth,
			this.canvasHeight
		);
	}

	private async render_bg(
		rx: RenderContext,
		downloadRendering: boolean
	): Promise<void> {
		if (!this.currentBackground) return;
		if (
			downloadRendering &&
			this.currentBackground.path === '/backgrounds/transparent'
		) {
			return;
		}
		rx.drawImage(await getAsset(this.currentBackground.path, rx.hq), 0, 0);
	}

	private downloadURI(uri: string, name: string) {
		const link = document.createElement('a');
		link.download = name;
		link.href = uri;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	private async download() {
		this.selectedGirl = null;
		await this.render_(true);
		this.renderer.download('shitpost.png');
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
		const sx = (rx / sd.width) * 1280;
		const sy = (ry / sd.width) * 720;

		const girl = sy > 50 && sy < 550 ? this.girl_at(sx) : null;

		this.selectedGirl = girl;
	}
	private girl_at(x: number) {
		for (let i = this.girls.length - 1; i >= 0; i--) {
			if (Math.abs(girlPositions[this.girls[i].pos]! - x) < 120) {
				return this.girls[i];
			}
		}

		return null;
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
		} else if (targetIdx >= this.girls.length - 1) {
			this.girls.push(event.girl);
		} else {
			this.girls.splice(targetIdx, 0, event.girl);
		}
		this.invalidateRender();
	}
}

interface DialogLetter {
	l: string;
	b: boolean;
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
