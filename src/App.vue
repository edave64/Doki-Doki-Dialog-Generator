<template>
	<div id="app">
		<div id="container">
			<canvas id="scaled_display" ref="sd">
				HTML5 is required to use this
				<strike>shitpost</strike>meme generator.
			</canvas>
		</div>
		<div
			ref="ui"
			id="ui"
			:style="{ 
				top: area.top + 'px',
				left: area.left + 'px',
				height: area.height + 'px',
				width: area.width + 'px',
				display: showUI ? 'block' : 'none'
			}"
			@click="onUiClick"
		>
			<doki-button style="float:right;" @click="close_guis(); dokiSelectorOpen = true">Add character</doki-button>
			<doki-button @click="close_guis(); backgroundSelectorOpen = true">Change background</doki-button>
			<br />
			<br />
			<doki-button @click="close_guis();editDialog=true;">Edit text</doki-button>
			<div id="ui_bl">
				<toggle label="Textbox visible?" v-model="renderTextbox" />
				<toggle label="Textbox corrupt?" v-model="corruptedTextbox" />
				<br />Person talking:
				<select v-model="talking">
					<option value>No-one</option>
					<option value="Sayori">Sayori</option>
					<option value="Yuri">Yuri</option>
					<option value="Natsuki">Natsuki</option>
					<option value="Monika">Monika</option>
					<option value="other">Other</option>
				</select>
				<toggle label="Controls visible?" v-model="showControls" />
				<toggle label="Able to skip?" v-model="allowSkipping" />
				<toggle label="Continue arrow?" v-model="showContinueArrow" />
			</div>
			<div id="ui_br">
				<doki-button @click="download">Download</doki-button>
			</div>
			<div style="float:clear;width:1px;height:2em;"></div>
			<doki-settings
				v-if="selectedGirl"
				:girl="selectedGirl"
				@close="selectedGirl = null"
				@shiftLayer="onDokiLayerShift"
				@invalidate-render="render_"
			/>
		</div>
		<assets />
		<doki-button id="hsui" @click="showUI = !showUI">{{showUI ? "Show UI" : "Hide UI"}}</doki-button>
		<doki-selector v-if="dokiSelectorOpen" @chosen="onDokiChosen" />
		<background-selector
			v-if="backgroundSelectorOpen"
			v-model="currentBackground"
			@input="render_();close_guis()"
		/>
		<dialog-editor v-if="editDialog" v-model="dialog" lazy @close="close_guis()" />
		<ip />
	</div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import DokiButton from './components/DokiButton.vue';
import DokiSettings, { MoveGirl } from './components/DokiSettings.vue';
import DokiSelector from './components/DokiSelector.vue';
import BackgroundSelector from './components/BackgroundSelector.vue';
import Assets from './components/Assets.vue';
import Ip from './components/Ip.vue';
import Toggle from './components/Toggle.vue';
import DialogEditor from './components/DialogEditor.vue';
import { IApp } from './models/app';
import { Background } from './models/background';
import { backgrounds, girlPositions, poses } from './models/constants';
import { Girl, GirlName } from './models/girl';

@Component({
	components: {
		DokiButton,
		DokiSettings,
		DokiSelector,
		Assets,
		Toggle,
		DialogEditor,
		BackgroundSelector,
		Ip,
	},
})
export default class App extends Vue implements IApp {
	public area = {
		top: 0,
		left: 0,
		width: 0,
		height: 0,
	};
	public currentBackground: Background | null = null;

	private fs!: HTMLCanvasElement;
	private fsCtx!: CanvasRenderingContext2D;
	private sdCtx: CanvasRenderingContext2D | undefined;
	private girls: Girl[] = [];
	private selectedGirl: Girl | null = null;
	private dokiSelectorOpen: boolean = false;
	private backgroundSelectorOpen: boolean = false;
	private editDialog: boolean = false;

	private renderTextbox: boolean = true;
	private corruptedTextbox: boolean = false;
	private showControls: boolean = true;
	private allowSkipping: boolean = true;
	private showContinueArrow: boolean = true;
	private talking: string = '';
	private customName: string = '';
	private dialog: string = '';

