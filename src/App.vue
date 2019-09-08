<template>
	<div id="app">
		<div id="container">
			<canvas
				id="scaled_display"
				ref="sd"
				height="720"
				width="1280"
				:style="{width: canvasWidth+ 'px', height: canvasHeight + 'px'}"
				draggable
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
			>HTML5 is required to use the Doki Doki Dialog Generator.</canvas>
		</div>
		<message-console :loading="currentlyRendering" id="messages" :class="{ vertical }" />
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
					:has-prev-render="prevRender !== ''"
					:lqRendering.sync="lqRendering"
					:nsfw.sync="nsfw"
					@show-prev-render="showPreviousRender"
				/>
				<add-panel
					v-if="panel === 'add'"
					:vertical="vertical"
					@chosen="onCharacterCreate"
					@add-custom-asset="onAssetCreate"
				/>
				<backgrounds-panel
					v-if="panel === 'backgrounds'"
					:vertical="vertical"
					v-model="currentBackground"
					:nsfw="nsfw"
					@invalidate-render="invalidateRender"
				/>
				<credits-panel v-if="panel === 'credits'" :vertical="vertical" />
				<character-panel
					v-if="panel === 'character'"
					:vertical="vertical"
					:character="selectedCharacter"
					:nsfw="nsfw"
					@shiftLayer="onObjectLayerShift"
					@invalidate-render="invalidateRender"
				/>
				<sprite-panel
					v-if="panel === 'sprite'"
					:vertical="vertical"
					:sprite="selectedSprite"
					@shiftLayer="onObjectLayerShift"
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
import CharacterPanel, { MoveObject } from './components/panels/character.vue';
import SpritePanel from './components/panels/sprite.vue';
import CreditsPanel from './components/panels/credits.vue';
import BackgroundsPanel from './components/panels/backgrounds.vue';
import MessageConsole from './components/message-console.vue';
import { characterPositions } from './models/constants';
import { Textbox } from './models/textbox';
import { Character, CharacterIds } from './models/character';
import { backgrounds, getAsset, registerAsset } from './asset-manager';
import { Renderer } from './renderer/renderer';
import { RenderContext } from './renderer/rendererContext';
import { Background, IBackground, nsfwFilter } from './models/background';
import { IRenderable } from './models/renderable';
import { Sprite } from './models/sprite';
import { IDragable } from './models/dragable';
import { VariantBackground } from './models/variant-background';

@Component({
	components: {
		DokiButton,
		GeneralPanel,
		AddPanel,
		BackgroundsPanel,
		CreditsPanel,
		CharacterPanel,
		SpritePanel,
		MessageConsole,
	},
})
export default class App extends Vue {
	public canvasWidth: number = 0;
	public canvasHeight: number = 0;
	public currentBackground: IBackground | null = null;

	private sdCtx: CanvasRenderingContext2D | undefined;
	private characters: IRenderable[] = [];
	private selectedCharacter: Character | null = null;
	private selectedSprite: Sprite | null = null;
	private characterSelectorOpen: boolean = false;
	private backgroundSelectorOpen: boolean = false;
	private editDialog: boolean = false;

	private vertical: boolean = false;
	private nsfw: boolean = false;
	private textbox = new Textbox();

	private renderer: Renderer = new Renderer();
	private showUI: boolean = true;
	private loaded: boolean = false;
	private uiSize: number = 192;
	private lqRendering: boolean = true;
	private currentlyRendering: boolean = false;

	private panel: string = '';

	private queuedRender: number | null = null;
	private prevRender: string = '';
	private showingLast: boolean = false;

	private dropSpriteCount = 0;
	private dropPreventClick = false;

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

