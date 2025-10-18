<svelte:options runes={true} />

<script lang="ts">
	import { getPicBySlug } from "../js/db-ops";

	const entries = new URLSearchParams(window.location.search).entries();
	const qp: any = {};
	for (let [key, val] of entries) {
		qp[key] = val;
	}

	const slug: string | undefined = qp["p"];
	let pic: PictureItem | undefined = $state();
	let fileName: string | undefined = $derived(pic?.fileName);

	const getPic = async (slug: string) => {
		pic = (await getPicBySlug(slug))?.data;
	};

	if (slug) {
		getPic(slug);
	}
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
