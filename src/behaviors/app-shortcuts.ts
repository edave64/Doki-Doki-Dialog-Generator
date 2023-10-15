import { defineComponent } from 'vue';

/**
 * Used in app.vue, this manages the behavior of the little shortcut popups in the application.
 *
 * If the ctrl key is held for a specified time, little boxes will pop up on objects telling you what shortcut you can
 * use to reach them. This way, the UI can teach the users the shortcuts without being otrusive.
 */
export default defineComponent({
	data: () => ({
		ctrlTimeout: null as number | null,
		ctrlShown: false,
	}),
	mounted() {
		for (const eventType of ['keydown', 'keyup', 'mousemove'] as const) {
			window.addEventListener(eventType, this.testShortcutKey, true);
		}
	},
	methods: {
		onShortcutKeydown: function () {},
		testShortcutKey: function (e: MouseEvent | KeyboardEvent) {
			if (e.ctrlKey) {
				if (!this.ctrlShown && this.ctrlTimeout === null) {
					this.ctrlTimeout = setTimeout(this.showCtrlLabels);
				}
			} else {
				this.removeCtrlLables();
			}
		},
		showCtrlLabels: function () {
			document.body.classList.add('ctrl-key');
			this.ctrlShown = true;
		},
		removeCtrlLables: function () {
			if (this.ctrlTimeout !== null) {
				clearTimeout(this.ctrlTimeout);
				this.ctrlTimeout = null;
			}
			document.body.classList.remove('ctrl-key');
			this.ctrlShown = false;
		},
	},
});