	private showUI: boolean = true;

	private loaded: boolean = false;

	public close_guis(): void {
		this.selectedGirl = null;
		this.dokiSelectorOpen = false;
		this.backgroundSelectorOpen = false;
		this.editDialog = false;
	}

	@Watch('selectedGirl')
	public onSelectedGirlChange(newGirl: Girl, oldGirl: Girl) {
		if (oldGirl) oldGirl.unselect();
		if (newGirl) newGirl.select();
		this.render_();
	}

	@Watch('renderTextbox')
	@Watch('corruptedTextbox')
	@Watch('showControls')
	@Watch('allowSkipping')
	@Watch('showContinueArrow')
	@Watch('talking')
	@Watch('customName')
	@Watch('dialog')
	public async render_(): Promise<void> {
		if (!this.loaded) {
			const sd = this.$refs.sd as HTMLCanvasElement;
			this.fsCtx.clearRect(0, 0, this.fs.width, this.fs.height);

			this.drawText(
				'Starting...',
				this.fs.width / 2,
				this.fs.height / 2,
				'center',
				5,
				'white',
				'#b59',
				'32px riffic'
			);
		} else {
			this.render_bg();

			for (const girl of this.girls) {
				if (!girl.infront) {
					girl.render();
				}
			}

			await this.render_textbox();

			for (const girl of this.girls) {
				if (girl.infront) {
					girl.render();
				}
			}
		}

		this.display();
	}

	private created(): void {
		this.fs = document.createElement('canvas');
		this.fs.width = 1280;
		this.fs.height = 720;
		this.fsCtx = this.fs.getContext('2d')!;

		(window as any).cats = this;
	}

	private drawText(
		text: string,
		x: number,
		y: number,
		align: CanvasTextAlign,
		w: number,
		col: string,
		ocol: string,
		font: string
	): void {
		w = w || 1;
		col = col || 'white';
		ocol = ocol || '#533643';
		font = font || '20px aller';

		this.fsCtx.fillStyle = col;
		this.fsCtx.strokeStyle = ocol;
		this.fsCtx.lineWidth = 2 * w;
		this.fsCtx.textAlign = align;
		this.fsCtx.font = font;
		this.fsCtx.lineJoin = 'round';

		this.fsCtx.strokeText(text, x, y);
		this.fsCtx.fillText(text, x, y);
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
		for (const el of document.getElementById('assets')!.children) {
			const type = el.getAttribute('what');
			const element = el as HTMLImageElement;

			if (type === 'bg') {
				backgrounds.push(new Background(element));
			}

			this.currentBackground = backgrounds[0];

			if (type === 'pose') {
				poses[element.getAttribute('girl') as GirlName][
					element.getAttribute('part') as ('head' | 'right' | 'left')
				].push(element);
			}
		}

		Promise.all([
			this.getAsset('initBG'),
			this.getAsset('tbimg'),
			this.getAsset('namebox'),
			this.getAsset('contarr'),
		])
			.then(() => {
				this.loaded = true;
				this.render_();
			})
			.catch(() => {
				alert('Error while loading. Sorry :/');
			});

		/*
		setInterval(() => {
			let tb;

			if ((tb = document.querySelector('#ted > textarea'))) {
				tb.style.height = tb.parentNode.offsetHeight - tb.offsetTop - 48 + 'px';
			}
		}, 64);*/
	}

	private updateArea(): void {
		const sd = this.$refs.sd as HTMLCanvasElement;
		sd.width = sd.offsetWidth;
		sd.height = sd.offsetHeight;
		this.area.top = sd.offsetTop;
		this.area.left = sd.offsetLeft;
		this.area.width = sd.width;
		this.area.height = sd.height;
		this.render_();
	}

	@Watch('talking')
	private talkingChange(newName: string, oldName: string): void {
		if (newName === oldName) return;
		if (newName !== 'other') return;
		const customName = prompt('Enter name:');
		if (customName) {
			this.customName = customName;
		}
	}

