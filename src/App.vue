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
		<message-console :loading="currentlyRendering" id="messages" />
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
					:has-prev-render="prevRender !== ''"
					:lqRendering.sync="lqRendering"
					@show-prev-render="showPreviousRender"
				/>
				<add-panel v-if="panel === 'add'" />
				<backgrounds-panel
					v-if="panel === 'backgrounds'"
					v-model="currentBackground"
					@invalidate-render="invalidateRender"
				/>
				<credits-panel v-if="panel === 'credits'" />
				<character-panel v-if="panel === 'character'" :character="selectedCharacter" />
				<sprite-panel v-if="panel === 'sprite'" :sprite="selectedSprite.obj" />
			</keep-alive>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class-decorator';

import DokiButton from './components/DokiButton.vue';
import GeneralPanel from './components/panels/general.vue';
import AddPanel from './components/panels/add.vue';
import CharacterPanel from './components/panels/character.vue';
import SpritePanel from './components/panels/sprite.vue';
import CreditsPanel from './components/panels/credits.vue';
import BackgroundsPanel from './components/panels/backgrounds.vue';
import MessageConsole from './components/message-console.vue';
import { characterPositions } from './models/constants';
import { Textbox } from './models/textbox';
import { Character } from './models/character';
import { Sprite } from './models/sprite';
import { IDragable } from './models/dragable';
import { Background, IBackground, nsfwFilter } from './models/background';
import { VariantBackground } from './models/variant-background';
import { IRenderable } from './models/renderable';
import { ISprite, ICreateSpriteAction } from './store/objectTypes/sprite';
import {
	IObjectsState,
	IObject,
	ISetObjectPositionMutation,
	IRemoveObjectAction,
} from './store/objects';
import { IHistorySupport } from './plugins/vuex-history';
import {
	ICharacter,
	IShiftCharacterSlotAction,
	INsfwCheckAction,
} from './store/objectTypes/characters';
import { Renderer } from './renderer/renderer';
import { RenderContext } from './renderer/rendererContext';
import { backgrounds, getAsset, registerAsset } from './asset-manager';
import eventBus, { InvalidateRenderEvent } from './eventbus/event-bus';

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
	private selectedCharacter: Character | null = null;
	private selectedSprite: Sprite | null = null;
	private characterSelectorOpen: boolean = false;
	private backgroundSelectorOpen: boolean = false;
	private editDialog: boolean = false;

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

	@State('vertical', { namespace: 'ui' }) private readonly vertical!: boolean;
	@State('nsfw', { namespace: 'ui' }) private readonly nsfw!: boolean;

	private get history(): IHistorySupport {
		return this.$root as any;
	}

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
				rx.drawText({
					text: 'Starting...',
					x: this.renderer.width / 2,
					y: this.renderer.height / 2,
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

				for (const character of this.renderObjects) {
					if (!character.infront) {
						await character.render(rx);
					}
				}

				await this.textbox.render(rx);

				for (const character of this.renderObjects) {
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
		eventBus.subscribe(InvalidateRenderEvent, command => {
			this.invalidateRender();
		});
		this.$store.subscribe(this.invalidateRender);
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
			document.documentElement.clientWidth,
			document.documentElement.clientHeight
		);

		this.canvasWidth = cw;
		this.canvasHeight = ch;
		this.$store.commit('ui/setVertical', v);
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
		if (this.prevRender && window.URL && window.URL.revokeObjectURL) {
			URL.revokeObjectURL(this.prevRender);
		}
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
		return this.renderObjects.filter(renderObject =>
			renderObject.hitTest(x, y)
		);
	}

	private draggedObject: IObject | null = null;
	private dragXOffset: number = 0;
	private dragYOffset: number = 0;
	private dragXOriginal: number = 0;
	private dragYOriginal: number = 0;

	private onDragStart(e: DragEvent) {
		e.preventDefault();
		const selected = this.selectedCharacter || this.selectedSprite;
		if (!selected) return;
		this.draggedObject = selected.obj;
		const [x, y] = this.toRendererCoordinate(e.clientX, e.clientY);
		this.dragXOffset = x - this.draggedObject.x;
		this.dragYOffset = y - this.draggedObject.y;
		this.dragXOriginal = this.draggedObject.x;
		this.dragYOriginal = this.draggedObject.y;
	}

	private onTouchStart(e: TouchEvent) {
		const selected = this.selectedCharacter || this.selectedSprite;
		if (!selected) return;
		this.draggedObject = selected.obj;
		const [x, y] = this.toRendererCoordinate(
			e.touches[0].clientX,
			e.touches[0].clientY
		);
		this.dragXOffset = x - this.draggedObject.x;
		this.dragYOffset = y - this.draggedObject.y;
		this.dragXOriginal = this.draggedObject.x;
		this.dragYOriginal = this.draggedObject.y;
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

			this.history.transaction(() => {
				this.$store.dispatch('objects/setPosition', {
					id: this.draggedObject!.id,
					x,
					y,
				} as ISetObjectPositionMutation);
			});
		}
	}

	private async onDrop(e: DragEvent) {
		e.stopPropagation();
		e.preventDefault();

		if (!e.dataTransfer) return;

		for (const item of e.dataTransfer.items) {
			if (item.kind === 'file' && item.type.match(/image.*/)) {
				const name = 'dropCustomAsset' + ++this.dropSpriteCount;
				const url = registerAsset(name, item.getAsFile()!);

				this.history.transaction(async () => {
					await this.$store.dispatch('objects/createSprite', {
						assetName: name,
					} as ICreateSpriteAction);
				});
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
			this.$store.dispatch('objects/removeObject', {
				id: target.obj.id,
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

		if (target) {
			if (target instanceof Character && false /* target.obj.moveFreely */) {
				if (e.key === 'ArrowLeft') {
					this.$store.dispatch('objects/shiftCharacterSlot', {
						id: target!.obj.id,
						delta: -1,
					} as IShiftCharacterSlotAction);
				}
				if (e.key === 'ArrowRight') {
					this.$store.dispatch('objects/shiftCharacterSlot', {
						id: target!.obj.id,
						delta: 1,
					} as IShiftCharacterSlotAction);
				}
				return;
			}
			let x = target ? target.obj.x : 0;
			let y = target ? target.obj.y : 0;
			if (e.key === 'ArrowLeft') {
				x -= e.shiftKey ? 1 : 20;
			} else if (target && e.key === 'ArrowRight') {
				x += e.shiftKey ? 1 : 20;
			} else if (target && e.key === 'ArrowUp') {
				y -= e.shiftKey ? 1 : 20;
			} else if (target && e.key === 'ArrowDown') {
				y += e.shiftKey ? 1 : 20;
			} else {
				console.log(e);
				return;
			}
			this.$store.dispatch('objects/setPosition', {
				id: target!.obj.id,
				x,
				y,
			} as ISetObjectPositionMutation);
		}
		console.log(e);
		return;
	}

	private renderObjectCache: { [id: string]: IRenderable } = {};
	private get renderObjects() {
		const objectsState = this.$store.state.objects as IObjectsState;
		const order = [...objectsState.order, ...objectsState.onTopOrder];
		const objects = this.$store.state.objects
			.objects as IObjectsState['objects'];
		const toUncache = Object.keys(this.renderObjectCache).filter(
			id => !order.includes(id)
		);

		for (const id of toUncache) {
			this.$delete(this.renderObjectCache, id);
		}

		return order.map(id => {
			if (!this.renderObjectCache[id]) {
				const obj = objects[id];
				switch (obj.type) {
					case 'sprite':
						this.renderObjectCache[id] = new Sprite((obj as any) as ISprite);
						break;
					case 'character':
						this.renderObjectCache[id] = new Character(
							(obj as any) as ICharacter
						);
						break;
				}
			}
			this.renderObjectCache[id].obj = objects[id];
			return this.renderObjectCache[id];
		});
	}

	@Watch('nsfw')
	onNSFWChange(newNSFW: boolean) {
		if (!this.currentBackground) return;
		if (newNSFW) return;
		if (this.currentBackground.nsfw) {
			this.currentBackground = backgrounds[0];
		}
		nsfwFilter(this.currentBackground);
		for (const character of this.renderObjects) {
			if (character instanceof Character) {
				this.$store.dispatch('objects/nsfwCheck', {
					id: character.obj.id,
				} as INsfwCheckAction);
			}
		}
		this.invalidateRender();
	}
}
</script>

<style lang="scss">
html,
body {
	overflow: hidden;
	font-family: aller;
}

* {
	margin: 0;
	padding: 0;
	border: 0;
	box-sizing: border-box;
}

fieldset {
	border: 3px solid #ffbde1;
}

h1 {
	font-size: 24px;
	color: black;
	font-family: riffic;
	text-align: center;
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
