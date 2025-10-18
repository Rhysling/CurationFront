<svelte:options runes={true} />

<script lang="ts">
	//import { user } from "../stores/user-store.svelte";

	import NavButton from "./NavButton.svelte";

	let {
		gotoSlideIx,
		prev,
		next,
		slideCount,
		currentPic,
	}: {
		gotoSlideIx: (ix: number) => void;
		prev: () => void;
		next: () => void;
		slideCount: number;
		currentPic: PictureItem | null;
	} = $props();

	let currentSlug = $derived.by(() => {
		if (!currentPic || !currentPic.fileName) return "";
		let ix = currentPic.fileName.lastIndexOf(".");
		if (ix > 0) return currentPic.fileName.substring(0, ix);
		return "";
	});
</script>

<div class="c-menu">
	<NavButton buttonType="first" onclick={() => gotoSlideIx(0)} />
	<NavButton buttonType="prev" onclick={() => prev()} />
	<a href="/picture?p={currentSlug}" target="_blank">permalink</a>
	<NavButton buttonType="next" onclick={() => next()} />
	<NavButton buttonType="last" onclick={() => gotoSlideIx(slideCount - 1)} />
</div>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.c-menu {
		display: flex;
		flex-flow: row wrap;
		justify-content: center;
		align-items: center;
		margin: 0.25rem auto;
		text-align: center;

		a {
			margin: 0 1rem;
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
