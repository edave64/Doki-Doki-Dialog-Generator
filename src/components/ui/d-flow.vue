<script lang="ts">
import { defineComponent, h, PropType, VNode } from 'vue';
import { VerticalScrollRedirect } from '../vertical-scroll-redirect';
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
		maxSize: {
			type: String,
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
			},
			this.$slots.default!()
		);
		if (this.maxSize) {
			return h(
				'div',
				{
					ref: 'scrollContainer',
					class: ['d-flow-scroll-container', this.finalDirection],
					style: {
						[this.finalDirection === 'horizontal'
							? 'maxWidth'
							: 'maxHeight']: this.maxSize,
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

<style lang="scss" scoped>
::v-slotted(.d-flow-scroll-container) {
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

::v-slotted(.d-flow) {
	display: flex;
	flex-wrap: wrap;

	&.no-wraping {
		flex-wrap: nowrap;
	}

	&.vertical {
		flex-direction: column;
		> * {
			flex-shrink: 0;
		}
		&.no-wraping {
			align-items: center;
			width: 100%;
			> * {
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