	private async render_textbox(): Promise<void> {
		if (!this.renderTextbox) return;

		if (this.corruptedTextbox) {
			this.fsCtx.drawImage(await this.getAsset('tbimg_corrupt'), 190, 565);
		} else {
			this.fsCtx.drawImage(await this.getAsset('tbimg'), 232, 565);
		}

		const name = this.talking;
		if (name) {
			this.fsCtx.drawImage(await this.getAsset('namebox'), 264, 565 - 39);
			this.drawText(
				name === 'other' ? this.customName : name,
				264 + 84,
				565 - 10,
				'center',
				3,
				'white',
				'#b59',
				'24px riffic'
			);
		}

		this.render_text();

		if (this.showControls) {
			this.fsCtx.font = '13px aller';
			this.fsCtx.fillStyle = this.allowSkipping ? '#522' : '#a66';
			this.fsCtx.textAlign = 'left';

			this.fsCtx.fillText('Skip', 566, 700);

			this.fsCtx.fillStyle = '#522';

			this.fsCtx.fillText('History', 512, 700);
			this.fsCtx.fillText('Auto   Save   Load   Settings', 600, 700);
		}

		if (this.showContinueArrow) {
			this.fsCtx.drawImage(await this.getAsset('contarr'), 1020, 685);
		}
	}

	private render_text(): void {
		const text: DialogLetter[][] = [];

		let b = false;

		for (const line of this.dialog.split('\n')) {
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

					this.drawText(
						ct,
						x,
						y,
						'left',
						cb ? 8 : 2,
						'#fff',
						cb ? '#000' : '#523140',
						'24px aller'
					);
					x += this.fsCtx.measureText(ct).width;
				}
			}
			y += 26;
		}
	}

	private getAsset(name: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const element = document.getElementById(name) as HTMLImageElement;
			if (element.complete) {
				resolve(element);
				return;
			}
			element.addEventListener('load', () => resolve(element));
		});
	}

	private display(): void {
		if (!this.sdCtx) return;
		this.sdCtx.drawImage(this.fs, 0, 0, this.area.width, this.area.height);
	}

	private render_bg(): void {
		if (!this.currentBackground) return;
		this.fsCtx.drawImage(this.currentBackground.el, 0, 0);
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
		await this.render_();
		this.downloadURI(this.fs.toDataURL(), 'shitpost.png');
	}

	private onDokiChosen(girl: GirlName): void {
		this.dokiSelectorOpen = false;
		this.girls.push(new Girl(girl, this.fsCtx));
		this.render_();
	}

	private onBackgroundChosen(): void {
		this.backgroundSelectorOpen = false;

		this.render_();
	}

	private onUiClick(e: MouseEvent): void {
		if (e.target !== this.$refs.ui) return;
		this.close_guis();

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
				this.render_();
				return;
		}
		if (targetIdx <= 0) {
			this.girls.unshift(event.girl);
		} else if (targetIdx >= this.girls.length - 1) {
			this.girls.push(event.girl);
		} else {
			this.girls.splice(targetIdx, 0, event.girl);
		}
		this.render_();
	}
}

interface DialogLetter {
	l: string;
	b: boolean;
}
</script>

<style lang="scss">
@font-face {
	font-family: aller;
	font-weight: normal;
	font-style: normal;
	src: url(/assets/aller.ttf);
}

@font-face {
	font-family: riffic;
	font-weight: normal;
	font-style: normal;
	src: url(/assets/riffic.ttf);
}

html,
body {
	margin: 0;
	overflow: hidden;

	font-family: aller;
}

#container {
	width: 100vw;
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
}

#scaled_display {
	width: 70vw;
	height: 39.375vw;
}

#ui {
	//display: none;
	position: absolute;
	padding: 1em;
	box-sizing: border-box;
}

#ui_bl {
	position: absolute;
	bottom: 3em;
	left: 1em;
	display: inline-block;
	background-color: #ffe6f480;
	height: 9em;
	padding: 1em;
}

#ui_br {
	position: absolute;
	bottom: 1em;
	right: 1em;
	display: inline-block;
}

#hsui {
	position: absolute;
	bottom: 1em;
	right: 1em;
	padding: 4px 0;
	width: 6em;
	text-align: center;
}
</style>
