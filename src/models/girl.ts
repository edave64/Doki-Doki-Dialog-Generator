import { girlPositions } from './constants';
import { RenderContext } from '../renderer/rendererContext';
import { poses, getAsset } from '../asset-manager';

export type GirlName = 'sayori' | 'yuri' | 'natsuki' | 'monika';

export class Girl {
	public pose = {
		left: 0,
		right: 0,
		head: 0,
	};
	public pos: number = 4;
	public infront: boolean = false;
	public close: boolean = false;
	private selected: boolean = false;

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

	public async render(rx: RenderContext) {
		const left = poses[this.name].left[this.pose.left];
		const right = poses[this.name].right[this.pose.right];
		const head = poses[this.name].head[this.pose.head];
		const size = this.close ? 720 * 2 : 720;
		const x = girlPositions[this.pos]! - size / 2;
		const y = this.close ? -100 : 0;

		const [headAsset, leftAsset, rightAsset] = await Promise.all([
			getAsset(head, rx.hq),
			getAsset(left, rx.hq),
			getAsset(right, rx.hq),
		]);

		rx.drawImage(
			headAsset,
			x,
			y + (this.name === 'monika' ? 1 : 0),
			size,
			size
		);
		rx.drawImage(leftAsset, x, y, size, size);
		rx.drawImage(rightAsset, x, y, size, size);

		if (this.selected) {
			rx.drawRectOutline(x + size / 3, 50, size / 3, 620, 'red', 3);
		}
	}

	public headl() {
		if (this.pose.head-- === 0) {
			this.pose.head = poses[this.name].head.length - 1;
			this.invalidator();
		}
	}
	public headr() {
		if (++this.pose.head === poses[this.name].head.length) {
			this.pose.head = 0;
			this.invalidator();
		}
	}
	public leftl() {
		if (this.pose.left-- === 0) {
			this.pose.left = poses[this.name].left.length - 1;
			this.invalidator();
		}
	}
	public leftr() {
		if (++this.pose.left === poses[this.name].left.length) {
			this.pose.left = 0;
			this.invalidator();
		}
	}
	public rightl() {
		if (this.pose.right-- === 0) {
			this.pose.right = poses[this.name].right.length - 1;
			this.invalidator();
		}
	}
	public rightr() {
		if (++this.pose.right === poses[this.name].right.length) {
			this.pose.right = 0;
			this.invalidator();
		}
	}
}
