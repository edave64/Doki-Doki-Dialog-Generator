import Vue from 'vue';
import Component from 'vue-class-component';

@Component({})
export class PanelMixin extends Vue {
	private mounted() {
		this.$el.addEventListener(
			'wheel',
			e => {
				if (e.type !== 'wheel') return;
				if (!e.currentTarget) return;
				const target = e.currentTarget as HTMLElement;
				if (target.classList.contains('vertical')) return;

				const ev = e as WheelEvent;
				if (ev.deltaY === 0) return;
				if ((ev as any).mozInputSource) {
					// Firefox sends wierdly low delta values :/
					target.scrollLeft += ev.deltaY * 25;
				} else {
					target.scrollLeft += ev.deltaY;
				}
			},
			{ passive: true }
		);
	}
}
