<!--
	A tool that is shown when a character object is selected.
-->
<template>
	<object-tool :object="object" :title="label" :showAltPanel="!!panelForParts">
		<template v-slot:alt-panel>
			<parts
				v-if="panelForParts"
				:character="object"
				:part="panelForParts"
				@leave="panelForParts = null"
				@show-dialog="$emit('show-dialog', $event)"
				@show-expression-dialog="$emit('show-expression-dialog', $event)"
			/>
		</template>
		<template v-slot:default>
			<template v-if="missingHead">
				<p class="warning">
					MISSING Head sprite! Click below to re-upload
					<span style="word-wrap: break-word">"{{ missingHead }}"</span>.
				</p>
				<button @click="reuploadHead()">Re-Upload</button>
				<input
					type="file"
					ref="missingHeadUpload"
					@change="onMissingHeadFileUpload"
				/>
			</template>
			<d-fieldset
				v-if="hasMultiplePoses || parts.length > 0 || hasMultipleStyles"
				class="pose-list"
				title="Pose:"
			>
				<table>
					<tbody>
						<tr v-if="hasMultipleStyles">
							<td class="arrow-col">
								<button @click="seekStyle(-1)">&lt;</button>
							</td>
							<td>
								<button class="middle-button" @click="panelForParts = 'style'">
									Style
								</button>
							</td>
							<td class="arrow-col">
								<button @click="seekStyle(1)">&gt;</button>
							</td>
						</tr>
						<tr v-if="hasMultiplePoses">
							<td class="arrow-col">
								<button @click="seekPose(-1)">&lt;</button>
							</td>
							<td>
								<button class="middle-button" @click="panelForParts = 'pose'">
									Pose
								</button>
							</td>
							<td class="arrow-col">
								<button @click="seekPose(1)">&gt;</button>
							</td>
						</tr>
						<tr v-for="part of parts" :key="part">
							<td class="arrow-col">
								<button @click="seekPart(part, -1)">&lt;</button>
							</td>
							<td>
								<button class="middle-button" @click="panelForParts = part">
									{{ captialize(part) }}
								</button>
							</td>
							<td class="arrow-col">
								<button @click="seekPart(part, 1)">&gt;</button>
							</td>
						</tr>
					</tbody>
				</table>
			</d-fieldset>
		</template>
		<template v-slot:options>
			<toggle v-model="closeUp" label="Close up?" />
		</template>
	</object-tool>
</template>

<script lang="ts">
import { IObject } from '@/store/objects';
import {
	getData,
	getParts,
	ISeekPoseAction,
	ISeekPosePartAction,
	ICharacter,
	ISeekStyleAction,
	getHeads,
} from '@/store/objectTypes/characters';
import Toggle from '@/components/toggle.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import { IPanel } from '@/store/panels';
import Parts from './character/parts.vue';
import { Character } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAssetSwitch } from '@/store/content';
import { PanelMixin } from './panelMixin';
import { DeepReadonly } from 'ts-essentials';
import { defineComponent } from 'vue';
import { genericSetable } from '@/util/simpleSettable';
import ObjectTool from './object-tool.vue';
import { getAAssetUrl } from '@/asset-manager';

const setable = genericSetable<ICharacter>();

export default defineComponent({
	mixins: [PanelMixin],
	components: {
		Toggle,
		Parts,
		DFieldset,
		ObjectTool,
	},
	data: () => ({
		panelForParts: null as string | null,
	}),
	computed: {
		flip: setable('flip', 'panels/setFlip'),
		closeUp: setable('close', 'panels/setClose'),
		missingHead(): string | null {
			const charData = this.charData;
			const obj = this.object;

			const heads = getHeads(charData, obj);
			if (!heads) return null;
			for (const asset of heads.variants) {
				const url = getAAssetUrl(asset[0], false);
				console.log(url);
				if (url.startsWith('uploads:')) return url.substring(8);
			}
			return null;
		},
		selection(): IObject['id'] {
			return this.$store.state.ui.selection!;
		},
		currentPanel(): DeepReadonly<IPanel> {
			return this.$store.state.panels.panels[
				this.$store.state.panels.currentPanel
			];
		},
		object(): DeepReadonly<ICharacter> {
			const obj = this.currentPanel.objects[this.selection];
			if (obj.type !== 'character') return undefined!;
			return obj as ICharacter;
		},
		charData(): DeepReadonly<Character<IAssetSwitch>> {
			return getData(this.$store, this.object);
		},
		label(): string {
			return this.charData.label ?? '';
		},
		parts(): DeepReadonly<string[]> {
			return getParts(this.charData, this.object);
		},
		hasMultipleStyles(): boolean {
			return (
				this.charData.styleGroups[this.object.styleGroupId].styles.length > 1 ||
				this.charData.styleGroups.length > 1
			);
		},
		hasMultiplePoses(): boolean {
			const styleGroup = this.charData.styleGroups[this.object.styleGroupId];
			const style = styleGroup.styles[this.object.styleId];
			return style.poses.length > 1;
		},
	},
	methods: {
		reuploadHead() {
			const missingHeadUpload = this.$refs
				.missingHeadUpload as HTMLInputElement;
			missingHeadUpload.click();
		},
		async onMissingHeadFileUpload(e: Event) {
			const uploadInput = this.$refs.missingHeadUpload as HTMLInputElement;
			if (!uploadInput.files) return;
			if (uploadInput.files.length !== 1) {
				console.error('More than one file uploaded!');
				return;
			}

			const file = uploadInput.files[0];
			await this.vuexHistory.transaction(async () => {
				const url = URL.createObjectURL(file);
				await this.$store.dispatch('uploadUrls/add', {
					name: this.missingHead,
					url,
				});
			});
		},
		seekPose(delta: number): void {
			this.vuexHistory.transaction(() => {
				this.$store.dispatch('panels/seekPose', {
					id: this.object.id,
					panelId: this.object.panelId,
					delta,
				} as ISeekPoseAction);
			});
		},
		seekStyle(delta: number): void {
			this.vuexHistory.transaction(() => {
				this.$store.dispatch('panels/seekStyle', {
					id: this.object.id,
					panelId: this.object.panelId,
					delta,
				} as ISeekStyleAction);
			});
		},
		seekPart(part: string, delta: number): void {
			this.vuexHistory.transaction(() => {
				this.$store.dispatch('panels/seekPart', {
					id: this.object.id,
					panelId: this.object.panelId,
					delta,
					part,
				} as ISeekPosePartAction);
			});
		},
		captialize(str: string) {
			return str.charAt(0).toUpperCase() + str.substring(1);
		},
	},
	watch: {
		selection() {
			this.panelForParts = null;
		},
	},
});
</script>

<style lang="scss" scoped>
fieldset {
	table {
		width: 100%;
	}
}

.panel:not(.vertical) {
	.pose-list {
		height: 100%;
	}
	:deep(fieldset) {
		max-height: 100%;
		height: 100%;
		overflow: auto;
	}
}

.panel.vertical {
	fieldset {
		input {
			width: 60px;
		}
	}
}

.middle-button {
	width: 100%;
}

.arrow-col {
	width: 24px;

	button {
		width: 24px;
	}
}
input[type='file'] {
	display: none;
}
</style>
