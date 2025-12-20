<svelte:options runes={true} />

<script lang="ts">
	import { getPicAdminList } from "../js/db-ops";
	import {
		userSettings,
		setIsNewestFirst,
	} from "../stores/user-settings-store.svelte";
	import {
		currentParams,
		updateQueryStringParam,
	} from "../stores/route-store.svelte";
	import Menu from "../components/Menu.svelte";

	let picList = $state([] as PictureItem[]);

	const loadPicList = async () => {
		try {
			picList = (await getPicAdminList())?.data || [];

			if (currentParams.paramObj["newest"]) orderByTs();
			else if (userSettings.value.isNewestFirst) orderByTs();
			else orderBySeq();
		} catch (error) {
			console.error(error);
		}
	};

	const orderBySeq = () => {
		picList.sort((a, b) => a.seq - b.seq);
		setIsNewestFirst(false);
		updateQueryStringParam("newest", undefined);
	};

	const orderByTs = () => {
		picList.sort((a, b) => b.ts - a.ts);
		setIsNewestFirst(true);
		updateQueryStringParam("newest", "true");
	};

	loadPicList();
</script>

<div class="title">Curated Pictures</div>
<Menu />
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
<div class="carousel-area">
	{#each picList as p (p.id)}
		<div class="pic">
			<img
				class="carousel-img"
				src={"./pics/" + p.fileName}
				alt={p.description}
			/>
			<div class="subtitle" class:deleted={p.isDeleted}>
				{#if p.description}
					{p.description}<br />
				{/if}
				{p.id}-{p.seq}<br />{p.ts.toLocaleString()}
			</div>
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

		.subtitle {
			line-height: 1em;
			font-size: 0.8rem;
			text-align: center;
			flex: 0;

			&.deleted {
				color: c.$color-warning;
			}
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
