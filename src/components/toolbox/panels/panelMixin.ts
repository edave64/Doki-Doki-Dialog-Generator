import { VerticalScrollRedirect } from '@/components/vertical-scroll-redirect';
import { ComponentOptionsMixin } from 'vue';

export const PanelMixin: ComponentOptionsMixin = {
	mixins: [VerticalScrollRedirect],
	computed: {
		vertical(): boolean {
			return this.$store.state.ui.vertical;
		},
	},
	mounted() {
		this.updateVertical();
		this.$el.addEventListener(
			'wheel',
			(e: WheelEvent) => {
				if (!this.vertical) this.verticalScrollRedirect(e as WheelEvent);
			},
			{
				passive: true,
			}
		);
	},
	methods: {
		updateVertical() {
			if (!this.$el) return;
			if (this.vertical) {
				this.$el.classList.add('vertical');
			} else {
				this.$el.classList.remove('vertical');
			}
		},
	},
	watch: {
		vertical() {
			(this as any).updateVertical();
		},
	},
};
