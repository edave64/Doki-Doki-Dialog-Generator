<template>
	<fieldset>
		<legend>Position{{allowSize ? "/Size" : ""}}:</legend>
		<toggle v-if="allowStepMove" v-model="freeMove" label="Move freely?" />
		<div v-if="allowStepMove && !freeMove">
			<button @click="--pos" :disabled="isFirstPos">&lt;</button>
			<select id="current_talking" v-model.number="pos" @input="$emit('invalidate-render')">
				<option v-for="(val, key) of positionNames" :key="key" :value="key">{{val}}</option>
			</select>
			<button @click="++pos" :disabled="isLastPos">&gt;</button>
		</div>
		<div v-else>
			<label for="sprite_x">X:</label>
			<input id="sprite_x" type="number" v-model.number="x" @keydown.stop />
			<br />
			<label for="sprite_y">Y:</label>
			<input id="sprite_y" type="number" v-model.number="y" @keydown.stop />
		</div>
		<div v-if="allowSize">
			<label for="sprite_w">Width:</label>
			<input id="sprite_w" type="number" v-model.number="width" @keydown.stop />
			<br />
			<label for="sprite_h">Height:</label>
			<input id="sprite_h" type="number" v-model.number="height" @keydown.stop />
			<toggle v-model="preserveRatio" label="Lock ratio?" />
		</div>
	</fieldset>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Toggle from '@/components/toggle.vue';
import { IRenderable } from '@/models/renderable';
import { positions, characterPositions } from '@/models/constants';
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
} from '@/store/objects';
import {
	ISprite,
	ISetSpriteHeightAction,
	ISetSpriteWidthAction,
	ISetSpriteRatioAction,
} from '@/store/objectTypes/sprite';
import { IHistorySupport } from '@/plugins/vuex-history';

@Component({
	components: {
		Toggle,
	},
})
export default class PositionAndSize extends Vue {
	@Prop({ required: true })
	private readonly obj!: IObject;

	private get history(): IHistorySupport {
		return this.$root as any;
	}

	private get allowSize() {
		return 'width' in this.obj;
	}

	private get allowStepMove() {
		return 'freeMove' in this.obj;
	}

	private get freeMove() {
		return (this.obj as ICharacter).freeMove;
	}

	private set freeMove(val: boolean) {
		this.history.transaction(() => {
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
		this.history.transaction(() => {
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
		this.history.transaction(() => {
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
		this.history.transaction(() => {
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
		this.history.transaction(() => {
			this.$store.dispatch('objects/setHeight', {
				id: this.obj.id,
				height: val,
			} as ISetSpriteHeightAction);
		});
	}

	private get width(): number {
		return (this.obj as ISprite).width;
	}

	private set width(val: number) {
		this.history.transaction(() => {
			this.$store.dispatch('objects/setWidth', {
				id: this.obj.id,
				width: val,
			} as ISetSpriteWidthAction);
		});
	}

	private get preserveRatio(): boolean {
		return (this.obj as ISprite).preserveRatio;
	}

	private set preserveRatio(val: boolean) {
		this.history.transaction(() => {
			this.$store.dispatch('objects/setPreserveRatio', {
				id: this.obj.id,
				preserveRatio: val,
			} as ISetSpriteRatioAction);
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
}

.vertical {
	fieldset {
		width: calc(100% - 4px);
		input {
			width: 60px;
		}
	}
}
</style>