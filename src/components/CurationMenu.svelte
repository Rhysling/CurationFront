<svelte:options runes={true} />

<script lang="ts">
	//import { user } from "../stores/user-store.svelte";

	import NavButton from "./NavButton.svelte";

	let {
		gotoSlideIx,
		prev,
		next,
		ixSlide,
		slideCount,
		currentPic,
	}: {
		gotoSlideIx: (ix: number) => void;
		prev: () => void;
		next: () => void;
		ixSlide: number;
		slideCount: number;
		currentPic: PictureItem | null;
	} = $props();

	let currentSlug = $derived.by(() => {
		if (!currentPic || !currentPic.fileName) return "";
		let ixp = currentPic.fileName.lastIndexOf(".");
		if (ixp > 0) return currentPic.fileName.substring(0, ixp);
		return "";
	});

	let isFirst = $derived(ixSlide == 0);
	let isLast = $derived(ixSlide == slideCount - 1);

	// Keep qs in sync

	const updateQueryStringParam = (key: string, value: string) => {
		const url = new URL(window.location.href);
		url.searchParams.set(key, value);
		window.history.replaceState({}, "", url);
	};

	$effect(() => {
		const fn = currentPic?.fileName ?? "";
		const ixp = fn.lastIndexOf(".");
		const slug = ixp > 0 ? fn.substring(0, ixp) : "";
		updateQueryStringParam("p", slug);
	});
</script>

<div class="c-menu">
	<NavButton
		buttonType="first"
		disabled={isFirst}
		onclick={() => gotoSlideIx(0)}
	/>
	<NavButton buttonType="prev" disabled={isFirst} onclick={() => prev()} />
	<a href="/picture?p={currentSlug}" target="_blank">permalink</a>
	<NavButton buttonType="next" disabled={isLast} onclick={() => next()} />
	<NavButton
		buttonType="last"
		disabled={isLast}
		onclick={() => gotoSlideIx(slideCount - 1)}
	/>
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
