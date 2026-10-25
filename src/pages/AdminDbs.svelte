<svelte:options runes={true} />

<script lang="ts">
	import {
		getBackupList,
		getFile,
		postBackup,
		postRestore,
		postDelete,
	} from "../js/db-admin-ops";
	import Menu from "../components/Menu.svelte";

	let dbList: string[] = $state([]);

	const loadDbList = async () => {
		try {
			dbList = (await getBackupList()) || [];
		} catch (error) {
			dbList = ["Error loading list"];
		}
	};

	// The post* functions return undefined on failure; a successful body may be "".
	const backupDb = async (): Promise<boolean> => {
		const result = await postBackup();
		if (result === undefined) {
			alert("Failed to back up the database. Please try again.");
			return false;
		}
		await loadDbList();
		return true;
	};

	const restoreDb = async (fileName: string) => {
		// Never restore without a fresh backup to fall back on.
		if (!(await backupDb())) return;

		const result = await postRestore(fileName);
		if (result === undefined)
			alert(`Failed to restore ${fileName}. Please try again.`);
		await loadDbList();
	};

	const deleteDb = async (fileName: string) => {
		const result = await postDelete(fileName);
		if (result === undefined)
			alert(`Failed to delete ${fileName}. Please try again.`);
		await loadDbList();
	};

	const downloadAndSave = async (fileName: string) => {
		try {
			const fileBlob = await getFile(fileName);
			if (!fileBlob) throw new Error("File not found");
			const blobUrl = URL.createObjectURL(fileBlob);
			downloadFile(blobUrl, fileName);
			setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
		} catch (error) {
			alert("Failed to download file. Please try again.");
		}
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

	loadDbList();
</script>

<div class="admin-dbs-page">
	<div class="title">Admin Databases</div>

	<div class="list">
		<div class="list-title">Database Backup List</div>
		<div>&nbsp;</div>
		<div>&nbsp;</div>
		<div>&nbsp;</div>
		{#each dbList as item (item)}
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
			<div>
				{#if item.indexOf("_") > 0}
					<a
						href="/"
						onclick={async (e: Event) => {
							e.preventDefault();
							if (confirm(`Restore ${item}?`)) await restoreDb(item);
						}}>Restore</a
					>
				{/if}
			</div>
			<div>
				{#if item.indexOf("_") > 0}<a
						href="/"
						onclick={async (e: Event) => {
							e.preventDefault();
							if (confirm(`Delete ${item}?`)) await deleteDb(item);
						}}>Delete</a
					>
				{/if}
			</div>
		{/each}
		<div>
			<button onclick={backupDb}>Backup Db</button>
		</div>
		<div>&nbsp;</div>
		<div>&nbsp;</div>
		<div>&nbsp;</div>
	</div>

	<div>&nbsp;</div>
	<Menu />
</div>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	// App's .page clips to the viewport; this page scrolls within it instead
	.admin-dbs-page {
		height: 100%;
		overflow-y: auto;
	}

	.title {
		font-size: 2rem;
		font-weight: bold;
		text-align: center;
		margin: 1rem auto;
	}

	.list {
		display: grid;
		grid-template-columns: 1fr auto auto auto;
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
			margin: 0 1rem;
		}
		button {
			margin: 1rem 0;
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
