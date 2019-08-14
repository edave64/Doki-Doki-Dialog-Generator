import { poses, girlPositions } from './constants';

export type GirlName = 'sayori' | 'yuri' | 'natsuki' | 'monika';

export class Girl {
	public name: GirlName;
	public pose: {
		left: number;
		right: number;
		head: number;
	};
	public pos: number;
	public infront: boolean;
	public close: boolean;
	private ctx: CanvasRenderingContext2D;
	private selected: boolean = false;

	public constructor(name: GirlName, ctx: CanvasRenderingContext2D) {
		this.name = name;
		this.pose = {
			left: 0,
			right: 0,
			head: 0,
		};
		this.pos = 4;
		this.infront = false;
		this.close = false;
		this.ctx = ctx;
	}

	public select() {
		this.selected = true;
	}

	public unselect() {
		this.selected = false;
	}

	public render() {
		const left = poses[this.name].left[this.pose.left];
		const right = poses[this.name].right[this.pose.right];
		const head = poses[this.name].head[this.pose.head];
		const size = this.close ? 720 * 2 : 720;
		const x = girlPositions[this.pos]! - size / 2;
		const y = this.close ? -100 : 0;

		this.ctx.drawImage(
			head,
			x,
			y + (this.name === 'monika' ? 1 : 0),
			size,
			size
		);
		this.ctx.drawImage(left, x, y, size, size);
		this.ctx.drawImage(right, x, y, size, size);

		if (this.selected) {
			this.ctx.beginPath();
			this.ctx.rect(x + size / 3, 50, size / 3, 620);
			this.ctx.strokeStyle = 'red';
			this.ctx.lineWidth = 3;
			this.ctx.stroke();
		}
	}

	public headl() {
		if (this.pose.head-- === 0) {
			this.pose.head = poses[this.name].head.length - 1;
		}
		this.render();
	}
	public headr() {
		if (++this.pose.head === poses[this.name].head.length) {
			this.pose.head = 0;
		}
		this.render();
	}
	public leftl() {
		if (this.pose.left-- === 0) {
			this.pose.left = poses[this.name].left.length - 1;
		}
		this.render();
	}
	public leftr() {
		if (++this.pose.left === poses[this.name].left.length) {
			this.pose.left = 0;
		}
		this.render();
	}
	public rightl() {
		if (this.pose.right-- === 0) {
			this.pose.right = poses[this.name].right.length - 1;
		}
		this.render();
	}
	public rightr() {
		if (++this.pose.right === poses[this.name].right.length) {
			this.pose.right = 0;
		}
		this.render();
	}
}
