import { RenderContext } from '../renderer/rendererContext';
import { getAsset, Pose, INsfwAbleImg } from '../asset-manager';
import { Renderer } from '../renderer/renderer';
import { IRenderable } from './renderable';
import { IDragable } from './dragable';
import {
	getData,
	ICharacter,
	getPose,
	getParts,
	getHeads,
	CloseUpYOffset,
} from '@/store/objectTypes/characters';

export class Character implements IRenderable, IDragable {
	public get infront(): boolean {
		return this.obj.onTop;
	}
	public id: string = '';
	private lq: boolean = true;
	private selected: boolean = false;
	private localRenderer = new Renderer(960, 960);
	private lastVersion = -1;
	private hitDetectionFallback = false;

	public constructor(public readonly obj: ICharacter) {}

	public get label() {
		return getData(this.obj).name;
	}

	public select() {
		this.selected = true;
	}

	public unselect() {
		this.selected = false;
	}

	public async updateLocalCanvas() {
		await this.localRenderer.render(async rx => {
			const pose = getPose(this.obj) as Pose<any>;
			const assets: string[] = [];
			const partKeys = getParts(this.obj);
			const data = getData(this.obj);
			const currentHeads = getHeads(this.obj);

			const poseFolder =
				(data.folder ? data.folder + '/' : '') +
				(pose.folder ? pose.folder + '/' : '');

			const headFolder =
				(data.folder ? data.folder + '/' : '') +
				(currentHeads && currentHeads.folder ? currentHeads.folder + '/' : '');

			if ((pose as any).static) {
				assets.push(poseFolder + (pose as any).static);
			} else {
				for (const key of partKeys) {
					if (key === 'head') continue;
					const image: string | INsfwAbleImg = (pose as any)[key][
						this.obj.posePositions[key]
					];

					assets.push(
						poseFolder +
							(typeof image === 'string' ? image : (image as INsfwAbleImg).img)
					);
				}
			}

			const head = currentHeads
				? headFolder + currentHeads.all[this.obj.posePositions.head]
				: null;

			const [headAsset, ...bodyParts] = await Promise.all([
				head ? getAsset(head, rx.hq) : Promise.resolve(null),
				...assets.map(asset => getAsset(asset, rx.hq)),
			]);

			const drawHead = () => {
				if (headAsset) {
					const headAnchor = pose.headAnchor ? pose.headAnchor : [0, 0];

					rx.drawImage({
						image: headAsset,
						x: headAnchor[0],
						y:
							(this.obj.characterType === 'ddlc.monika' ? 1 : 0) +
							headAnchor[1],
					});
				}
			};

			if (!pose.headInForeground) {
				drawHead();
			}

			for (const bodyPart of bodyParts) {
				rx.drawImage({ image: bodyPart!, x: 0, y: 0 });
			}

			if (pose.headInForeground) {
				drawHead();
			}
			this.lastVersion = this.obj.version;
		});
	}

	public async render(rx: RenderContext) {
		if (this.lastVersion !== this.obj.version || this.lq !== !rx.hq) {
			await this.updateLocalCanvas();
		}

		const zoom = this.obj.close ? 1.6 : 0.8;
		const size = 960 * zoom;
		const x = this.obj.x - size / 2;
		const y = (this.obj.close ? CloseUpYOffset : 0) + this.obj.y;

		rx.drawImage({
			image: this.localRenderer,
			x,
			y,
			w: size,
			h: size,
			flip: this.obj.flip,
			shadow:
				this.selected && rx.preview ? { blur: 20, color: 'red' } : undefined,
			opacity: this.obj.opacity,
		});
	}

	public hitTest(hx: number, hy: number): boolean {
		const zoom = this.obj.close ? 1.6 : 0.8;
		const size = 960 * zoom;
		let x = (hx - this.obj.x + size / 2) / zoom;
		const y = (hy - this.obj.y) / zoom;

		if (this.obj.flip) {
			x = 960 - x;
		}
		if (!this.hitDetectionFallback) {
			try {
				const data = this.localRenderer.getDataAt(x, y);
				return data[3] !== 0;
			} catch (e) {
				// On chrome for android, the hit test tends to fail because of cross-origin shenanigans, even though
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

		if (y < 50 || y > 680) return false;
		return Math.abs(x - 480) < 150;
	}
}
