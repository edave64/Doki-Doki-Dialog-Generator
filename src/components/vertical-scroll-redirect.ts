import { ComponentOptionsMixin } from 'vue';

const firefoxDeltaFactor = 25;

export const VerticalScrollRedirect: ComponentOptionsMixin = {
	methods: {
		verticalScrollRedirect(e: WheelEvent) {
			if (e.type !== 'wheel') return;
			if (!e.currentTarget) return;
			const currentTarget = e.currentTarget as HTMLElement;
			const target = getComputedStyle(currentTarget);

			const ev = e as WheelEvent;
			if (ev.deltaY === 0) {
				return;
			}
			if (target.overflowY === 'auto') {
				if (ev.deltaY > 0) {
					if (
						currentTarget.scrollHeight >
						currentTarget.scrollTop + currentTarget.clientHeight
					) {
						e.stopPropagation();
						return;
					}
				} else {
					if (currentTarget.scrollTop > 0) {
						e.stopPropagation();
						return;
					}
				}
			}
			const oldScrollLeft = currentTarget.scrollLeft;
			// noinspection JSSuspiciousNameCombination
			currentTarget.scrollLeft += ev.deltaY;
			if (currentTarget.scrollLeft !== oldScrollLeft) {
				e.stopPropagation();
			}
		},
	},
};
