<template>
	<fieldset>
		<legend>Position{{ allowSize ? '/Size' : '' }}:</legend>
		<table>
			<tr>
				<td colspan="2">
					<toggle v-if="allowStepMove" v-model="freeMove" label="Move freely?" />
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
									<option v-for="(val, key) of positionNames" :key="key" :value="key">{{ val }}</option>
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
						<input id="sprite_x" type="number" v-model.number="x" @keydown.stop />
					</td>
				</tr>
				<tr>
					<td>
						<label for="sprite_y">Y:</label>
					</td>
					<td>
						<input id="sprite_y" type="number" v-model.number="y" @keydown.stop />
					</td>
				</tr>
			</template>
			<template v-if="allowSize">
				<tr>
					<td>
						<label for="sprite_w">Width:</label>
					</td>
					<td>
						<input id="sprite_w" min="0" type="number" v-model.number="width" @keydown.stop />
					</td>
				</tr>
				<tr>
					<td>
						<label for="sprite_h">Height:</label>
					</td>
					<td>
						<input id="sprite_h" min="0" type="number" v-model.number="height" @keydown.stop />
					</td>
				</tr>
				<tr>
					<td colspan="2">
						<toggle v-model="preserveRatio" label="Lock ratio?" />
					</td>
				</tr>
			</template>
		</table>
	</fieldset>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Toggle from '@/components/toggle.vue';
import { IRenderable } from '@/renderables/renderable';
import { positions, characterPositions } from '@/constants/base';
import {
	closestCharacterSlot,
	ISetFreeMoveMutation,
	ICharacter,
} from '@/store/objectTypes/characters';
import { State } from 'vuex-class-decorator';
import {
	ISetPositionAction,
	ISetObjectPositionMutation,
	IObject,
	ISetHeightAction,
	ISetWidthAction,
	ISetRatioAction,
} from '@/store/objects';
import { ISprite } from '@/store/objectTypes/sprite';
import { IHistorySupport } from '@/plugins/vuex-history';
import { ITextBox } from '@/store/objectTypes/textbox';

@Component({
	components: {
		Toggle,
	},
})
export default class PositionAndSize extends Vue {
	@Prop({ required: true })
	private readonly obj!: IObject;

	private vuexHistory!: IHistorySupport;

	private get allowSize() {
		const obj = this.obj;
		if (
			this.obj.type === 'textBox' &&
			(this.obj as ITextBox).style !== 'custom'
		) {
			return false;
		}
		if (this.obj.type === 'character' && !(this.obj as ICharacter).freeMove) {
			return false;
		}
		return true;
	}

	private get allowStepMove() {
		return 'freeMove' in this.obj;
	}

	private get freeMove() {
		return (this.obj as ICharacter).freeMove;
	}

	private set freeMove(val: boolean) {
		this.vuexHistory.transaction(() => {
			this.$store.commit('objects/setFreeMove', {
				id: this.obj.id,
				freeMove: val,
			} as ISetFreeMoveMutation);
		});
	}

	private get positionNames(): string[] {
		return positions;
	}

	private get pos(): number {
		return closestCharacterSlot(this.obj.x);
	}

	private set pos(value: number) {
		this.vuexHistory.transaction(() => {
			this.$store.dispatch('objects/setPosition', {
				id: this.obj.id,
				x: characterPositions[value],
				y: this.obj.y,
			} as ISetPositionAction);
		});
	}

	private get isFirstPos(): boolean {
		return this.pos === 0;
	}

	private get isLastPos(): boolean {
		return this.pos === positions.length - 1;
	}

	private get x(): number {
		return this.obj.x;
	}

	private set x(val: number) {
		this.vuexHistory.transaction(() => {
			this.$store.dispatch('objects/setPosition', {
				id: this.obj.id,
				x: val,
				y: this.y,
			} as ISetObjectPositionMutation);
		});
	}

	private get y(): number {
		return this.obj.y;
	}

	private set y(val: number) {
		this.vuexHistory.transaction(() => {
			this.$store.dispatch('objects/setPosition', {
				id: this.obj.id,
				x: this.x,
				y: val,
			} as ISetObjectPositionMutation);
		});
	}

	private get height(): number {
		return (this.obj as ISprite).height;
	}

	private set height(val: number) {
		this.vuexHistory.transaction(() => {
			this.$store.dispatch('objects/setHeight', {
				id: this.obj.id,
				height: val,
			} as ISetHeightAction);
		});
	}

	private get width(): number {
		return (this.obj as ISprite).width;
	}

	private set width(val: number) {
		this.vuexHistory.transaction(() => {
			this.$store.dispatch('objects/setWidth', {
				id: this.obj.id,
				width: val,
			} as ISetWidthAction);
		});
	}

	private get preserveRatio(): boolean {
		return (this.obj as ISprite).preserveRatio;
	}

	private set preserveRatio(val: boolean) {
		this.vuexHistory.transaction(() => {
			this.$store.dispatch('objects/setPreserveRatio', {
				id: this.obj.id,
				preserveRatio: val,
			} as ISetRatioAction);
		});
	}
}

export interface MoveObject {
	object: IRenderable;
	move: 'Forward' | 'Backward' | 'Back' | 'Front' | 'Delete';
}
</script>

<style lang="scss" scoped>
fieldset {
	border: 3px solid #ffbde1;

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
		width: calc(100% - 4px);
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
