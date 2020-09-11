<template>
	<div class="dialog-wrapper" @click="$emit('leave')">
		<dialog open @click.stop>
			<slot />
		</dialog>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.dialog-wrapper {
	position: absolute;
	top: 0;
	bottom: 0;
	right: 0;
	left: 0;
	background: rgba($color: #000000, $alpha: 0.5);
	display: flex;
	transition: all 0.15s;
}

dialog {
	width: 860px;
	height: 860px;
	max-width: 90vw;
	max-height: 90vh;
	background-attachment: scroll;
	background-color: #ffffff;
	background-position: right center;
	background-repeat: no-repeat;
	background-size: contain;
	display: flex;
	flex-direction: column;
	align-self: center;
	overflow: hidden;
	padding: 0;
	border: 4px solid #ffbde1;
	overflow: hidden;
	align-self: center;
	justify-self: center;
	margin: auto;
}
</style>
