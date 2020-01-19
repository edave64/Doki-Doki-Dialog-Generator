import { RenderContext } from '@/renderer/rendererContext';
import { getAsset, getAAsset } from '@/asset-manager';
import { Renderer } from '@/renderer/renderer';
import { IRenderable } from './renderable';
import { IDragable } from './dragable';
import {
	ICharacter,
	getPose,
	getParts,
	getHeads,
	CloseUpYOffset,
	getDataG,
} from '@/store/objectTypes/characters';
import {
	Pose,
	Character as CharacterModel,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAsset } from '@/store/content';
import { IRootState } from '@/store';
import { Store } from 'vuex';
import { ErrorAsset } from './error-asset';

export class Character implements IRenderable, IDragable {
	public styleData = {
		lastBase: '',
		components: {} as { [component: string]: string },
	};
	private lq: boolean = true;
	private localRenderer = new Renderer(960, 960);
	private lastVersion = -1;
	private hitDetectionFallback = false;

	public get id(): string {
		return this.obj.id;
	}

	public constructor(
		public readonly obj: ICharacter,
		private $store: Store<IRootState>
	) {}

	public async updateLocalCanvas() {
		await this.localRenderer.render(async rx => {
			const data = this.getData();
			const pose = getPose(data, this.obj) as Pose<IAsset>;
			let assets: Array<IAsset | 'head'> = [];
			let headAssets: IAsset[] = [];
			const partKeys = getParts(data, this.obj);
			const currentHeads = getHeads(data, this.obj);

			console.log(pose.renderOrder);
			for (const renderPart of pose.renderOrder.toLowerCase()) {
				switch (renderPart) {
					case 'l':
						assets = ([] as Array<IAsset | 'head'>).concat(
							assets,
							pose.left[this.obj.posePositions.left]
						);
						break;
					case 'r':
						assets = ([] as Array<IAsset | 'head'>).concat(
							assets,
							pose.right[this.obj.posePositions.right]
						);
						break;
					case 's':
						assets = ([] as Array<IAsset | 'head'>).concat(assets, pose.static);
						break;
					case 'v':
						assets = ([] as Array<IAsset | 'head'>).concat(
							assets,
							pose.variant[this.obj.posePositions.variant]
						);
						break;
					case 'h':
						headAssets = currentHeads
							? currentHeads.variants[this.obj.posePositions.head]
							: [];
						assets.push('head');
						break;
				}
			}

			assets = assets.filter(asset => asset);
			const [loadedAssets, loadedHeadAssets]: [
				Array<HTMLImageElement | ErrorAsset | string>,
				Array<HTMLImageElement | ErrorAsset>
			] = await Promise.all([
				Promise.all(
					assets.map(asset =>
						typeof asset === 'string'
							? Promise.resolve(asset)
							: getAAsset(asset, rx.hq)
					)
				),
				Promise.all(headAssets.map(asset => getAAsset(asset, rx.hq))),
			]);

			for (const loadedAsset of loadedAssets) {
				if (loadedAsset === 'head') {
					for (const loadedheadAsset of loadedHeadAssets) {
						rx.drawImage({
							image: loadedheadAsset,
							x: pose.headAnchor[0],
							y: pose.headAnchor[1],
						});
					}
				} else {
					rx.drawImage({ image: loadedAsset, x: 0, y: 0 });
				}
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

	public getData(): CharacterModel<IAsset> {
		return getDataG(this.$store.getters, this.obj);
	}
}
