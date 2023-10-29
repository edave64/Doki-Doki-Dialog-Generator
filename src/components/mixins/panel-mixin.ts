import { verticalScrollRedirect } from '@/components/mixins/vertical-scroll-redirect';
import { IRootState } from '@/store';
import {
	ComponentOptionsMixin,
	ComponentPublicInstance,
	computed,
	onMounted,
	Ref,
	watch,
} from 'vue';
import { Store, useStore } from 'vuex';

export const PanelMixin: ComponentOptionsMixin = {
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
				if (!this.vertical) verticalScrollRedirect(e as WheelEvent);
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

export function setupPanelMixin(
	root: Ref<HTMLElement | ComponentPublicInstance>
) {
	const store = useStore() as Store<IRootState>;
	const vertical = computed(() => store.state.ui.vertical);

	function getRoot(): HTMLElement {
		const rootV = root.value;
		if (!rootV) return null!;
		if ((rootV as ComponentPublicInstance).$el) {
			return (rootV as ComponentPublicInstance).$el;
		}
		return rootV as HTMLElement;
	}

	function updateVertical() {
		if (!root.value) return;
		getRoot().classList.toggle('vertical', vertical.value);
	}

	watch(() => vertical.value, updateVertical);

	onMounted(() => {
		updateVertical();
		getRoot().addEventListener(
			'wheel',
			(e: WheelEvent) => {
				if (!vertical.value) verticalScrollRedirect(e as WheelEvent);
			},
			{ passive: true }
		);
	});

	return { vertical };
}
