<svelte:options runes={true} />

<script lang="ts">
	import { getPicPublicList } from "../js/db-ops";
	import { user } from "../stores/user-store.svelte";
	import { userSettings } from "../stores/user-settings-store.svelte";
	import {
		pageState,
		updateQueryStringParam,
	} from "../stores/route-store.svelte";
	import { onMount } from "svelte";

	import {
		getSlug,
		orderBySeq as applyOrderBySeq,
		orderByTs as applyOrderByTs,
	} from "../js/utils";
	import { mapKeywordsAll, getKeywordsList } from "../js/keyword-ops";
	import Carousel from "../components/carousel/Carousel.svelte";
	import Modal from "../components/Modal.svelte";
	import Menu from "../components/Menu.svelte";
	import CurationMenu from "../components/CurationMenu.svelte";

	let picListMaster = $state([] as PictureItem[]);
	let picList = $state([] as PictureItem[]);
	let keyword = $state("");
	let isOpenModal = $state(false);
	let slideCount = $derived(picList.length);
	let keywordsList = $derived(getKeywordsList(picListMaster));

	const loadPicList = async () => {
		try {
			picListMaster = (await getPicPublicList()) || [];
			picListMaster = picListMaster.map(mapKeywordsAll);

			if (pageState.paramObj["keyword"])
				keyword = pageState.paramObj["keyword"].trim().toLowerCase();

			if (keyword) {
				picList = picListMaster.filter((pic) =>
					pic.keywordsAll?.includes(keyword),
				);
			} else {
				picList = picListMaster;
			}

			if (pageState.paramObj["newest"]) orderByTs();
			else if (userSettings.value.isNewestFirst) orderByTs();
			else orderBySeq();
		} catch (error) {
			console.error(error);
		}
	};

	const setKeyword = (kw: string) => {
		// keywordsAll is all lowercase, so match case-insensitively.
		keyword = kw.trim().toLowerCase();
		updateQueryStringParam("keyword", keyword || undefined);
		if (keyword) {
			picList = picListMaster.filter((pic) =>
				pic.keywordsAll?.includes(keyword),
			);
		} else {
			picList = picListMaster;
		}
		carousel?.goTo(0);
	};

	$effect(() => {
		const p = pageState.paramObj.p;
		const ix =
			p && picList.length
				? picList.findIndex((pic) => getSlug(pic.fileName) === p)
				: -1;

		// CurationMenu writes `p` for the slide we are already on, so most runs of this
		// effect are echoes of our own navigation. Only move for a genuine mismatch —
		// a fresh URL, the back button, or a re-sort.
		if (ix >= 0 && ix !== carousel?.getCurrentSlide()) {
			const timer = setTimeout(() => {
				carousel?.goTo(ix);
				pageState.isNavFromUrl = false;
			}, 100);
			return () => clearTimeout(timer);
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
		applyOrderBySeq(picListMaster);
		applyOrderBySeq(picList);
		carousel?.goTo(0);
	};
	const orderByTs = () => {
		applyOrderByTs(picListMaster);
		applyOrderByTs(picList);
		carousel?.goTo(0);
	};

	// picList may be the same array as picListMaster, so replace in each by id.
	const updatePicItem = (savedPic: PictureItem) => {
		// Remove a destroyed pic from the list.
		if (savedPic.fileName === "" && savedPic.isDeleted) {
			picListMaster = picListMaster.filter((p) => p.id !== savedPic.id);
			picList = picList.filter((p) => p.id !== savedPic.id);
			// goTo clamps, so this keeps the index in range when the last slide was removed.
			carousel?.goTo(carousel.getCurrentSlide());
			return;
		}

		const pic = mapKeywordsAll(savedPic);
		for (const list of [picListMaster, picList]) {
			const ix = list.findIndex((p) => p.id === pic.id);
			if (ix >= 0) list[ix] = pic;
		}
	};

	const enlarge = (e: Event) => {
		e.preventDefault();
		isOpenModal = true;
	};
</script>

<div class="page-content">
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
					<div class="slide-title">
						<a href={slide.link} target="_blank" rel="noopener noreferrer"
							>{slide.title || "Link"}</a
						>
					</div>
				{:else}
					<div class="slide-title">{slide.title}</div>
				{/if}
				{#if slide.description && slide.title != slide.description}
					<div class="slide-description">{slide.description}</div>
				{/if}
			{/snippet}

			<!--//canScrollPrev: boolean, prev: () => void, canScrollNext: boolean, next: () => void, nextA11y: any, prevA11y: any-->
			{#snippet prev(x)}
				<button
					title="Previous"
					class={"prev"}
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
		{#if keyword && picList.length === 0 && picListMaster.length > 0}
			<div class="no-match">No pictures match "{keyword}".</div>
		{/if}
	</div>

	<CurationMenu
		gotoSlideIx={carousel?.goTo}
		prev={carousel?.prev}
		next={carousel?.next}
		{ixSlide}
		{slideCount}
		{currentPic}
		{keyword}
		{setKeyword}
		{keywordsList}
		picList={picListMaster}
		{updatePicItem}
	/>
	{#if user.value.isAdmin}
		<Menu />
	{/if}
</div>

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
		width: 100%;
		height: 100%;
		min-height: 0;
		padding: 0.3rem 0.3rem 0;
	}

	.page-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}

	.sort {
		text-align: center;
		flex: none;

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
		width: 100%;
		max-width: min(600px, 90vw);
		margin: 0 auto;
		position: relative;
		flex: 1 1 auto;
		min-height: 0;
		display: flex;
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
		flex: 0 1 auto;
		min-height: 0;
		object-fit: contain;
	}

	.big-picture {
		width: 90vw;
		height: 90vh;
	}

	.modal-img {
		display: block;
		width: 100%;
		height: 100%;
		max-width: 90vw;
		max-height: 90vh;
		object-fit: contain;
	}

	.no-match {
		margin: auto;
		padding: 2rem 1rem;
		font-size: 1.2rem;
		font-style: italic;
		text-align: center;
		color: c.$body-text;
	}

	.slide-title {
		text-align: center;
		margin: 0.5rem auto 0;
		font-size: 1.2rem;
		text-wrap: balance;
		color: c.$body-text;
		flex: none;
	}

	.slide-description {
		text-align: center;
		margin: 0.5rem auto 1rem;
		font-size: 1rem;
		font-style: italic;
		text-wrap: balance;
		color: c.$body-text;
		flex: none;
	}

	.title {
		font-size: 2rem;
		font-weight: bold;
		text-align: center;
		margin: 1rem auto 0.5rem;
		flex: none;
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
