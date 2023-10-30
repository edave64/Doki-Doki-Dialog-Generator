<!--
	A wrapper that shows a border and headline around multiple controls.

	+- d-fieldset --+
	|               |
	| +-----------+ |
	| | component | |
	| +-----------+ |
	|               |
	| +-----------+ |
	| | component | |
	| +-----------+ |
	+---------------+
-->
<template>
	<div class="fieldset_wrapper">
		<fieldset>
			<legend v-if="title > ''">{{ props.title }}</legend>
			<div class="fieldset_contents">
				<slot />
			</div>
		</fieldset>
	</div>
</template>

<script lang="ts" setup>
const props = defineProps({
	title: {
		required: true,
		type: String,
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
	border: 3px solid $default-border-fieldset;
	border: 3px solid var(--border-fieldset);
	height: 100%;
}

.fieldset_wrapper {
	padding-top: 0.5em;
}
</style>
