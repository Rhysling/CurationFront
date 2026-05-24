<svelte:options runes={true} />

<script lang="ts">
	import { getAuditList, postCleanPics } from "../js/db-ops";

	let {
		isListEditMode,
		refreshPicList,
	}: {
		isListEditMode: boolean;
		refreshPicList: (pics: PictureItem[]) => void;
	} = $props();

	let auditList: AuditList = $state({ missing: [], orphans: [] });
	let isChecked = $state(false);

	let missingCount: number = $derived(auditList.missing.length);
	let orphanCount: number = $derived(auditList.orphans.length);

	const checkPics = async () => {
		auditList = (await getAuditList())?.data || { missing: [], orphans: [] };
		isChecked = true;
	};

	const cleanPics = async () => {
		let pl = (await postCleanPics())?.data || [];
		let missing = pl.filter((a) => a.isMissing == true);
		let orphans = pl.filter((a) => !a.seq);
		auditList = { missing, orphans };
		refreshPicList(pl);
		isChecked = true;
	};
</script>

<div class="clean-bar">
	<div>
		<button onclick={checkPics} disabled={isListEditMode}>Check Pics</button>
		<span>Missing = {isChecked ? missingCount : "??"}</span>
		<span>Orphans = {isChecked ? orphanCount : "??"}</span> --
		<button onclick={cleanPics} disabled={isListEditMode}>Clean Pic List</button
		>
	</div>
	{#if orphanCount > 0}
		{#each auditList.orphans as pic}
			<img src={`/pics/${pic.fileName}`} alt="Orphan Pic" />
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
