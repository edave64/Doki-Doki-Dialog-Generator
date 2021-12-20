<template>
	<div class="fieldset_wrapper">
		<fieldset>
			<legend v-if="title > ''">{{ title }}</legend>
			<div class="fieldset_contents">
				<slot />
			</div>
		</fieldset>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	props: {
		title: {
			required: true,
			type: String,
		},
	},
});
</script>

<style lang="scss" scoped>
.fieldset_contents {
	margin-top: 0.5em;
	height: calc(100% - 0.5em);
}

legend {
	line-height: 0;
	user-select: none;
}

//noinspection CssOverwrittenProperties
fieldset {
	border: 3px solid $default-border;
	border: 3px solid var(--border);
	height: 100%;
}

.fieldset_wrapper {
	padding-top: 0.5em;
}
</style>
