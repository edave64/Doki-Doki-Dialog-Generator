<template>
	<d-fieldset :title="'Position' + (allowSize ? '/Size' : '')">
		<table>
			<tr>
				<td colspan="2">
					<toggle
						v-if="allowStepMove"
						v-model="freeMove"
						label="Move freely?"
					/>
				</td>
			</tr>
			<tr v-if="allowStepMove && !freeMove">
				<td colspan="2">
					<table>
						<tr>
							<td class="arrow-col">
								<button @click="--pos" :disabled="isFirstPos">&lt;</button>
							</td>
							<td>
								<select id="current_talking" v-model.number="pos">
									<option
										v-for="(val, key) of positionNames"
										:key="key"
										:value="key"
									>
										{{ val }}
									</option>
								</select>
							</td>
							<td class="arrow-col">
								<button @click="++pos" :disabled="isLastPos">&gt;</button>
							</td>
						</tr>
					</table>
				</td>
			</tr>
			<template v-else>
				<tr>
					<td>
						<label for="sprite_x">X:</label>
					</td>
					<td>
						<input
							id="sprite_x"
							type="number"
							v-model.number="x"
							@keydown.stop
						/>
					</td>
				</tr>
				<tr>
					<td>
						<label for="sprite_y">Y:</label>
					</td>
					<td>
						<input
							id="sprite_y"
							type="number"
							v-model.number="y"
							@keydown.stop
						/>
					</td>
				</tr>
			</template>
			<template v-if="allowSize">
				<tr>
					<td>
						<label for="sprite_w">Width:</label>
					</td>
					<td>
						<input
							id="sprite_w"
							min="0"
							type="number"
							v-model.number="width"
							@keydown.stop
						/>
					</td>
				</tr>
				<tr>
					<td>
						<label for="sprite_h">Height:</label>
					</td>
					<td>
						<input
							id="sprite_h"
							min="0"
							type="number"
							v-model.number="height"
							@keydown.stop
						/>
					</td>
				</tr>
				<tr>
					<td colspan="2">
						<toggle v-model="preserveRatio" label="Lock ratio?" />
					</td>
				</tr>
			</template>
		</table>
	</d-fieldset>
</template>

<script lang="ts">
import Toggle from '@/components/toggle.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import {
	closestCharacterSlot,
	ISetFreeMoveMutation,
	ICharacter,
} from '@/store/objectTypes/characters';
import {
	ISetPositionAction,
	ISetObjectPositionMutation,
	IObject,
	ISetHeightAction,
	ISetWidthAction,
	ISetRatioAction,
} from '@/store/objects';
import { ITextBox } from '@/store/objectTypes/textbox';
import { defineComponent, Prop } from 'vue';
import getConstants from '@/constants';
import { rendererLookup } from '@/renderables/textbox';

export default defineComponent({
	components: { Toggle, DFieldset },
	props: {
		obj: {
			required: true,
		} as Prop<IObject>,
	},
	computed: {
		freeMove: {
			get(): boolean {
				return (this.obj! as ICharacter).freeMove;
			},
			set(freeMove: boolean) {
				this.vuexHistory.transaction(() => {
					this.$store.commit('panels/setFreeMove', {
						id: this.obj!.id,
						panelId: this.obj!.panelId,
						freeMove,
					} as ISetFreeMoveMutation);
				});
			},
		},
		preserveRatio: {
			get(): boolean {
				return (this.obj! as ICharacter).preserveRatio;
			},
			set(preserveRatio: boolean) {
				this.vuexHistory.transaction(() => {
					this.$store.dispatch('panels/setPreserveRatio', {
						id: this.obj!.id,
						panelId: this.obj!.panelId,
						preserveRatio,
					} as ISetRatioAction);
				});
			},
		},
		pos: {
			get(): number {
				return closestCharacterSlot(this.obj!.x);
			},
			set(value: number) {
				this.vuexHistory.transaction(() => {
					this.$store.dispatch('panels/setPosition', {
						id: this.obj!.id,
						panelId: this.obj!.panelId,
						x: getConstants().Base.characterPositions[value],
						y: this.obj!.y,
					} as ISetPositionAction);
				});
			},
		},
		x: {
			get(): number {
				return this.obj!.x;
			},
			set(x: number) {
				this.vuexHistory.transaction(() => {
					this.$store.commit('panels/setPosition', {
						id: this.obj!.id,
						panelId: this.obj!.panelId,
						x,
						y: this.y,
					} as ISetObjectPositionMutation);
				});
			},
		},
		y: {
			get(): number {
				return this.obj!.y;
			},
			set(y: number) {
				this.vuexHistory.transaction(() => {
					this.$store.commit('panels/setPosition', {
						id: this.obj!.id,
						panelId: this.obj!.panelId,
						x: this.x,
						y,
					} as ISetObjectPositionMutation);
				});
			},
		},
		height: {
			get(): number {
				return this.obj!.height;
			},
			set(height: number) {
				this.vuexHistory.transaction(() => {
					this.$store.dispatch('panels/setHeight', {
						id: this.obj!.id,
						panelId: this.obj!.panelId,
						height,
					} as ISetHeightAction);
				});
			},
		},
		width: {
			get(): number {
				return this.obj!.width;
			},
			set(width: number) {
				this.vuexHistory.transaction(() => {
					this.$store.dispatch('panels/setWidth', {
						id: this.obj!.id,
						panelId: this.obj!.panelId,
						width,
					} as ISetWidthAction);
				});
			},
		},
		allowSize(): boolean {
			const obj = this.obj!;
			if (obj.type === 'textBox') {
				const renderer = rendererLookup[(obj as ITextBox).style];
				return renderer.resizable;
			}
			if (obj.type === 'character' && !(obj as ICharacter).freeMove) {
				return false;
			}
			return true;
		},
		allowStepMove(): boolean {
			return 'freeMove' in this.obj!;
		},
		positionNames(): string[] {
			return getConstants().Base.positions;
		},

		isFirstPos(): boolean {
			return this.pos === 0;
		},

		isLastPos(): boolean {
			return this.pos === getConstants().Base.positions.length - 1;
		},
	},
});
</script>

<style lang="scss" scoped>
fieldset {
	> table {
		width: 100%;

		> tr > td:nth-child(2) {
			width: 64px;
		}

		table {
			width: 100%;
			select {
				width: 100%;
			}
		}
	}
}

.vertical {
	fieldset {
		input {
			width: 64px;
		}
	}
}

input {
	width: 80px;
}

.arrow-col {
	width: 24px;

	button {
		width: 24px;
	}
}
</style>
