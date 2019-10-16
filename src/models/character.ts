import { RenderContext } from '@/renderer/rendererContext';
import { getAsset, Pose, INsfwAbleImg } from '@/asset-manager';
import { Renderer } from '@/renderer/renderer';
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
	private lq: boolean = true;
	private localRenderer = new Renderer(960, 960);
	private lastVersion = -1;
	private hitDetectionFallback = false;

	public get id(): string {
		return this.obj.id;
	}

	public constructor(public readonly obj: ICharacter) {}

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

	public get width() {
		const zoom = this.obj.close ? 2 : 1;
		return this.obj.width * zoom;
	}

	public get height() {
		const zoom = this.obj.close ? 2 : 1;
		return this.obj.height * zoom;
	}

	public get x() {
		return this.obj.x;
	}

	public get y() {
		return (this.obj.close ? CloseUpYOffset : 0) + this.obj.y;
	}

	public async render(selected: boolean, rx: RenderContext) {
		if (this.lastVersion !== this.obj.version || this.lq !== !rx.hq) {
			await this.updateLocalCanvas();
		}

		const w = this.width;
		const h = this.height;
		const x = this.x - w / 2;
		const y = this.y;

		rx.drawImage({
			image: this.localRenderer,
			x,
			y,
			w,
			h,
			flip: this.obj.flip,
			shadow: selected && rx.preview ? { blur: 20, color: 'red' } : undefined,
			opacity: this.obj.opacity,
		});
	}

	public hitTest(hx: number, hy: number): boolean {
		const scaledX = hx - (this.x - this.width / 2);
		const scaledY = hy - this.y;

		if (scaledX < 0 || scaledX > this.width) return false;
		if (scaledY < 0 || scaledY > this.height) return false;

		if (!this.hitDetectionFallback) {
			try {
				const flippedX = this.obj.flip ? this.width - scaledX : scaledX;
				const scaleX = 960 / this.width;
				const scaleY = 960 / this.height;
				const data = this.localRenderer.getDataAt(
					Math.round(flippedX * scaleX),
					Math.round(scaledY * scaleY)
				);
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

		return true;
	}
}
