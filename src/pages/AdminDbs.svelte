<svelte:options runes={true} />

<script lang="ts">
	import { getBackupList, getFile, postBackup } from "../js/db-admin-ops";
	import Menu from "../components/Menu.svelte";

	let pdbList: string[] = $state([]);
	let udbList: string[] = $state([]);

	const loadPdbList = async () => {
		try {
			pdbList = (await getBackupList("PicturesDb"))?.data || [];
		} catch (error) {
			pdbList = ["Error loading list"];
		}
	};

	const loadUdbList = async () => {
		try {
			udbList = (await getBackupList("UsersDb"))?.data || [];
		} catch (error) {
			udbList = ["Error loading list"];
		}
	};

	const downloadAndSave = async (fileName: string) => {
		try {
			const fileJson = JSON.stringify((await getFile(fileName))?.data || []);
			const fileTextBlob = new Blob([fileJson], {
				type: "text/plain;charset=utf-8",
			});

			const blobUrl = URL.createObjectURL(fileTextBlob);
			downloadFile(blobUrl, fileName);
			setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
		} catch (error) {}
	};

	function downloadFile(url: string, fileName: string) {
		const link = document.createElement("a");
		link.href = url;

		if (fileName) {
			link.download = fileName;
		}

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	loadPdbList();
	loadUdbList();
</script>

<div class="title">Admin Databases</div>

<div class="list">
	<div class="list-title">PicturesDb Backup List</div>
	<div>&nbsp;</div>
	<div>PicturesDb.json</div>
	<div>
		<a
			href="/"
			onclick={async (e: Event) => {
				e.preventDefault();
				downloadAndSave("PicturesDb.json");
			}}>Download</a
		>
	</div>
	{#each pdbList as item (item)}
		<div>{item}</div>
		<div>
			<a
				href="/"
				onclick={async (e: Event) => {
					e.preventDefault();
					downloadAndSave(item);
				}}>Download</a
			>
		</div>
	{/each}
	<div>
		<button
			onclick={async () => {
				await postBackup("PicturesDb");
				await loadPdbList();
			}}>Create PicturesDb Backup</button
		>
	</div>
	<div>&nbsp;</div>
</div>

<div class="list">
	<div class="list-title">UsersDb Backup List</div>
	<div>&nbsp;</div>
	<div>UsersDb.json</div>
	<div>
		<a
			href="/"
			onclick={async (e: Event) => {
				e.preventDefault();
				downloadAndSave("UsersDb.json");
			}}>Download</a
		>
	</div>
	{#each udbList as item (item)}
		<div>{item}</div>
		<div>
			<a
				href="/"
				onclick={async (e: Event) => {
					e.preventDefault();
					downloadAndSave(item);
				}}>Download</a
			>
		</div>
	{/each}
	<div>
		<button
			onclick={async () => {
				await postBackup("UsersDb");
				await loadUdbList();
			}}>Create UsersDb Backup</button
		>
	</div>
	<div>&nbsp;</div>
</div>

<div>&nbsp;</div>
<Menu />

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.title {
		font-size: 2rem;
		font-weight: bold;
		text-align: center;
		margin: 1rem auto;
	}

	.list {
		display: grid;
		grid-template-columns: 1fr 7rem;
		gap: 0;
		max-width: 600px;
		margin: 1rem auto;
		border: 1px solid c.$main-color;
		border-radius: 0.5rem;
		font-size: 0.8rem;

		.list-title {
			font-weight: bold;
		}

		> div {
			padding: 0 0 0 1rem;
		}
		button {
			margin: 1rem 0;
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
