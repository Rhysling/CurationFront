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
	let orphanCount: number = $derived(picList.filter((a) => !a.seq).length);

	const cleanPics = async () => {
		refreshPicList((await getCleanPics())?.data || []);
	};
</script>

<div class="clean-bar">
	<button onclick={cleanPics} disabled={isListEditMode}>Clean Pic List</button>
	<span>Missing Count = {missingCount}</span>
	<span>Orphan Count = {orphanCount}</span>
</div>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.clean-bar {
		border: 2px solid c.$main-color;
		border-radius: 0.5rem;
		max-width: 800px;
		margin: 1rem auto;
		padding: 0.25rem 0;

		span {
			display: inline-block;
			margin: 0 1rem;
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
