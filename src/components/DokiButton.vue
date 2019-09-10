<template>
	<div class="btn" @click="$emit('click')">
		<slot />
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
	components: {},
})
export default class DokiButton extends Vue {}
</script>

<style lang="scss">
.btn {
	background-color: #ffe6f4;
	border: 3px solid #ffbde1;

	display: inline-block;
	padding: 4px 4px;
	text-align: center;

	cursor: pointer;
}

.btn:hover {
	background-color: #fff;
	border: 3px solid #ffbde1;
}
</style>
