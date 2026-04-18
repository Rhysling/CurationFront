<svelte:options runes={true} />

<script lang="ts">
	import { getCleanPics } from "../js/db-ops";

	type CleanPicsProps = {
		picList: PictureItem[];
		isListEditMode: boolean;
		refreshPicList: (pics: PictureItem[]) => void;
	};

	let { picList, isListEditMode, refreshPicList }: CleanPicsProps = $props();

	let missingCount: number = $derived(
		picList.filter((a) => a.isMissing == true).length,
	);
	let orphanList: PictureItem[] = $derived(picList.filter((a) => !a.seq));
	let orphanCount: number = $derived(orphanList.length);

	const cleanPics = async () => {
		refreshPicList((await getCleanPics())?.data || []);
	};
</script>

<div class="clean-bar">
	<div>
		<button onclick={cleanPics} disabled={isListEditMode}>Clean Pic List</button
		>
		<span>Missing = {missingCount}</span>
		<span>Orphans = {orphanCount}</span>
	</div>
	{#if orphanCount > 0}
		{#each orphanList as pic}
			<img
				src={`/pics/${pic.fileName}`}
				alt={pic.description}
				title={`ID: ${pic.id} | ${pic.description}`}
			/>
		{/each}
	{/if}
</div>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.clean-bar {
		border: 2px solid c.$main-color;
		border-radius: 0.5rem;
		max-width: 800px;
		margin: 0.5rem auto;
		padding: 0.25rem 0;

		span {
			display: inline-block;
			margin: 0 1rem;
		}

		img {
			display: inline-block;
			width: 150px;
			height: 150px;
			object-fit: cover;
			border: 1px solid c.$main-color;
			border-radius: 0.25rem;
			margin: 0.25rem;
		}

		@media only screen and (width <= c.$bp-small) {
			margin: 0.25rem auto;
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
