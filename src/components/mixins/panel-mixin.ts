import { verticalScrollRedirect } from '@/components/mixins/vertical-scroll-redirect';
import { useStore } from '@/store';
import {
	type ComponentOptionsMixin,
	type ComponentPublicInstance,
	computed,
	onMounted,
	type Ref,
	watch,
} from 'vue';

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
			// stupid issue with vue mixins
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(this as any).updateVertical();
		},
	},
};

export function setupPanelMixin(
	root: Ref<HTMLElement | ComponentPublicInstance>
) {
	const store = useStore();
	const vertical = computed(() => store.state.ui.vertical);

	function getRoot(): HTMLElement {
		const rootV = root.value;
		if (rootV == null) return null!;
		if ((rootV as ComponentPublicInstance).$el) {
			return (rootV as ComponentPublicInstance).$el;
		}
		return rootV as HTMLElement;
	}

	function updateVertical() {
		if (root.value == null) return;
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

	return { vertical, getRoot };
}
