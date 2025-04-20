<!--
	A link to another website. Supports special prefixes "wiki:" to reference the github wiki and "github:" to link the
	projects github page.
    a-tag links by default kinda suck for web apps, since they leave the current
    page and do funny stuff with shared javascript contexts.
    This takes care of the boilerplate
-->
<template>
	<a target="_blank" rel="noopener noreferrer" ref="root" :href="href">
		<slot />
	</a>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';

const props = defineProps<{
	to: string;
}>();

const root = ref(null! as HTMLElement);
const href = computed((): string => {
	let to = props.to;
	to = to.replace(
		/^github:\/\//,
		'https://github.com/edave64/Doki-Doki-Dialog-Generator/'
	);
	to = to.replace(/^wiki:\/\/(.*)/, (_, page) => {
		return (
			'https://github.com/edave64/Doki-Doki-Dialog-Generator/wiki/Version-2:-' +
			page.replaceAll(' ', '-')
		);
	});
	return to;
});
</script>
