import { Component, Vue, Watch, Mixins } from 'vue-property-decorator';
import { State } from 'vuex-class-decorator';
import { VerticalScrollRedirect } from '@/components/vertical-scroll-redirect';

const firefoxDeltaFactor = 25;

@Component({})
export class PanelMixin extends Mixins(VerticalScrollRedirect) {
	@State('vertical', { namespace: 'ui' }) private readonly vertical!: boolean;

	public mounted() {
		this.updateVertical();
		this.$el.addEventListener('wheel', this.verticalScrollRedirect as any, {
			passive: true,
		});
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
