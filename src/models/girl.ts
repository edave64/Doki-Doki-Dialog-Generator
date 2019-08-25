import { girlPositions } from './constants';
import { RenderContext } from '../renderer/rendererContext';
import { dokis, getAsset, Pose, IDoki, IDokiHeads } from '../asset-manager';
import { Renderer } from '../renderer/renderer';

export type GirlName = 'sayori' | 'yuri' | 'natsuki' | 'monika';
export type Part = 'variant' | 'left' | 'right' | 'head';

export class Girl {
	public pos: number = 4;
	public infront: boolean = false;
	public close: boolean = false;
	public flip: boolean = false;
	private lq: boolean = true;
	private selected: boolean = false;
	private poseId: number = 0;
	private posePositions = {
		variant: 0,
		left: 0,
		right: 0,
		head: 0,
		headType: 0,
	};
	private localRenderer = new Renderer(960, 960);
	private dirty = true;

	public constructor(
		public readonly name: GirlName,
		private readonly invalidator: Invalidator
	) {}

	public select() {
		this.selected = true;
	}

	public unselect() {
		this.selected = false;
	}

	public get doki(): IDoki<any> {
		return dokis[this.name];
	}

	public get pose(): Pose<any> {
		return this.doki.poses[this.poseId];
	}

	public getParts(): Part[] {
		const pose = this.pose;
		const head: Array<'head'> =
			this.pose.compatibleHeads.length > 0 ? ['head'] : [];

		if ('variant' in pose) {
			return [...head, 'variant'];
		}
		if ('left' in pose) {
			return [...head, 'left', 'right'];
		}
		return head;
	}

	public get currentHeads(): IDokiHeads | null {
		if (!this.pose.compatibleHeads || this.pose.compatibleHeads.length === 0) {
			return null;
		}
		const heads = this.doki.heads[
			this.pose.compatibleHeads[this.posePositions.headType]
		];
		if (heads instanceof Array) {
			return {
				all: heads,
			};
		}
		return heads;
	}

	public async updateLocalCanvas() {
		await this.localRenderer.render(async rx => {
			const pose = this.pose as Pose<any>;
			const assets: string[] = [];
			const partKeys = this.getParts();

			const poseFolder =
				(this.doki.folder ? this.doki.folder + '/' : '') +
				(this.pose.folder ? this.pose.folder + '/' : '');

			const headFolder =
				(this.doki.folder ? this.doki.folder + '/' : '') +
				(this.currentHeads && this.currentHeads.folder
					? this.currentHeads.folder + '/'
					: '');

			if ((pose as any).static) {
				assets.push(poseFolder + (pose as any).static);
			} else {
				for (const key of partKeys) {
					if (key === 'head') continue;
					assets.push(poseFolder + (pose as any)[key][this.posePositions[key]]);
				}
			}

			const head = this.currentHeads
				? headFolder + this.currentHeads.all[this.posePositions.head]
				: null;

			const [headAsset, ...bodyParts] = await Promise.all([
				head ? getAsset(head, rx.hq) : Promise.resolve(null),
				...assets.map(asset => getAsset(asset, rx.hq)),
			]);

			if (headAsset) {
				const headAnchor = this.pose.headAnchor ? this.pose.headAnchor : [0, 0];

				rx.drawImage({
					image: headAsset,
					x: headAnchor[0],
					y: (this.name === 'monika' ? 1 : 0) + headAnchor[1],
				});
			}
			for (const bodyPart of bodyParts) {
				rx.drawImage({ image: bodyPart!, x: 0, y: 0 });
			}
		});
	}

	public async render(rx: RenderContext) {
		if (this.dirty || this.lq !== !rx.hq) {
			await this.updateLocalCanvas();
		}

		const zoom = this.close ? 2 : 1;
		const size = 720 * zoom;
		const x = girlPositions[this.pos]! - size / 2;
		const y = this.close ? -100 : 0;

		rx.drawImage({
			image: this.localRenderer,
			x,
			y,
			w: size,
			h: size,
			flip: this.flip,
			shadow: this.selected ? { blur: 20, color: 'red' } : undefined,
		});
	}

	public hittest(hx: number, hy: number): boolean {
		const zoom = this.close ? 1.6 : 0.8;
		const size = 960 * zoom;
		const x = (hx - girlPositions[this.pos]! + size / 2) / zoom;
		const y = (hy - (this.close ? -100 : 0)) / zoom;

		const data = this.localRenderer.getDataAt(x, y);

		return data[3] !== 0;
	}

	public headl(): void {
		if (!this.currentHeads) return;
		--this.posePositions.head;
		if (this.posePositions.head < 0) {
			--this.posePositions.headType;
			if (this.posePositions.headType < 0) {
				this.posePositions.headType = this.pose.compatibleHeads.length - 1;
			}
			this.posePositions.head = this.currentHeads.all.length - 1;
		}
		this.dirty = true;
		this.invalidator();
	}

	public headr(): void {
		if (!this.currentHeads) return;
		++this.posePositions.head;
		if (this.posePositions.head >= this.currentHeads.all.length) {
			++this.posePositions.headType;
			if (this.posePositions.headType >= this.pose.compatibleHeads.length) {
				this.posePositions.headType = 0;
			}
			this.posePositions.head = 0;
		}
		this.dirty = true;
		this.invalidator();
	}

	public partl(part: Part) {
		if (part === 'head') return this.headl();
		if (!(this.pose as any)[part]) return;
		--this.posePositions[part];

		if (this.posePositions[part] < 0) {
			this.posePositions[part] = (this.pose as any)[part].length - 1;
		}
		this.dirty = true;
		this.invalidator();
	}

	public partr(part: Part) {
		if (part === 'head') return this.headr();
		if (!(this.pose as any)[part]) return;
		++this.posePositions[part];

		if (this.posePositions[part] >= (this.pose as any)[part].length) {
			this.posePositions[part] = 0;
		}
		this.dirty = true;
		this.invalidator();
	}

	public posel() {
		const oldHeadCollection = this.pose.compatibleHeads[
			this.posePositions.headType
		];
		--this.poseId;
		if (this.poseId < 0) {
			this.poseId = this.doki.poses.length - 1;
		}
		const newHeadCollectionNr = this.pose.compatibleHeads.indexOf(
			oldHeadCollection
		);
		if (newHeadCollectionNr >= 0) {
			this.posePositions.headType = newHeadCollectionNr;
		} else {
			this.posePositions.headType = 0;
			this.posePositions.head = 0;
		}
		this.posePositions.left = 0;
		this.posePositions.right = 0;
		this.posePositions.variant = 0;
		this.dirty = true;
		this.invalidator();
	}

	public poser() {
		const oldHeadCollection = this.pose.compatibleHeads[
			this.posePositions.headType
		];
		++this.poseId;
		if (this.poseId >= this.doki.poses.length) {
			this.poseId = 0;
		}
		const newHeadCollectionNr = this.pose.compatibleHeads.indexOf(
			oldHeadCollection
		);
		if (newHeadCollectionNr >= 0) {
			this.posePositions.headType = newHeadCollectionNr;
		} else {
			this.posePositions.headType = 0;
			this.posePositions.head = 0;
		}
		this.posePositions.left = 0;
		this.posePositions.right = 0;
		this.posePositions.variant = 0;
		this.dirty = true;
		this.invalidator();
	}
}
