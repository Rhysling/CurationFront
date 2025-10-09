<svelte:options runes={true} />

<script lang="ts">
	import { picsGetPublicList } from "../js/db-ops";
	import Carousel from "../components/carousel/Carousel.svelte";
	import Menu from "../components/Menu.svelte";

	let picList = $state([] as PictureItem[]);

	let loadPicList = async () => {
		try {
			picList = ((await picsGetPublicList())?.data || []).sort(
				(a, b) => a.seq - b.seq,
			);
		} catch (error) {
			console.error(error);
		}
	};

	loadPicList();

	let carousel;
</script>

<div class="title">Curated Pictures</div>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="car">
	<Carousel slides={picList} containerClass={"carousel-container"}>
		{#snippet slide({ slide })}
			<img
				src={"./pics/" + slide.fileName}
				alt={slide.description}
				onclick={(e) => {
					e.stopPropagation();
					alert("Clicked!");
				}}
			/>
			<div class="slide-description">{slide.description}</div>
		{/snippet}

		<!--//canScrollPrev: boolean, prev: () => void, canScrollNext: boolean, next: () => void, nextA11y: any, prevA11y: any-->
		{#snippet prev(x)}
			<button
				{...x.a11y}
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
				{...x.a11y}
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

<Menu />

<style lang="scss">
	@use "../styles/custom-variables" as c;

	:global(.carousel-container) {
		border: 3px solid c.$main-color;
		border-radius: 1rem;
		max-height: 70vh;
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

	img {
		display: block;
		//object-fit: contain;
		width: 100%;
		margin: 1rem auto 0;

		// &:hover {
		// 	transform: scale(1.5);
		// }
	}

	.slide-description {
		text-align: center;
		margin: 0.5rem auto 1rem;
		font-size: 1.2rem;
		color: c.$body-text;
	}

	.title {
		font-size: 3rem;
		font-weight: bold;
		text-align: center;
		margin: 2rem auto;
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
