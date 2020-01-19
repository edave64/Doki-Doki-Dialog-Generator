<template>
	<div class="panel">
		<h1>General</h1>
		<a
			class="btn"
			target="_blank"
			rel="noopener noreferrer"
			href="https://github.com/edave64/Doki-Doki-Dialog-Generator/blob/v1/docs/index.md"
		>Help</a>
		<toggle
			label="Low quality preview?"
			title="Reduces the quality of the preview images to speed up the user experience and consume less data. Does not effect final render."
			v-model="lqRendering"
		/>
		<button :disabled="!hasPrevRender" @click="$emit('show-prev-render')">Compare to last download</button>
		<button @click="$emit('show-content-packs')">Content Packs</button>
		<toggle label="NSFW Mode?" v-model="nsfw" />
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from 'vue-property-decorator';
import { TextBox } from '@/models/textbox';
import Toggle from '@/components/toggle.vue';
import { State } from 'vuex-class-decorator';
import { PanelMixin } from './panelMixin';
import { IHistorySupport } from '../../../plugins/vuex-history';
import { IRemovePacksAction, IRootState } from '../../../store';
import { Store } from 'vuex';

const nsfwPacks = {
	'dddg.buildin.backgrounds.nsfw': `${process.env.BASE_URL}packs/buildin.base.backgrounds.nsfw.json`,
	'dddg.buildin.sayori.nsfw': `${process.env.BASE_URL}packs/buildin.base.sayori.nsfw.json`,
	'dddg.buildin.base.natsuki.nsfw': `${process.env.BASE_URL}packs/buildin.base.natsuki.nsfw.json`,
	'dddg.buildin.yuri.nsfw': `${process.env.BASE_URL}packs/buildin.base.yuri.nsfw.json`,
};

const names = new Set(Object.keys(nsfwPacks));
const paths = Object.values(nsfwPacks);

@Component({
	components: {
		Toggle,
	},
})
export default class GeneralPanel extends Mixins(PanelMixin) {
	public $store!: Store<IRootState>;

	private get lqRendering(): boolean {
		return this.$store.state.ui.lqRendering;
	}
	private set lqRendering(lqRendering: boolean) {
		this.history.transaction(async () => {
			await this.$store.commit('ui/setLqRendering', lqRendering);
		});
	}

	private get hasPrevRender(): boolean {
		return this.$store.state.ui.lastDownload !== null;
	}

	private get history(): IHistorySupport {
		return this.$root as any;
	}

	private get nsfw(): boolean {
		return !!this.$store.state.content.contentPacks
			.map(pack => pack.packId)
			.filter(packId => !!packId)
			.find(packId => names.has(packId!));
	}

	private set nsfw(value: boolean) {
		this.history.transaction(async () => {
			if (value) {
				await this.$store.dispatch('content/loadContentPacks', paths);
			} else {
				await this.$store.dispatch('removePacks', {
					packs: names,
				} as IRemovePacksAction);
			}
		});
	}
}
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
