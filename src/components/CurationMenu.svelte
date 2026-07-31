<svelte:options runes={true} />

<script lang="ts">
	import {
		updateQueryStringParam,
		pageState,
	} from "../stores/route-store.svelte";
	import { getSlug } from "../js/utils";
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

	const getRandomIx = () => {
		if (slideCount <= 1) return ixSlide;
		let ix;
		do {
			ix = Math.floor(Math.random() * slideCount);
		} while (ix === ixSlide);
		return ix;
	};

	let currentSlug = $derived.by(() =>
		currentPic?.fileName ? getSlug(currentPic.fileName) : "",
	);

	let isFirst = $derived(ixSlide == 0);
	let isLast = $derived(ixSlide == slideCount - 1);

	// Keep qs in sync
	// updateQueryStringParam

	$effect(() => {
		if (pageState.isNavFromUrl) return;
		if (!currentPic) return;

		updateQueryStringParam("p", getSlug(currentPic.fileName));
	});
</script>

<div class="c-menu">
	<NavButton
		buttonType="first"
		disabled={isFirst}
		onclick={() => gotoSlideIx(0)}
	/>
	<NavButton buttonType="prev" disabled={isFirst} onclick={() => prev()} />
	<a
		class="button"
		style="font-size:1.7rem;"
		href="/picture?p={currentSlug}"
		title="Enlarge"
		aria-label="Enlarge">++</a
	>
	<button
		style="font-size:1.2rem;"
		title="Random"
		aria-label="Random"
		onclick={() => gotoSlideIx(getRandomIx())}
	>
		??
	</button>
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

		a,
		button {
			height: 2rem;
			width: 3rem;
			padding: 0;

			&:hover {
				text-decoration: none;
				color: white;
			}
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
