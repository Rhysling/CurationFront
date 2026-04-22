<svelte:options runes={true} />

<script lang="ts">
	import { getPicPublicList } from "../js/db-ops";
	import { user } from "../stores/user-store.svelte";
	import { userSettings } from "../stores/user-settings-store.svelte";
	import { pageState } from "../stores/route-store.svelte";
	import { onMount } from "svelte";

	import {
		orderBySeq as applyOrderBySeq,
		orderByTs as applyOrderByTs,
	} from "../js/utils";
	import Carousel from "../components/carousel/Carousel.svelte";
	import Modal from "../components/Modal.svelte";
	import Menu from "../components/Menu.svelte";
	import CurationMenu from "../components/CurationMenu.svelte";

	let picList = $state([] as PictureItem[]);
	let isOpenModal = $state(false);
	let slideCount = $derived(picList.length);

	const loadPicList = async () => {
		try {
			picList = (await getPicPublicList())?.data || [];
			if (pageState.paramObj["newest"]) orderByTs();
			else if (userSettings.value.isNewestFirst) orderByTs();
			else orderBySeq();
		} catch (error) {
			console.error(error);
		}
	};

	$effect(() => {
		const p = pageState.paramObj.p;
		if (p && picList.length) {
			const ix = picList.findIndex((pic) => pic.fileName.startsWith(p));
			if (ix >= 0) {
				setTimeout(() => {
					carousel?.goTo(ix);
					pageState.isNavFromUrl = false;
				}, 100);
				return;
			}
		}
		// Don't clear isNavFromUrl while waiting for picList to load with a pending p param
		if (!p || picList.length > 0) {
			pageState.isNavFromUrl = false;
		}
	});

	onMount(() => {
		loadPicList();
	});

	type CarouselOps = {
		next: () => void;
		prev: () => void;
		goTo: (slide: number) => void;
		getCurrentSlide: () => number;
	};

	let carousel: CarouselOps | undefined = $state();
	let currentPic: PictureItem | null = $derived(
		(carousel && picList[carousel.getCurrentSlide()]) || null,
	);
	let ixSlide: number = $derived((carousel && carousel.getCurrentSlide()) || 0);

	const orderBySeq = () => {
		applyOrderBySeq(picList);
		carousel?.goTo(0);
	};
	const orderByTs = () => {
		applyOrderByTs(picList);
		carousel?.goTo(0);
	};

	const enlarge = (e: Event) => {
		e.preventDefault();
		isOpenModal = true;
	};
</script>

<div class="title">Curated Pictures</div>

