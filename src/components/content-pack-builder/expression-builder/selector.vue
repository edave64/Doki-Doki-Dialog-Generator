<template>
	<div class="selector">
		<slot />
	</div>
</template>

<script lang="ts" setup></script>

<style scoped>
.selector {
	display: flex;
	flex-direction: row;
	flex-grow: 1;
	justify-content: stretch;
}
</style>
