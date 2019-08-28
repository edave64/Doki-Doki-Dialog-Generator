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
				<button
					:class="{ active: panel === 'credits' }"
					@click="panel = panel === 'credits' ? '' : 'credits'"
				>C</button>
				<button @click="download">D</button>
			</div>
			<keep-alive>
				<general-panel
					v-if="panel === ''"
					:options="textbox"
					:vertical="vertical"
					:lqRendering.sync="lqRendering"
				/>
				<add-panel v-if="panel === 'add'" :vertical="vertical" @chosen="onCharacterCreate" />
				<backgrounds-panel
					v-if="panel === 'backgrounds'"
					:vertical="vertical"
					v-model="currentBackground"
				/>
				<credits-panel v-if="panel === 'credits'" :vertical="vertical" />
				<character-panel
					v-if="panel === 'character'"
					:vertical="vertical"
					:character="selectedCharacter"
					@shiftLayer="onCharacterLayerShift"
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
import CharacterPanel, {
	MoveCharacter,
} from './components/panels/character.vue';
import CreditsPanel from './components/panels/credits.vue';
import BackgroundsPanel from './components/panels/backgrounds.vue';
import { characterPositions } from './models/constants';
import { Textbox } from './models/textbox';
import { Character, CharacterIds } from './models/character';
import { backgrounds, getAsset } from './asset-manager';
import { Renderer } from './renderer/renderer';
import { RenderContext } from './renderer/rendererContext';
import { Background } from './models/background';

@Component({
	components: {
		DokiButton,
		GeneralPanel,
		AddPanel,
		BackgroundsPanel,
		CreditsPanel,
		CharacterPanel,
	},
})
export default class App extends Vue {
	public canvasWidth: number = 0;
	public canvasHeight: number = 0;
	public currentBackground: Background | null = null;

	private sdCtx: CanvasRenderingContext2D | undefined;
	private characters: Character[] = [];
	private selectedCharacter: Character | null = null;
	private characterSelectorOpen: boolean = false;
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

	private queuedRender: number | null = null;

	private hitDetectionFallback = false;

	@Watch('selectedCharacter')
	public onSelectedCharacterChange(
		newCharacter: Character,
		oldCharacter: Character
	) {
		if (oldCharacter) oldCharacter.unselect();
		if (newCharacter) {
			newCharacter.select();
			this.panel = 'character';
		}
		this.invalidateRender();
	}

	@Watch('panel')
	public onPanel(newPanel: string) {
		if (newPanel !== 'character') {
			this.selectedCharacter = null;
		}
	}

	@Watch('textbox', { deep: true })
	@Watch('lqRendering')
	@Watch('currentBackground')
	public invalidateRender() {
		if (this.queuedRender) return;
		this.queuedRender = requestAnimationFrame(() => this.render_());
	}

	public async render_(): Promise<void> {
		if (this.queuedRender) {
			cancelAnimationFrame(this.queuedRender);
			this.queuedRender = null;
		}

		const completed = await this.renderer.render(
			this.renderCallback,
			!this.lqRendering
		);
		if (completed) {
			this.display();
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

			for (const character of this.characters) {
				if (!character.infront) {
					await character.render(rx);
				}
			}

			await this.textbox.render(rx);

			for (const character of this.characters) {
				if (character.infront) {
					await character.render(rx);
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
				this.selectedCharacter = null;
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
		this.renderer.paintOnto(this.sdCtx, 0, 0, 1280, 720);
	}

	private async download() {
		this.selectedCharacter = null;
		this.renderer.download(this.renderCallback, 'panel.png');
	}

	private onCharacterCreate(character: CharacterIds): void {
		this.characterSelectorOpen = false;
		this.characters.push(new Character(character, this.invalidateRender));
		this.invalidateRender();
	}

	private onUiClick(e: MouseEvent): void {
		this.panel = '';

		const sd = this.$refs.sd as HTMLCanvasElement;
		const rx = e.clientX - sd.offsetLeft;
		const ry = e.clientY - sd.offsetTop;
		const sx = (rx / sd.offsetWidth) * sd.width;
		const sy = (ry / sd.offsetWidth) * sd.width;

		const characters = sy > 50 ? this.characterAt(sx, sy) : [];

		const currentCharacterIdx = characters.indexOf(this.selectedCharacter!);

		if (currentCharacterIdx === 0) {
			this.selectedCharacter = null;
		} else if (currentCharacterIdx !== -1) {
			// Select the next lower character
			this.selectedCharacter = characters[currentCharacterIdx - 1];
		} else {
			this.selectedCharacter = characters[characters.length - 1] || null;
		}
	}
	private characterAt(x: number, y: number): Character[] {
		if (!this.hitDetectionFallback) {
			try {
				return this.characters.filter(character => character.hittest(x, y));
			} catch (e) {
				// On chrome for android, the hit test tends to fail because of cross-origin shinanigans, even though
				// we only ever load from one origin. ¯\_(ツ)_/¯
				// So we have a fallback that doesn't read the contents of the canvas. This looses accuracy, but at
				// least works always.
				if (e instanceof DOMException && e.message.includes('cross-origin')) {
					this.hitDetectionFallback = true;
				} else {
					throw e;
				}
			}
		}

		if (y > 550) return [];
		return this.characters.filter(
			character => Math.abs(characterPositions[character.pos]! - x) < 120
		);
	}
	private onCharacterLayerShift(event: MoveCharacter): void {
		const idx = this.characters.indexOf(event.character);
		let targetIdx = idx;
		this.characters.splice(idx, 1);
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
				targetIdx = this.characters.length;
				break;
			case 'Delete':
				this.panel = '';
				this.invalidateRender();
				return;
		}
		if (targetIdx <= 0) {
			this.characters.unshift(event.character);
		} else if (targetIdx >= this.characters.length) {
			this.characters.push(event.character);
		} else {
			this.characters.splice(targetIdx, 0, event.character);
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
	background-color: #ffffff;
	border: 3px solid #ffbde1;
	position: absolute;
	display: flex;

	.panel {
		display: flex;
		flex-direction: column;
		padding: 4px;

		h1 {
			margin: 0;
			color: black;
			font-family: riffic;
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
					border-right: 3px solid white;
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
					border-bottom: 3px solid white;
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

			&.active {
				background: white;
			}
		}
	}
}
</style>
