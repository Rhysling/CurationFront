<svelte:options runes={true} />

<script lang="ts">
	import { dragAttachment } from "../js/drag.svelte";
	import { getPicPublicList } from "../js/db-ops";
	import Menu from "../components/Menu.svelte";

	let picList = $state([] as PictureItem[]);
	let slideCount = $derived(picList.length);
	let isNewestFirst = $state(false);

	const loadPicList = async () => {
		try {
			picList = ((await getPicPublicList())?.data || []).sort(
				(a, b) => a.seq - b.seq,
			);
		} catch (error) {
			console.error(error);
		}
	};

	const orderBySeq = () => {
		picList.sort((a, b) => a.seq - b.seq);
		isNewestFirst = false;
	};

	const orderByTs = () => {
		picList.sort((a, b) => b.ts - a.ts);
		isNewestFirst = true;
	};

	loadPicList();
</script>

<div class="title">Curated Pictures</div>
<Menu />
<div class="sort">
	{#if !isNewestFirst}
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
<div class="carousel-area">
	{#each picList as p (p.id)}
		<div class="pic">
			<img
				class="carousel-img"
				src={"./pics/" + p.fileName}
				alt={p.description}
				title={p.description}
			/>
			<div>{p.ts}</div>
		</div>
	{/each}
</div>

<Menu />

<!-- <div {@attach dragAttachment} class="pic"></div> -->

<style lang="scss">
	@use "../styles/custom-variables" as c;
	.title {
		font-size: 2rem;
		font-weight: bold;
		text-align: center;
		margin: 1rem auto;
	}

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

	.carousel-area {
		border: 3px solid c.$main-color;
		border-radius: 1rem;
		max-width: min(800px, 90vw);
		margin: 1rem auto;
		padding: 1rem;
		position: relative;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 0.2rem;
	}

	.pic {
		border: 1px solid black;
		background-color: #eeffee;
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		img {
			max-width: 150px;
			max-height: 150px;
			margin: 0 auto;
			flex: 0;
		}

		div {
			text-align: center;
			flex: 0;
		}
	}

	// .pic {
	// 	width: 150px;
	// 	height: 150px;
	// 	background-color: teal;
	// 	border: 1px solid black;
	// 	border-radius: 0.4rem;
	// 	box-shadow: 3px 3px 10px #666666;
	// 	margin: 0 auto;
	// 	position: relative;
	// }

	@media only screen and (width <= c.$bp-small) {
	}
</style>
