import { Component, Vue } from 'vue-property-decorator';

const firefoxDeltaFactor = 25;

@Component({})
export class VerticalScrollRedirect extends Vue {
	public verticalScrollRedirect(e: WheelEvent) {
		if (e.type !== 'wheel') return;
		if (!e.currentTarget) return;
		const target = e.currentTarget as HTMLElement;

		const ev = e as WheelEvent;
		if (ev.deltaY === 0) return;
		if ((ev as any).mozInputSource) {
			// Firefox sends wierdly low delta values :/
			target.scrollLeft += ev.deltaY * firefoxDeltaFactor;
		} else {
			target.scrollLeft += ev.deltaY;
		}
	}
}
