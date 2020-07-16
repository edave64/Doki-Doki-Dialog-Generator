import { Component, Vue } from 'vue-property-decorator';

const firefoxDeltaFactor = 25;

@Component({})
export class VerticalScrollRedirect extends Vue {
	public verticalScrollRedirect(e: WheelEvent) {
		if (e.type !== 'wheel') return;
		if (!e.currentTarget) return;
		const currentTarget = e.currentTarget as HTMLElement;
		let target = e.target as HTMLElement;

		while (target !== currentTarget && target) {
			if (target.scrollHeight > target.clientHeight) {
				e.stopImmediatePropagation();
				return false;
			}
			target = target.parentElement!;
		}

		const ev = e as WheelEvent;
		if (ev.deltaY === 0) return;
		if ((ev as any).mozInputSource) {
			// Firefox sends wierdly low delta values :/
			currentTarget.scrollLeft += ev.deltaY * firefoxDeltaFactor;
		} else {
			currentTarget.scrollLeft += ev.deltaY;
		}
	}
}
