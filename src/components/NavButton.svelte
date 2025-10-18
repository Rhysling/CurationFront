<svelte:options runes={true} />

<script lang="ts">
	type NavButtonType = "first" | "prev" | "next" | "last";

	let {
		buttonType,
		onclick = () => {},
		margin = "0.5rem",
		width = "2rem",
		height = "2rem",
	}: {
		buttonType: NavButtonType;
		onclick?: (e: MouseEvent | undefined) => void;
		margin?: string;
		width?: string;
		height?: string;
	} = $props();

	const titles = {
		first: "First",
		prev: "Previous",
		next: "Next",
		last: "Last",
	};

	let title = $derived(titles[buttonType]);
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<button
	{title}
	{onclick}
	style="margin:{margin};height:{height};width:{width};"
>
	{#if buttonType === "first"}
		<svg
			fill="currentColor"
			viewBox="0 0 24 24"
			stroke="currentColor"
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="m 9.4655179,5.3408093 a 1,1 0 0 1 0.7070011,1.707 l -4.9500021,4.9500007 4.9500021,4.95 a 1,1 0 0 1 -1.4140021,1.414 l -5.6569991,-5.657 a 1,1 0 0 1 0,-1.414 L 8.7585169,5.6338093 a 1,1 0 0 1 0.707001,-0.293 z"
				transform-origin="center"
			/>
			<path
				d="m 20.422304,5.3408187 a 1,1 0 0 1 0.707,1.707 l -4.950001,4.9499993 4.950001,4.95 a 1,1 0 0 1 -1.414001,1.414 l -5.656999,-5.657 a 1,1 0 0 1 0,-1.414 l 5.656999,-5.6569993 a 1,1 0 0 1 0.707001,-0.293 z"
				transform-origin="center"
			/>
		</svg>
	{:else if buttonType === "prev"}
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
	{:else if buttonType === "next"}
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
				transform="rotate(180)"
			/>
		</svg>
	{:else if buttonType === "last"}
		<svg
			fill="currentColor"
			viewBox="0 0 24 24"
			stroke="currentColor"
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="m 9.4655179,5.3408093 a 1,1 0 0 1 0.7070011,1.707 l -4.9500021,4.9500007 4.9500021,4.95 a 1,1 0 0 1 -1.4140021,1.414 l -5.6569991,-5.657 a 1,1 0 0 1 0,-1.414 L 8.7585169,5.6338093 a 1,1 0 0 1 0.707001,-0.293 z"
				transform-origin="center"
				transform="rotate(180)"
			/>
			<path
				d="m 20.422304,5.3408187 a 1,1 0 0 1 0.707,1.707 l -4.950001,4.9499993 4.950001,4.95 a 1,1 0 0 1 -1.414001,1.414 l -5.656999,-5.657 a 1,1 0 0 1 0,-1.414 l 5.656999,-5.6569993 a 1,1 0 0 1 0.707001,-0.293 z"
				transform-origin="center"
				transform="rotate(180)"
			/>
		</svg>
	{:else}
		[Button Type Not Found]
	{/if}
</button>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	button {
		padding: 0;
		// margin: 0.5rem;
		// width: 2rem;
		// height: 2rem;
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
