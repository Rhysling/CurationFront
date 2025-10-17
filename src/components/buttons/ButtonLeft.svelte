<svelte:options runes={true} />

<script lang="ts">
	let { onclick }: { onclick: (e: Event | undefined) => void } = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<button title="Go Left" {onclick}>
	<svg
		fill="currentColor"
		viewBox="0 0 24 24"
		stroke="currentColor"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="m 14.824643,5.3408183 a 1,1 0 0 1 0.707,1.707 l -4.950001,4.9499997 4.950001,4.95 a 1,1 0 0 1 -1.414001,1.414 l -5.6569991,-5.657 a 1,1 0 0 1 0,-1.414 L 14.117642,5.6338183 a 1,1 0 0 1 0.707001,-0.293 z"
			transform-origin="center"
		/>
	</svg>
</button>

<style lang="scss">
	@use "../../styles/custom-variables" as c;

	button {
		padding: 0;
		margin: 1rem;
		width: 3rem;
		height: 3rem;
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
