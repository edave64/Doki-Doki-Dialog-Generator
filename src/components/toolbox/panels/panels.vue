<template>
	<div class="panel">
		<h1>Panels</h1>
		<fieldset>
			<legend>Existing Panels</legend>
			<div class="existing_panels">
				<div
					v-for="(panel, idx) of panelButtons"
					:key="panel.id"
					:class="{ panel_button: true, active: panel.id === currentPanel }"
					:style="`background-image: url('${panel.image}')`"
					@click="updateCurrentPanel(panel.id)"
				>
					<div class="panel_text">
						<p>{{ panel.text }}</p>
					</div>
					<div class="panel_nr">{{ idx + 1 }}</div>
				</div>
			</div>
		</fieldset>
		<button @click="addNewPanel">Add new</button>
		<button @click="deletePanel">Delete panel</button>
	</div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { PanelMixin } from './panelMixin';
import {
	IPanel,
	IDuplicatePanelAction,
	ISetCurrentPanelMutation,
	IDeletePanelAction,
	ISetPanelPreviewMutation,
} from '@/store/panels';
import { State } from 'vuex-class-decorator';
import { getAAsset, isWebPSupported } from '../../../asset-manager';
import { ITextBox } from '../../../store/objectTypes/textbox';
import { IHistorySupport } from '../../../plugins/vuex-history';
import { SceneRenderer } from '../../../models/scene-renderer';
import { DeepReadonly } from '../../../util/readonly';

interface IPanelButton {
	id: string;
	image: string;
	text: string;
}

@Component({})
export default class PanelsPanel extends Mixins(PanelMixin) {
	public $store!: Store<DeepReadonly<IRootState>>;
	private vuexHistory!: IHistorySupport;

	@State('currentPanel', { namespace: 'panels' })
	private currentPanel!: string;

	async mounted() {
		this.moveFocusToActivePanel();

		const sceneRenderer = new SceneRenderer(
			this.$store,
			this.currentPanel,
			1280,
			720
		);

		await sceneRenderer.render(false);

		const targetCanvas = document.createElement('canvas');
		targetCanvas.width = 1280 / 4;
		targetCanvas.height = 720 / 4;

		sceneRenderer.paintOnto(
			targetCanvas.getContext('2d')!,
			0,
			0,
			targetCanvas.width,
			targetCanvas.height
		);
		targetCanvas.toBlob(
			blob => {
				if (!blob) return;
				const url = URL.createObjectURL(blob);
				this.vuexHistory.transaction(() => {
					this.$store.commit('panels/setPanelPreview', {
						panelId: this.$store.state.panels.currentPanel,
						url,
					} as ISetPanelPreviewMutation);
				});
			},
			(await isWebPSupported()) ? 'image/webp' : 'image/png',
			0.5
		);
	}

	private moveFocusToActivePanel() {
		const active = this.$el.querySelector('.panel_button.active');
		if (active) {
			active.scrollIntoView();
		}
	}

	private get panelButtons(): IPanelButton[] {
		const panelButtons: IPanelButton[] = [];
		const panelOrder = this.$store.state.panels.panelOrder;
		return panelOrder.map(id => {
			const panel = this.$store.state.panels.panels[id];
			const objectOrders = this.$store.state.objects.panels[id];
			const txtBox = ([] as string[])
				.concat(objectOrders.order, objectOrders.onTopOrder)
				.map(objId => this.$store.state.objects.objects[objId])
				.find(obj => obj.type === 'textBox') as ITextBox | undefined;
			return {
				id,
				image: panel.lastRender,
				text: txtBox ? txtBox.text : '',
			} as IPanelButton;
		});
	}

	private async addNewPanel() {
		await this.vuexHistory.transaction(async () => {
			this.$store.dispatch('panels/duplicatePanel', {
				panelId: this.$store.state.panels.currentPanel,
			} as IDuplicatePanelAction);
		});
		this.$nextTick(() => {
			this.moveFocusToActivePanel();
		});
	}

	private updateCurrentPanel(panelId: string) {
		this.vuexHistory.transaction(async () => {
			this.$store.commit('panels/setCurrentPanel', {
				panelId,
			} as ISetCurrentPanelMutation);
		});
		this.$nextTick(() => {
			this.moveFocusToActivePanel();
		});
	}

	private deletePanel() {
		this.vuexHistory.transaction(async () => {
			this.$store.dispatch('panels/delete', {
				panelId: this.$store.state.panels.currentPanel,
			} as IDeletePanelAction);
		});
		this.$nextTick(() => {
			this.moveFocusToActivePanel();
		});
	}
}
</script>

<style lang="scss" scoped>
fieldset {
	.existing_panels {
		display: flex;
		background: #aaaaaa;
		overflow: auto;
	}

	.panel_button {
		height: 150px;
		width: 150px;
		flex-shrink: 0;
		padding: 4px;
		background-size: contain;
		background-position: center center;
		background-repeat: no-repeat;
		background-color: #ffffff;
		border: #ffbde1 2px solid;
		display: flex;
		flex-direction: column;
		color: #ffffff;

		text-shadow: 0 0 4px #000, -1px -1px 0 #000, 1px -1px 0 #000,
			-1px 1px 0 #000, 1px 1px 0 #000;
	}

	.panel_button.active {
		background-color: #ffbde1;
	}

	.panel_text {
		flex-grow: 1;

		p {
			height: 60px;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}

	.panel_nr {
		text-align: right;
	}
}

.panel {
	&.vertical {
		fieldset {
			width: 100%;
			.existing_panels {
				max-height: 350px;
				width: 100%;
				flex-direction: column;

				.panel_button {
					width: 100%;
					height: 150px;
				}
			}
		}
	}
	&:not(.vertical) {
		fieldset {
			.existing_panels {
				max-width: 350px;
				height: 153px;
				flex-direction: row;

				.panel_button {
					height: 100%;
					width: 150px;
				}
			}
		}
	}
}
</style>
