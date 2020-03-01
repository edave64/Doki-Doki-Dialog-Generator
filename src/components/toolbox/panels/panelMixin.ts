import { Component, Vue, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class-decorator';

@Component({})
export class PanelMixin extends Vue {
	@State('vertical', { namespace: 'ui' }) private readonly vertical!: boolean;

	public mounted() {
		this.updateVertical();
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

	@Watch('vertical')
	private updateVertical() {
		if (!this.$el) return;
		if (this.vertical) {
			this.$el.classList.add('vertical');
		} else {
			this.$el.classList.remove('vertical');
		}
	}
}
