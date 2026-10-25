<svelte:options runes={true} />

<script lang="ts">
	import {
		getSecuredValue,
		getAdminValue,
		getPicPublicList,
	} from "../js/db-ops";
	import { getKeywordsSummary } from "../js/keyword-ops";
	import type { KeywordSummary } from "../js/keyword-ops";
	import Menu from "../components/Menu.svelte";

	let securedValue = $state("Not loaded");
	let adminValue = $state("Not loaded");

	const loadSecuredValue = async () => {
		try {
			securedValue = (await getSecuredValue()) || "Get failed";
		} catch (error) {
			securedValue = "Error loading secured value";
		}
	};

	const loadAdminValue = async () => {
		try {
			adminValue = (await getAdminValue()) || "Get failed";
		} catch (error) {
			adminValue = "Error loading admin value";
		}
	};

	// *** Keyword List ***

	let picList: PictureItem[] = [];
	let keywordSummaryList: KeywordSummary[] = $state([]);

	const loadKeywordSummary = async () => {
		try {
			picList = (await getPicPublicList()) || [];
			keywordSummaryList = getKeywordsSummary(picList);
		} catch (error) {
			console.error("Error loading picture list", error);
		}
	};

	const clearKeywords = () => {
		keywordSummaryList = [];
	};

	// getKeywordsSummary returns the list already in ascending keyword order
	let keywordAscending = true;

	// Toggles between ascending and descending
	const sortByKeyword = () => {
		keywordAscending = !keywordAscending;
		const dir = keywordAscending ? 1 : -1;
		keywordSummaryList = [...keywordSummaryList].sort(
			(a, b) => dir * a.keyword.localeCompare(b.keyword),
		);
	};

	let anyCountDescending = false;

	// Toggles between descending and ascending; ties sort by keyword
	const sortByAnyCount = () => {
		anyCountDescending = !anyCountDescending;
		const dir = anyCountDescending ? -1 : 1;
		keywordSummaryList = [...keywordSummaryList].sort(
			(a, b) =>
				dir * (a.anyCount - b.anyCount) || a.keyword.localeCompare(b.keyword),
		);
	};
</script>

<div class="testing-page">
	<div class="mix">Testing Here</div>
	<div class="test">
		<div class="title">Admin value:</div>
		<div>{adminValue}</div>
		<div>
			<button onclick={loadAdminValue}>Go</button>
			<button onclick={() => (adminValue = "Reset")}>Reset</button>
		</div>
	</div>

	<div class="test">
		<div class="title">Secured value:</div>
		<div>{securedValue}</div>
		<div>
			<button onclick={loadSecuredValue}>Go</button>
			<button onclick={() => (securedValue = "Reset")}>Reset</button>
		</div>
	</div>

	<div class="keyword-list">
		<div class="top-bar">
			<span>Keyword List</span>
			<button onclick={loadKeywordSummary}>Load</button>
			<button onclick={clearKeywords}>Clear</button>
		</div>

		{#if keywordSummaryList.length === 0}
			<div>No pics loaded</div>
		{:else}
			<div class="keyword-grid">
				<div class="right header">Ix</div>
				<div class="header">
					<a
						href="/"
						onclick={(e) => {
							e.preventDefault();
							sortByKeyword();
						}}>Keyword</a
					>
				</div>
				<div class="right header">FN<br />Count</div>
				<div class="right header">Title<br />Count</div>
				<div class="right header">KW<br />Count</div>
				<div class="right header">
					<a
						href="/"
						onclick={(e) => {
							e.preventDefault();
							sortByAnyCount();
						}}>Any<br />Count</a
					>
				</div>
				{#each keywordSummaryList as kws, ix}
					<div class="right">{ix}</div>
					<div>{kws.keyword}</div>
					<div class="right">{kws.fileNameCount}</div>
					<div class="right">{kws.titleCount}</div>
					<div class="right">{kws.kwMatchCount}</div>
					<div class="right">{kws.anyCount}</div>
				{/each}
			</div>
		{/if}
	</div>

	<br />
	<Menu />
</div>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	// App's .page clips to the viewport; this page scrolls within it instead
	.testing-page {
		height: 100%;
		overflow-y: auto;
	}

	.mix {
		font-size: 3rem;
		font-weight: bold;
		text-align: center;
		margin: 2rem auto;
	}

	.test {
		max-width: 600px;
		margin: 1rem auto;

		.title {
			font-weight: bold;
		}
	}

	.keyword-list {
		max-width: 600px;
		margin: 2rem auto;
		border: 3px solid c.$main-color;
		border-radius: 0.5rem;
		padding: 0.5rem;

		.top-bar {
			text-align: center;
			margin-bottom: 0.5rem;

			span {
				font-size: 1.5rem;
				font-weight: bold;
				padding: 0 0.5rem 0 0;
			}
		}

		.keyword-grid {
			display: grid;
			grid-template-columns: 0.5fr 4fr 1fr 1fr 1fr 1fr;
			gap: 0.5rem;
			max-height: 65vh;
			overflow: auto;

			> div {
				padding: 0 0.2rem 0 0;
			}

			.header {
				font-weight: bold;
				line-height: 1rem;
				position: sticky;
				top: 0;
				z-index: 1;
				background: white;
			}

			.right {
				text-align: right;
			}
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
