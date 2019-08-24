import { RenderContext } from '../renderer/rendererContext';
import { getAsset } from '../asset-manager';

export class Textbox {
	public display: boolean = true;
	public corrupted: boolean = false;
	public showControls: boolean = true;
	public allowSkipping: boolean = true;
	public showContinueArrow: boolean = true;
	public talking: string = '';
	public customName: string = '';
	public dialog: string = '';

	public async render(rx: RenderContext) {
		if (!this.display) return;

		if (this.corrupted) {
			rx.drawImage(await getAsset('textbox_monika'), 190, 565);
		} else {
			rx.drawImage(await getAsset('textbox'), 232, 565);
		}

		const name = this.talking;
		if (name) {
			rx.drawImage(await getAsset('namebox'), 264, 565 - 39);
			rx.drawText(
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

		this.renderText(rx);

		if (this.showControls) {
			rx.drawText(
				'Skip',
				566,
				700,
				'left',
				1,
				this.allowSkipping ? '#522' : '#a66',
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

		if (this.showContinueArrow) {
			rx.drawImage(await getAsset('next'), 1020, 685);
		}
	}

	private renderText(rx: RenderContext): void {
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
}

interface DialogLetter {
	l: string;
	b: boolean;
}
