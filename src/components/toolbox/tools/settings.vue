<template>
	<div class="panel">
		<h1>Settings</h1>
		<Portal target="#modal-messages">
			<modal-dialog :options="['Apply', 'Cancle']">
				<div class="modal-scroll-area">
					<p>
						Do you want to allow DDDG to save data on your device?
					</p>
					<p>
						By choosing to enable saving data, DDDG can save data to your
						device, and nowhere else. However, your browser and any installed
						browserextensions might possibly read and send this data to other
						servers, e.g. to sync between devices. This is outside of our
						control. But in general, we recommend only using browsers and
						browserextensions that you trust with your personal data.
					</p>
					<p>
						No data is ever send by us to external servers. The only things that
						leave this device are:
					</p>
					<ul>
						<li>
							Your IP address. This is send by any web requests of scripts and
							assets and is inevitiable, so that the responses can be send back
							to your device. We cannot directly access this data, but it is
							probably stored by Github Inc. (owned by Microsoft), who provide
							our servers.
						</li>
						<li>
							Access times. Since DDDG loads images on demand, it might be
							possible to reconstruct what characters and expressions have been
							used in a dialog from when these files where downloaded from the
							server by a specific IP. We have, however, no access to this data
							and don't want it. It is again likely stored by Github Inc. for
							some time to help diagnose server issues and possible legal
							requirements.
						</li>
					</ul>
				</div>
				<p>
					<input v-model="modalNameInput" />
				</p>
			</modal-dialog>
		</Portal>
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