<div class="sort">
	{#if !userSettings.value.isNewestFirst}
		<span>Displayed in Curation Order</span>
		<span class="dot">&#8226;</span>
		<a
			href="/"
			onclick={(e) => {
				e.preventDefault();
				orderByTs();
			}}>Show Newest First</a
		>
	{:else}
		<span>Displayed Newest First</span>
		<span class="dot">&#8226;</span>
		<a
			href="/"
			onclick={(e) => {
				e.preventDefault();
				orderBySeq();
			}}>Show in Curation Order</a
		>
	{/if}
</div>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="car">
	<Carousel
		bind:this={carousel}
		slides={picList}
		containerClass={"carousel-container"}
	>
		{#snippet slide({ slide })}
			<img
				class="carousel-img"
				style:max-height={slide.description || slide.link ? "62vh" : "67vh"}
				src={"./pics/" + slide.fileName}
				alt={slide.description}
				loading="lazy"
				onclick={(e) => {
					e.stopImmediatePropagation();
					enlarge(e);
				}}
			/>
			{#if slide.link}
				<div class="slide-description">
					<a href={slide.link} target="_blank">{slide.description || "Link"}</a>
				</div>
			{:else}
				<div class="slide-description">{slide.description}</div>
			{/if}
		{/snippet}

		<!--//canScrollPrev: boolean, prev: () => void, canScrollNext: boolean, next: () => void, nextA11y: any, prevA11y: any-->
		{#snippet prev(x)}
			<button
				title="Previous"
				class={`prev ${!x.canScrollPrev ? "opacity-50 cursor-not-allowed" : ""}`}
				onclick={x.prev}
				disabled={!x.canScrollPrev}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						d="M9.343 18.657a1 1 0 0 1-.707-1.707l4.95-4.95-4.95-4.95a1 1 0 0 1 1.414-1.414l5.657 5.657a1 1 0 0 1 0 1.414l-5.657 5.657a1 1 0 0 1-.707.293z"
						transform="rotate(180)"
						transform-origin="center"
					/>
				</svg>
			</button>
		{/snippet}
		{#snippet next(x)}
			<button
				title="Next"
				class={`next ${!x.canScrollNext ? "opacity-50 !cursor-not-allowed" : ""}`}
				onclick={x.next}
				disabled={!x.canScrollNext}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						d="M9.343 18.657a1 1 0 0 1-.707-1.707l4.95-4.95-4.95-4.95a1 1 0 0 1 1.414-1.414l5.657 5.657a1 1 0 0 1 0 1.414l-5.657 5.657a1 1 0 0 1-.707.293z"
					/>
				</svg>
			</button>
		{/snippet}
	</Carousel>
</div>

<CurationMenu
	gotoSlideIx={carousel?.goTo}
	prev={carousel?.prev}
	next={carousel?.next}
	{ixSlide}
	{slideCount}
	{currentPic}
/>
{#if user.value.isAdmin}
	<Menu />
{/if}

<Modal bind:isOpen={isOpenModal}>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="big-picture">
		{#if currentPic}
			<img
				class="modal-img"
				src={"./pics/" + currentPic.fileName}
				alt={currentPic.description}
			/>
		{:else}
			<div
				style="font-size: 5rem;font-weight:bold;text-align:center;margin:0 auto;"
			>
				No Picture
			</div>
		{/if}
	</div>
</Modal>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	:global(.carousel-container) {
		border: 3px solid c.$main-color;
		border-radius: 0.5rem;
		height: 70vh;
		padding: 0.3rem 0.3rem 0;
	}

	// :global(.carousel-class) {
	// 	max-height: 70vh;
	// }

	.sort {
		text-align: center;

		span {
			font-weight: bold;
		}

		span,
		a {
			display: inline-block;
		}

		@media only screen and (width <= c.$bp-small) {
			span {
				display: block;
				margin: 0.25rem auto 0;
			}

			span.dot {
				display: none;
			}

			a {
				display: block;
				margin: 0 auto 0.25rem;
			}
		}
	}

	.car {
		max-width: min(600px, 90vw);
		margin: 0 auto;
		position: relative;
	}

	.prev {
		position: absolute;
		top: 50%;
		left: -5rem;
		width: 3rem;
		height: 3rem;
		display: flex;
		justify-content: space-between;
		padding: 0;
		transform: translateY(-50%);
		z-index: 10;

		@media only screen and (width <= 800px) {
			//c.$bp-small
			display: none;
		}
	}

	.next {
		position: absolute;
		top: 50%;
		right: -5rem;
		width: 3rem;
		height: 3rem;
		display: flex;
		justify-content: space-between;
		padding: 0;
		transform: translateY(-50%);
		z-index: 10;

		@media only screen and (width <= 800px) {
			//c.$bp-small
			display: none;
		}
	}

	.carousel-img {
		display: block;
		max-width: 100%;
		width: auto;
		height: auto;
		margin: 0 auto;
	}

	.big-picture {
		width: 90vw;
		height: 90vw;
	}

	.modal-img {
		display: block;
		width: 100%;
		height: 100%;
		max-width: 90vw;
		max-height: 90vh;
		object-fit: contain;
	}

	.slide-description {
		text-align: center;
		margin: 0.5rem auto 1rem;
		font-size: 1.2rem;
		color: c.$body-text;
	}

	.title {
		font-size: 2rem;
		font-weight: bold;
		text-align: center;
		margin: 1rem auto 0.5rem;
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