	@Watch('selectedSprite')
	public onSelectedSpriteChange(newSprite: Sprite, oldSprite: Sprite) {
		if (oldSprite) oldSprite.unselect();
		if (newSprite) {
			newSprite.select();
			this.panel = 'sprite';
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
		this.currentlyRendering = true;
		try {
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
				if (rx.preview) {
					rx.drawImage({
						x: 0,
						y: 0,
						image: await getAsset('backgrounds/transparent'),
					});
				}

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
		} finally {
			this.currentlyRendering = false;
		}
	}

	private created(): void {
		(window as any).cats = this;
		window.removeEventListener('keydown', this.onKeydown);
		window.addEventListener('keydown', this.onKeydown);
	}

	private destroyed(): void {
		window.removeEventListener('keydown', this.onKeydown);
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
		debugger;
		Promise.all([
			getAsset((this.currentBackground as VariantBackground).path, false),
			getAsset('textbox'),
			getAsset('namebox'),
			getAsset('next'),
			getAsset('backgrounds/transparent'),
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
		this.showingLast = false;
		this.renderer.paintOnto(this.sdCtx, 0, 0, 1280, 720);
	}

	private async download() {
		this.selectedCharacter = null;
		this.prevRender = await this.renderer.download(
			this.renderCallback,
			'panel.png'
		);
	}

	private async showPreviousRender() {
		if (this.showingLast) {
			this.display();
			return;
		}
		this.showingLast = true;
		const img = new Image();
		img.onload = () => {
			this.sdCtx!.drawImage(img, 0, 0, 1280, 720);
		};
		img.src = this.prevRender;
	}

	private onCharacterCreate(character: CharacterIds): void {
		this.characterSelectorOpen = false;
		this.characters.push(new Character(character, this.invalidateRender));
		this.invalidateRender();
	}

	private toRendererCoordinate(x: number, y: number): [number, number] {
		const sd = this.$refs.sd as HTMLCanvasElement;
		const rx = x - sd.offsetLeft;
		const ry = y - sd.offsetTop;
		const sx = (rx / sd.offsetWidth) * sd.width;
		const sy = (ry / sd.offsetWidth) * sd.width;
		return [sx, sy];
	}

	private onUiClick(e: MouseEvent): void {
		if (this.dropPreventClick) {
			this.dropPreventClick = false;
			return;
		}

		this.panel = '';

		const [sx, sy] = this.toRendererCoordinate(e.clientX, e.clientY);

		const characters = this.objectsAt(sx, sy);

		const currentCharacterIdx = characters.indexOf(
			(this.selectedCharacter || this.selectedSprite)!
		);
		let selectedObject: IRenderable | null;

		if (currentCharacterIdx === 0) {
			selectedObject = null;
		} else if (currentCharacterIdx !== -1) {
			// Select the next lower character
			selectedObject = characters[currentCharacterIdx - 1];
		} else {
			selectedObject = characters[characters.length - 1] || null;
		}

		if (!selectedObject) {
			this.selectedCharacter = null;
			this.selectedSprite = null;
		} else if (selectedObject instanceof Sprite) {
			this.selectedCharacter = null;
			this.selectedSprite = selectedObject;
		} else if (selectedObject instanceof Character) {
			this.selectedSprite = null;
			this.selectedCharacter = selectedObject;
		} else {
			throw new Error('Unknown selected object');
		}
	}

	private objectsAt(x: number, y: number): IRenderable[] {
		return this.characters.filter(character => character.hitTest(x, y));
	}

	private onObjectLayerShift(event: MoveObject): void {
		const idx = this.characters.indexOf(event.object);
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
			this.characters.unshift(event.object);
		} else if (targetIdx >= this.characters.length) {
			this.characters.push(event.object);
		} else {
			this.characters.splice(targetIdx, 0, event.object);
		}
		this.invalidateRender();
	}

	private onAssetCreate(assetName: string) {
		this.characters.push(new Sprite(assetName, this.invalidateRender));
	}

	private draggedObject: IDragable | null = null;
	private dragXOffset: number = 0;
	private dragYOffset: number = 0;
	private dragXOriginal: number = 0;
	private dragYOriginal: number = 0;

	private onDragStart(e: DragEvent) {
		e.preventDefault();
		const selected = this.selectedCharacter || this.selectedSprite;
		if (!selected) return;
		this.draggedObject = selected;
		const [x, y] = this.toRendererCoordinate(e.clientX, e.clientY);
		this.dragXOffset = x - selected.x;
		this.dragYOffset = y - selected.y;
		this.dragXOriginal = selected.x;
		this.dragYOriginal = selected.y;
	}

	private onTouchStart(e: TouchEvent) {
		const selected = this.selectedCharacter || this.selectedSprite;
		if (!selected) return;
		this.draggedObject = selected;
		const [x, y] = this.toRendererCoordinate(
			e.touches[0].clientX,
			e.touches[0].clientY
		);
		this.dragXOffset = x - selected.x;
		this.dragYOffset = y - selected.y;
		this.dragXOriginal = selected.x;
		this.dragYOriginal = selected.y;
	}

	private onDragOver(e: DragEvent) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer!.dropEffect = 'copy';
	}

	private onSpriteDragMove(e: MouseEvent | TouchEvent) {
		if (this.draggedObject) {
			e.preventDefault();

			let [x, y] =
				e instanceof MouseEvent
					? this.toRendererCoordinate(e.clientX, e.clientY)
					: this.toRendererCoordinate(
							e.touches[0].clientX,
							e.touches[0].clientY
					  );
			x -= this.dragXOffset;
			y -= this.dragYOffset;

			const deltaX = Math.abs(x - this.dragXOriginal);
			const deltaY = Math.abs(y - this.dragYOriginal);

			if (deltaX + deltaY > 1) this.dropPreventClick = true;

			if (e.shiftKey) {
				const deltaX = Math.abs(x - this.dragXOriginal);
				const deltaY = Math.abs(y - this.dragYOriginal);

				if (deltaX > deltaY) {
					y = this.dragYOriginal;
				} else {
					x = this.dragXOriginal;
				}
			}

			this.draggedObject.x = x;
			this.draggedObject.y = y;
			this.invalidateRender();
		}
	}

	private onDrop(e: DragEvent) {
		e.stopPropagation();
		e.preventDefault();

		if (!e.dataTransfer) return;

		for (const item of e.dataTransfer.items) {
			if (item.kind === 'file' && item.type.match(/image.*/)) {
				const name = 'dropCustomAsset' + ++this.dropSpriteCount;
				const url = registerAsset(name, item.getAsFile()!);
				this.onAssetCreate(name);
			}
		}
	}

	private onSpriteDrop(e: MouseEvent | TouchEvent) {
		if (this.draggedObject) {
			if ('TouchEvent' in window && e instanceof TouchEvent) {
				this.dropPreventClick = false;
			}
			this.draggedObject = null;
		}
	}

	private onMouseEnter(e: MouseEvent) {
		if (e.buttons !== 1) {
			this.draggedObject = null;
		}
	}

	private onKeydown(e: KeyboardEvent) {
		const target = this.selectedCharacter || this.selectedSprite;
		if (target && e.key === 'Delete') {
			this.onObjectLayerShift({
				object: target,
				move: 'Delete',
			});
		} else if (target && e.key === 'ArrowLeft') {
			if (target instanceof Character && !target.allowFreeMove) {
				target.pos -= 1;
			} else {
				target.x -= e.shiftKey ? 1 : 20;
				target.x |= 0;
			}
			this.invalidateRender();
		} else if (target && e.key === 'ArrowRight') {
			if (target instanceof Character && !target.allowFreeMove) {
				target.pos += 1;
			} else {
				target.x += e.shiftKey ? 1 : 20;
				target.x |= 0;
			}
			this.invalidateRender();
		} else if (target && e.key === 'ArrowUp') {
			target.y -= e.shiftKey ? 1 : 20;
			target.y |= 0;
			this.invalidateRender();
		} else if (target && e.key === 'ArrowDown') {
			target.y += e.shiftKey ? 1 : 20;
			target.y |= 0;
			this.invalidateRender();
		} else {
			console.log(e);
		}
	}

	@Watch('nsfw')
	onNSFWChange(newNSFW: boolean) {
		if (!this.currentBackground) return;
		if (newNSFW) return;
		if (this.currentBackground.nsfw) {
			this.currentBackground = backgrounds[0];
		}
		nsfwFilter(this.currentBackground);
		for (const character of this.characters) {
			if (character instanceof Character) {
				character.nsfwCheck();
			}
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

#messages {
	position: absolute;

	&.vertical {
		right: 200px;
		top: 0;
	}

	&:not(.vertical) {
		bottom: 200px;
		left: 0;
	}
}
</style>
