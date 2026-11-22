<svelte:options runes={true} />

<script lang="ts">
	import {
		pageState,
		updateQueryStringParam,
	} from "../stores/route-store.svelte";
	import Menu from "../components/Menu.svelte";
	import Tabs from "../components/Tabs.svelte";
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

	<Tabs {tabs} active={activeTab} onselect={selectTab} />

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
