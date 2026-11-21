<svelte:options runes={true} />

<script lang="ts">
	import {
		pageState,
		updateQueryStringParam,
	} from "../stores/route-store.svelte";
	import Menu from "../components/Menu.svelte";
	import AdminUsersTab from "../components/AdminUsersTab.svelte";
	import AdminDbsTab from "../components/AdminDbsTab.svelte";
	import AdminKeywordsTab from "../components/AdminKeywordsTab.svelte";

	const tabs = [
		{ key: "users", label: "Users" },
		{ key: "dbs", label: "Databases" },
		{ key: "keywords", label: "Keywords" },
	] as const;

	type TabKey = (typeof tabs)[number]["key"];

	// Read from the URL so refresh, bookmarks and the back button keep the tab.
	// A missing or unknown value falls back to the first tab.
	let activeTab: TabKey = $derived(
		tabs.find((t) => t.key === pageState.paramObj["tab"])?.key ?? "users",
	);

	const selectTab = (key: TabKey) => updateQueryStringParam("tab", key);
</script>

<div class="admin-page">
	<div class="title">Admin</div>

	<div class="tabs" role="tablist">
		{#each tabs as tab (tab.key)}
			<button
				role="tab"
				id="tab-{tab.key}"
				class:active={tab.key === activeTab}
				aria-selected={tab.key === activeTab}
				aria-controls="tab-panel"
				onclick={() => selectTab(tab.key)}>{tab.label}</button
			>
		{/each}
	</div>

	<div
		class="tab-panel"
		id="tab-panel"
		role="tabpanel"
		aria-labelledby="tab-{activeTab}"
	>
		{#if activeTab === "users"}
			<AdminUsersTab />
		{:else if activeTab === "dbs"}
			<AdminDbsTab />
		{:else}
			<AdminKeywordsTab />
		{/if}
	</div>

	<div class="menu-wrap">
		<Menu />
	</div>
</div>

<style lang="scss">
	@use "sass:color";
	@use "../styles/custom-variables" as c;

	// App's .page clips to the viewport: the title, tabs and menu stay put
	// while the tab panel scrolls.
	.admin-page {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}

	.title {
		font-size: 2rem;
		font-weight: bold;
		text-align: center;
		margin: 1rem auto;
		flex: none;
	}

	// Folder tabs: inactive tabs are outlined, the active tab is filled and
	// taller so it merges with the colored rule under the row.
	.tabs {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		gap: 0.25rem;
		max-width: 600px;
		width: 100%;
		margin: 0 auto;
		border-bottom: 3px solid c.$main-color;
		flex: none;

		button {
			margin: 0;
			padding: 0.4rem 1rem;
			color: c.$main-color;
			background-color: c.$light-background;
			border: 1px solid c.$main-color;
			border-bottom: none;
			border-radius: 6px 6px 0 0;
			font-weight: normal;

			&:hover {
				color: c.$main-darker;
				background-color: color.adjust(c.$main-lightest, $lightness: 15%);
			}

			// Show the focus ring for keyboard use only, not after a click
			&:focus:not(:focus-visible) {
				outline: none;
			}

			&.active,
			&.active:hover {
				color: #fff;
				background-color: c.$main-color;
				background-image: none;
				font-weight: bold;
				padding-top: 0.6rem;
				cursor: default;
			}

			@media only screen and (width <= c.$bp-small) {
				font-size: 0.8rem;
				padding: 0.3rem 0.6rem;

				&.active {
					padding-top: 0.45rem;
				}
			}
		}
	}

	.tab-panel {
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
		width: 100%;
		padding: 0 0.5rem;
		box-sizing: border-box;
	}

	.menu-wrap {
		flex: none;
	}
</style>
