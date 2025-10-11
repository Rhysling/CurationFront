<svelte:options runes={true} />

<script lang="ts">
	import { getCleanPics } from "../js/db-ops";

	type CleanPicsProps = {
		picList: PictureItem[];
		refreshPicList: (pics: PictureItem[]) => void;
	};

	let { picList, refreshPicList }: CleanPicsProps = $props();

	let missingCount: number = $derived(0);
	let orphanCount: number = $derived(0);

	const cleanPics = async () => {
		refreshPicList((await getCleanPics())?.data || []);
	};
</script>

<div class="clean-bar">
	<button onclick={cleanPics}>Clean Pic List</button>
	<span>Missing Count = {missingCount}</span>
	<span>Orphan Count = {orphanCount}</span>
</div>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	@media only screen and (width <= c.$bp-small) {
	}
</style>
