<!--
	A link to another website. Supports special prefixes "wiki:" to reference the github wiki and "github:" to link the
	projects github page.
-->
<template>
	<a target="_blank" rel="noopener noreferrer" :href="href">
		<slot />
	</a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { VerticalScrollRedirect } from '../vertical-scroll-redirect';
/**
 * a-tag links by default kinda suck for web apps, since they leave the current
 * page and do funny stuff with shared javascript contexts.
 * This takes care of the boilerplate
 */
export default defineComponent({
	mixins: [VerticalScrollRedirect],
	props: {
		to: {
			type: String,
			required: true,
		},
	},
	computed: {
		href(): string {
			let to = this.to;
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
		},
	},
});
</script>
