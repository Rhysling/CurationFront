<svelte:options runes={true} />

<script lang="ts">
	import {
		getSecuredValue,
		getAdminValue,
		getPicPublicList,
	} from "../js/db-ops";
	import { mapKeywordsAll, getKeywordsList } from "../js/utils";
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
			adminValue = "Error loading secured value";
		}
	};

	// *** Keyword List ***

	let picList: PictureItem[] = [];
	let keywordList: string[] = $state([]);

	const loadKeywords = async () => {
		try {
			picList = ((await getPicPublicList()) || []).map(mapKeywordsAll);
			keywordList = getKeywordsList(picList);
		} catch (error) {
			console.error("Error loading picture list", error);
		}
	};

	const clearKeywords = () => {
		keywordList = [];
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
			<button onclick={loadKeywords}>Load</button>
			<button onclick={clearKeywords}>Clear</button>
		</div>

		{#if keywordList.length === 0}
			<div>No pics loaded</div>
		{:else}
			<div class="keyword-grid">
				{#each keywordList as kw, ix}
					<div style="text-align: right;">{ix}</div>
					<div>{kw}</div>
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
			grid-template-columns: 1fr 4fr;
			gap: 0.5rem;
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
