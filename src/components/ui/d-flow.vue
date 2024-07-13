<!--
	A layout wrapper component that orients it's child components either vertically or diagonally (see direction
	property). It allows them to overflow in the other direction if it gets too large.
-->
<script lang="ts">
import { VerticalScrollRedirect } from '@/components/mixins/vertical-scroll-redirect';
import { defineComponent, h, type Prop, type PropType, type VNode } from 'vue';

// This function still uses the old syntax because I don't know how to use a render function in the new syntax.
export default defineComponent({
	mixins: [VerticalScrollRedirect],
	props: {
		/**
		 * Indicates whether or not line-breaks are allowed. Otherwise all elements automatically get the maximum
		 * width/hight (depending on direction)
		 */
		noWraping: {
			type: Boolean,
			default: false,
		},
		direction: {
			type: String as PropType<
				'global' | 'inverted' | 'horizontal' | 'vertical'
			>,
			default: 'global',
		},
		maxSize: {} as Prop<string | [string, string]>,
		gap: {
			type: String,
			default: '0px',
		},
	},
	computed: {
		finalDirection(): 'horizontal' | 'vertical' {
			if (this.direction === 'global') {
				return this.$store.state.ui.vertical ? 'vertical' : 'horizontal';
			}
			if (this.direction === 'inverted') {
				return this.$store.state.ui.vertical ? 'horizontal' : 'vertical';
			}
			return this.direction;
		},
	},
	render(): VNode {
		const wrapingClass = this.noWraping ? 'no-wraping' : 'wraping';
		const attrs: { [s: string]: any } = {};
		const flowContainer = h(
			'div',
			{
				...attrs,
				class: ['d-flow', this.finalDirection, wrapingClass],
				style: {
					gap: this.gap,
				},
			},
			this.$slots.default!()
		);
		if (this.maxSize !== undefined) {
			const maxSize =
				this.maxSize instanceof Array
					? this.maxSize[this.finalDirection === 'horizontal' ? 0 : 1]
					: this.maxSize;
			return h(
				'div',
				{
					ref: 'scrollContainer',
					class: ['d-flow-scroll-container', this.finalDirection],
					style: {
						[this.finalDirection === 'horizontal' ? 'maxWidth' : 'maxHeight']:
							maxSize,
					},
				},
				[flowContainer]
			);
		}
		return flowContainer;
	},
	mounted() {
		if (this.$refs.scrollContainer) {
			(this.$refs.scrollContainer as HTMLDivElement).addEventListener(
				'wheel',
				(this as any).verticalScrollRedirect
			);
		}
	},
});
</script>

<!--suppress CssUnusedSymbol -->
<style lang="scss" scoped>
.d-flow-scroll-container {
	&.horizontal {
		height: 100%;
		overflow-x: auto;
		overflow-y: hidden;
	}

	&.vertical {
		width: 100%;
		overflow-x: hidden;
		overflow-y: auto;
	}
}

.d-flow {
	display: flex;
	flex-wrap: wrap;

	&.no-wraping {
		flex-wrap: nowrap;
	}

	&.vertical {
		flex-direction: column;

		> :deep(*) {
			flex-shrink: 0;
		}

		&.no-wraping {
			align-items: center;
			width: 100%;

			> :deep(*) {
				width: 100%;
			}
		}
	}

	&.horizontal {
		flex-direction: row;

		> * {
			flex-shrink: 0;
		}

		&.no-wraping {
			align-items: center;
			@include height-100();

			> * {
				@include height-100();
			}
		}
	}
}
</style>
