import { reactive } from 'vue';

type Runner<P, R> = (
	payload: P,
	isRunning: () => boolean
) => Promise<R | undefined>;

type Disposer<R> = (payload: R) => Promise<void>;

export class WorkBatch<P, R> {
	private state = reactive({
		busy: false,
		error: null as string | null,
		completed: 0,
		fullCount: 0,
	});
	private pendingData: P[] = [];
	private currentlyRunning = new Set<P>();
	private resolveCurrentRun: null | ((data: Array<R | undefined>) => void) =
		null;
	private rejectCurrentRun: null | (() => void) = null;
	private returnData: Array<R | undefined> = [];

	private remainingDisposers: Set<R> = new Set<R>();
	private runningDisposers: Set<R> = new Set<R>();

	public constructor(
		private readonly runner: Runner<P, R>,
		private readonly disposer: Disposer<R>,
		private readonly parallel = 4
	) {}

	public run(newData: P[]): Promise<Array<R | undefined>> {
		if (this.rejectCurrentRun) {
			this.reject();
		}
		newData = newData.slice();
		this.pendingData = newData;
		this.returnData = [];
		this.state.fullCount = newData.length;
		this.state.error = null;
		this.state.busy = true;
		this.state.completed = 0;
		return new Promise((resolve, reject) => {
			this.resolveCurrentRun = resolve;
			this.rejectCurrentRun = reject;
			if (newData.length > 0) {
				this.restock();
			} else {
				this.resolve();
			}
		});
	}

	private get remainingCapacity() {
		return (
			this.parallel - this.currentlyRunning.size - this.runningDisposers.size
		);
	}

	private restock() {
		while (this.remainingCapacity > 0 && this.pendingData.length > 0) {
			this.startOne();
		}
		while (this.remainingCapacity > 0 && this.remainingDisposers.size > 0) {
			this.startDisposer();
		}
	}

	private async startOne() {
		const data = this.pendingData.shift();
		const idx = this.returnData.length;
		this.returnData[idx] = undefined;
		if (!data) return;
		this.currentlyRunning.add(data);
		const isRunning = () => this.currentlyRunning.has(data);
		let ret: R | undefined;
		try {
			ret = await this.runner(data, isRunning);
		} catch (e) {
			this.reject(e as Error);
		}
		if (isRunning()) {
			++this.state.completed;
			this.returnData[idx] = ret;
			this.currentlyRunning.delete(data);
			if (this.currentlyRunning.size === 0 && this.pendingData.length === 0) {
				this.resolve();
			}
		} else if (ret !== undefined) {
			this.remainingDisposers.add(ret);
		}
		this.restock();
	}

	private async startDisposer() {
		const data = this.remainingDisposers.values().next().value;
		this.remainingDisposers.delete(data);
		this.runningDisposers.add(data);
		try {
			await this.disposer(data);
		} catch (e) {}
		this.runningDisposers.delete(data);
		this.restock();
	}

	private resolve() {
		this.state.busy = false;
		// Just to be sure
		this.state.completed = this.state.fullCount;
		const returnData = this.returnData;
		const resolveCurrentRun = this.resolveCurrentRun!;
		this.reset();
		resolveCurrentRun(returnData);
	}

	private reject(e?: Error) {
		this.state.busy = false;
		this.state.error = e?.message || null;
		const returnData = this.returnData;
		const rejectCurrentRun = this.rejectCurrentRun!;
		this.reset();
		for (const data of returnData) {
			if (data !== undefined) this.remainingDisposers.add(data);
		}
		rejectCurrentRun();
	}

	private reset() {
		this.returnData = [];
		this.currentlyRunning = new Set<P>();
		this.resolveCurrentRun = null;
		this.rejectCurrentRun = null;
	}

	public get busy(): boolean {
		return this.state.busy;
	}

	public get fullCount(): number {
		return this.state.fullCount;
	}

	public get completed(): number {
		return this.state.completed;
	}

	public get percentage(): number {
		if (this.fullCount === 0) return 0;
		return this.completed / this.fullCount;
	}

	public get error(): string | null {
		return this.state.error;
	}
}
