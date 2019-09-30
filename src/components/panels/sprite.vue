<template>
	<div :class="{ panel: true }">
		<h1>Custom Sprite</h1>
		<fieldset>
			<legend>Position/Size:</legend>
			<label for="sprite_x">X:</label>
			<input ref="sprite_x" type="number" :value="sprite.x" @input="move" @keydown.stop />
			<br />
			<label for="sprite_y">Y:</label>
			<input ref="sprite_y" type="number" :value="sprite.y" @input="move" @keydown.stop />
			<br />
			<label for="sprite_w">Width:</label>
			<input id="sprite_w" type="number" :value="sprite.width" @input="setWidth" @keydown.stop />
			<br />
			<label for="sprite_h">Height:</label>
			<input id="sprite_h" type="number" :value="sprite.height" @input="setHeight" @keydown.stop />
			<toggle :value="sprite.preserveRatio" @input="setRatioLock" label="Lock ratio?" />
		</fieldset>
		<fieldset id="layerfs">
			<legend>Layer:</legend>
			<button @click="shiftLayer(-Infinity)" title="Move to back">&#10515;</button>
			<button @click="shiftLayer(-1)" title="Move backwards">&#8595;</button>
			<button @click="shiftLayer(1)" title="Move forwards">&#8593;</button>
			<button @click="shiftLayer(Infinity)" title="Move to front">&#10514;</button>
			<toggle @input="setInFront" :value="sprite.onTop" label="In front of textbox?" />
		</fieldset>
		<div>
			<label for="characterOpacity">Opacity:</label>
			<input
				type="number"
				max="100"
				min="0"
				id="characterOpacity"
				:value="sprite.opacity"
				@input="setOpacity"
				@keydown.stop
			/>
		</div>
		<toggle :value="sprite.flip" @input="setFlip" label="Flip?" />

		<button @click="$emit('shiftLayer', {object: sprite, move: 'Delete'});$emit('close')">Delete</button>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { isWebPSupported } from '../../asset-manager';
import { Character } from '../../models/character';
import Toggle from '../Toggle.vue';
import { IRenderable } from '../../models/renderable';
import { Sprite } from '../../models/sprite';
import {
	ISprite,
	createRatioLockCommand,
	createSetWidthCommand,
	createSetHeightCommand,
} from '../../store/objectTypes/sprite';
import { ICommand } from '../../eventbus/command';
import eventBus from '../../eventbus/event-bus';
import {
	createMoveLayerCommand,
	createSetOnTopCommand,
	createMoveCommand,
	createFlipCommand,
	setOpacityCommand,
	IObjectShiftLayerAction,
} from '../../store/objectTypes/general';
import { IHistorySupport } from '../../plugins/vuex-history';

@Component({
	components: {
		Toggle,
	},
})
export default class SpritePanel extends Vue {
	@Prop({ required: true }) private sprite!: ISprite;

	private get history(): IHistorySupport {
		return this.$root as any;
	}

	private shiftLayer(delta: number) {
		this.history.transaction(() => {
			this.$store.dispatch('objects/shiftLayer', {
				type: 'shiftLayer',
				id: this.sprite.id,
				delta,
			} as IObjectShiftLayerAction);
		});
	}

	private setInFront(newValue: boolean) {
		this.fire(
			createSetOnTopCommand(this.$store, this.sprite.id, newValue, true, true)
		);
	}

	private move() {
		const xInput = this.$refs.sprite_x as HTMLInputElement;
		const yInput = this.$refs.sprite_y as HTMLInputElement;

		this.fire(
			createMoveCommand(
				this.$store,
				this.sprite.id,
				parseFloat(xInput.value),
				parseFloat(yInput.value)
			)
		);
	}

	private setFlip(newValue: boolean) {
		this.fire(createFlipCommand(this.$store, this.sprite.id));
	}

	private setOpacity(event: Event) {
		const opacity = Number((event.target! as HTMLInputElement).value);
		this.fire(setOpacityCommand(this.$store, this.sprite.id, opacity));
	}

	private setHeight(event: Event): void {
		const height = Number((event.target! as HTMLInputElement).value);
		this.fire(createSetHeightCommand(this.$store, this.sprite.id, height));
	}

	private setWidth(event: Event): void {
		const width = Number((event.target! as HTMLInputElement).value);
		this.fire(createSetWidthCommand(this.$store, this.sprite.id, width));
	}

	private setRatioLock(lock: boolean) {
		this.fire(createRatioLockCommand(this.$store, this.sprite.id, lock));
	}
}
</script>

<style lang="scss" scoped>
fieldset {
	border: 3px solid #ffbde1;
}
</style>