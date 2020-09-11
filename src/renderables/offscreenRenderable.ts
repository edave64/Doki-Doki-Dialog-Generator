import { RenderContext } from '@/renderer/rendererContext';
import { getAsset, getAAsset } from '@/asset-manager';
import { Renderer } from '@/renderer/renderer';
import { IRenderable, IHitbox } from './renderable';
import {
	ICharacter,
	getPose,
	getHeads,
	CloseUpYOffset,
	getData,
} from '@/store/objectTypes/characters';
import {
	Pose,
	Character as CharacterModel,
	PoseRenderCommand,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAsset } from '@/store/content';
import { ErrorAsset } from '../models/error-asset';
import { DeepReadonly } from '@/util/readonly';
import { Store } from 'vuex';
import { IRootState } from '@/store';

export class OffscreenRenderable implements IRenderable {
	public styleData = {
		lastBase: '',
		components: {} as { [component: string]: string },
	};
	private hq: boolean = false;
	private localRenderer: Renderer | null = null;
	private lastVersion = -1;
	private hitDetectionFallback = false;

	public get id(): string {
		return this.obj.id;
	}

	public constructor(
		public readonly obj: DeepReadonly<ICharacter>,
		private data: DeepReadonly<CharacterModel<IAsset>>
	) {}

	public updatedContent(store: Store<DeepReadonly<IRootState>>): void {
		this.data = getData(store, this.obj);
	}

	public async updateLocalCanvas(hq: boolean) {
		const pose = getPose(this.data, this.obj) as Pose<IAsset>;
		this.localRenderer = new Renderer(pose.size[0], pose.size[1]);
		this.hq = hq;
		await this.localRenderer.render(
			async rx => {
				const currentHeads = getHeads(this.data, this.obj);

				const drawAssetsUnloaded: IDrawAssetsUnloaded[] = [];

				for (const renderCommand of pose.renderCommands) {
					switch (renderCommand.type) {
						case 'head':
							drawAssetsUnloaded.push({
								offset: renderCommand.offset,
								composite: renderCommand.composite,
								assets: currentHeads
									? currentHeads.variants[this.obj.posePositions.head || 0]
									: [],
							});
							break;
						case 'image':
							drawAssetsUnloaded.push({
								offset: renderCommand.offset,
								composite: renderCommand.composite,
								assets: renderCommand.images,
							});
							break;
						case 'pose-part':
							const posePosition = pose.positions[renderCommand.part];
							if (!posePosition || posePosition.length === 0) {
								break;
							}
							const partAssets =
								posePosition[this.obj.posePositions[renderCommand.part] || 0];
							if (!partAssets) break;
							drawAssetsUnloaded.push({
								offset: renderCommand.offset,
								composite: renderCommand.composite,
								assets: partAssets,
							});
							break;
					}
					console.log(renderCommand, JSON.stringify(drawAssetsUnloaded));
				}

				const loadedDraws = await Promise.all(
					drawAssetsUnloaded
						.filter(drawAsset => drawAsset.assets)
						.map(drawAsset => loadAssets(drawAsset, rx.hq))
				);

				for (const loadedDraw of loadedDraws) {
					for (const asset of loadedDraw.assets) {
						rx.drawImage({
							image: asset,
							composite: loadedDraw.composite,
							x: loadedDraw.offset[0],
							y: loadedDraw.offset[1],
						});
					}
				}

				this.lastVersion = this.obj.version;
			},
			this.hq,
			false
		);
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
		if (
			this.localRenderer === null ||
			this.lastVersion !== this.obj.version ||
			this.hq !== rx.hq
		) {
			await this.updateLocalCanvas(!rx.hq);
		}

		const w = this.width;
		const h = this.height;
		const x = this.x - w / 2;
		const y = this.y;

		rx.drawImage({
			image: this.localRenderer!,
			x,
			y,
			w,
			h,
			flip: this.obj.flip,
			shadow: selected && rx.preview ? { blur: 20, color: 'red' } : undefined,
			composite: this.obj.composite,
			filters: this.obj.filters,
		});
	}

	public hitTest(hx: number, hy: number): boolean {
		if (!this.localRenderer) return false;

		const scaledX = hx - (this.x - this.width / 2);
		const scaledY = hy - this.y;

		if (scaledX < 0 || scaledX > this.width) return false;
		if (scaledY < 0 || scaledY > this.height) return false;

		if (!this.hitDetectionFallback) {
			try {
				const flippedX = this.obj.flip ? this.width - scaledX : scaledX;
				const scaleX = this.localRenderer.width / this.width;
				const scaleY = this.localRenderer.height / this.height;
				const data = this.localRenderer.getDataAt(
					Math.round(flippedX * scaleX),
					Math.round(scaledY * scaleY)
				);
				// tslint:disable-next-line: no-magic-numbers
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

	public getHitbox(): IHitbox {
		return {
			x0: this.x - this.width / 2,
			x1: this.x + this.width / 2,
			y0: this.y,
			y1: this.y + this.height,
		};
	}
}

interface IDrawAssetsUnloaded {
	offset: DeepReadonly<[number, number]>;
	assets: DeepReadonly<IAsset[]>;
	composite: PoseRenderCommand<any>['composite'];
}

interface IDrawAssets {
	offset: DeepReadonly<[number, number]>;
	assets: DeepReadonly<Array<HTMLImageElement | ErrorAsset>>;
	composite: PoseRenderCommand<any>['composite'];
}

async function loadAssets(
	unloaded: IDrawAssetsUnloaded,
	hq: boolean
): Promise<IDrawAssets> {
	return {
		offset: unloaded.offset,
		assets: await Promise.all(
			unloaded.assets.map(asset => getAAsset(asset, hq))
		),
		composite: unloaded.composite,
	};
}
