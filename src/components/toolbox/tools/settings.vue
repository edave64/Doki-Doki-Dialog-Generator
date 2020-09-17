<template>
	<div class="panel">
		<h1>Settings</h1>
		<toggle
			v-if="lqAllowed"
			label="Low quality preview?"
			title="Reduces the quality of the preview images to speed up the user experience and consume less data. Does not effect final render."
			v-model="lqRendering"
		/>
		<toggle label="NSFW Mode?" v-model="nsfw" />
	</div>
</template>

<script lang="ts">
import Toggle from '@/components/toggle.vue';
import { PanelMixin } from './panelMixin';
import { IRemovePacksAction } from '@/store';
import environment from '@/environments/environment';
import { defineComponent } from 'vue';

const nsfwPacks = {
	'dddg.buildin.backgrounds.nsfw': `${process.env.BASE_URL}packs/buildin.base.backgrounds.nsfw.json`,
	'dddg.buildin.sayori.nsfw': `${process.env.BASE_URL}packs/buildin.base.sayori.nsfw.json`,
	'dddg.buildin.base.natsuki.nsfw': `${process.env.BASE_URL}packs/buildin.base.natsuki.nsfw.json`,
	'dddg.buildin.yuri.nsfw': `${process.env.BASE_URL}packs/buildin.base.yuri.nsfw.json`,
};

const names = new Set(Object.keys(nsfwPacks));
const paths = Object.values(nsfwPacks);

export default defineComponent({
	mixins: [PanelMixin],
	components: { Toggle },
	computed: {
		lqAllowed(): boolean {
			return environment.allowLQ;
		},
		lqRendering: {
			get(): boolean {
				return this.$store.state.ui.lqRendering;
			},
			set(lqRendering: boolean) {
				this.vuexHistory.transaction(async () => {
					await this.$store.commit('ui/setLqRendering', lqRendering);
				});
			},
		},
		nsfw: {
			get(): boolean {
				return !!this.$store.state.content.contentPacks
					.map(pack => pack.packId)
					.filter(packId => !!packId)
					.find(packId => names.has(packId!));
			},
			set(value: boolean) {
				this.vuexHistory.transaction(async () => {
					if (value) {
						await this.$store.dispatch('content/loadContentPacks', paths);
					} else {
						await this.$store.dispatch('removePacks', {
							packs: names,
						} as IRemovePacksAction);
					}
				});
			},
		},
	},
});
</script>

<style lang="scss" scoped>
.panel {
	&.vertical {
		#dialog_text_wrapper {
			width: 173px;

			textarea {
				width: 100%;
			}
		}
	}

	&:not(.vertical) {
		#dialog_text_wrapper {
			height: 181px;
			display: table;

			* {
				display: table-row;
			}
		}
	}
}

textarea {
	min-height: 148px;
}

.btn_link {
	appearance: button;
	text-align: center;
}
</style>
