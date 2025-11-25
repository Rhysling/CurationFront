<svelte:options runes={true} />

<script lang="ts">
	import { getPicBySlug } from "../js/db-ops";
	import { currentParams } from "../stores/route-store.svelte";

	const slug: string | undefined = currentParams.paramObj.p;
	let pic: PictureItem | undefined = $state();
	let fileName: string | undefined = $derived(pic?.fileName);

	const getPic = async (slug: string) => {
		pic = (await getPicBySlug(slug))?.data;
	};

	if (slug) getPic(slug);
</script>

<div class="pic-container">
	{#if fileName}
		<img
			src={"./pics/" + fileName}
			title={pic?.description}
			alt={pic?.description}
		/>
	{:else}
		<div class="not-found">Picture Not Found</div>
	{/if}
</div>

{#if pic?.description}
	<div class="description">
		{pic.description}
	</div>
{/if}

<div class="to-curation">
	<a href={fileName ? "/curation?p=" + slug : "/curation"}>Go to Curation</a>
</div>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.pic-container {
		display: flex;
		flex-flow: column nowrap;
		justify-content: center;
		align-items: center;
		border: 3px solid c.$main-color;
		border-radius: 1rem;
		background-color: white;
		max-width: min(800px, 92vw);
		max-height: 80vh;
		margin: 1.5rem auto;
		padding: 1rem;

		img {
			display: block;
			width: 100%;
			max-height: 75vh;
			object-fit: contain;
		}
	}

	.description {
		text-align: center;
		font-size: 2rem;
		font-weight: bold;
	}

	.not-found {
		font-size: 3rem;
		font-weight: bold;
	}

	.to-curation {
		text-align: center;
		margin: 1rem auto;
	}

	@media only screen and (height <= 700px) {
		.pic-container {
			margin: 0.5rem auto;
		}

		.description {
			font-size: 1.5rem;
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
