<template>
	<div class="selector">
		<slot />
	</div>
</template>

<script lang="ts">
// App.vue has currently so many responsiblities that it's best to break it into chunks
import { Component, Vue } from 'vue-property-decorator';

@Component({
	components: {},
})
export default class Selector extends Vue {}
</script>

<style scoped>
.selector {
	display: flex;
	flex-direction: row;
	flex-grow: 1;
	justify-content: stretch;
}
</style>
