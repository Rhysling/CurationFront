<svelte:options runes={true} />

<script lang="ts">
	import { getPicPublicList } from "../js/db-ops";
	import { getKeywordsSummary } from "../js/keyword-ops";
	import type { KeywordSummary } from "../js/keyword-ops";

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

<style lang="scss">

	.keyword-list {
		max-width: 600px;
		margin: 1rem auto;
		border: 3px solid var(--main-color);
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

		// No own scroll area: the Admin page's tab panel scrolls, and the
		// sticky header sticks to it.
		.keyword-grid {
			display: grid;
			grid-template-columns: 0.5fr 4fr 1fr 1fr 1fr 1fr;
			gap: 0.5rem;

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
</style>
