<template>
	<div class="selector">
		<slot />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({});
</script>

<style scoped>
.selector {
	display: flex;
	flex-direction: row;
	flex-grow: 1;
	justify-content: stretch;
}
</style>
