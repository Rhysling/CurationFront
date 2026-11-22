<svelte:options runes={true} />

<script lang="ts">
	import {
		pageState,
		updateQueryStringParam,
	} from "../stores/route-store.svelte";
	import Menu from "../components/Menu.svelte";
	import Tabs from "../components/Tabs.svelte";
	import TrafficOverviewTab from "../components/traffic/TrafficOverviewTab.svelte";
	import TrafficBreakdownTab from "../components/traffic/TrafficBreakdownTab.svelte";
	import {
		RANGES,
		computeRange,
		intervalFor,
		type BreakdownSection,
	} from "../components/traffic/traffic-format";

	const tabs = [
		{ key: "overview", label: "Overview" },
		{ key: "content", label: "Content" },
		{ key: "sources", label: "Sources" },
		{ key: "audience", label: "Audience" },
	] as const;

	type TabKey = (typeof tabs)[number]["key"];

	// Tab and range live in the URL so refresh, bookmarks and the back button keep them.
	let activeTab: TabKey = $derived(
		tabs.find((t) => t.key === pageState.paramObj["tab"])?.key ?? "overview",
	);
	let rangeKey: TrafficRangeKey = $derived(
		RANGES.find((r) => r.key === pageState.paramObj["range"])?.key ?? "30d",
	);

	// Bumped by the refresh button so the range is recomputed up to "now".
	let refreshCount = $state(0);

	let range: TrafficRange = $derived.by(() => {
		refreshCount;
		return computeRange(rangeKey);
	});
	let interval = $derived(intervalFor(rangeKey));

	const selectTab = (key: TabKey) => updateQueryStringParam("tab", key);
	const selectRange = (key: TrafficRangeKey) =>
		updateQueryStringParam("range", key === "30d" ? undefined : key);

	const direct = (k: string) => (k && k !== "(direct)" ? k : "Direct / none");

	const sections: Record<Exclude<TabKey, "overview">, BreakdownSection[]> = {
		content: [
			{ dimension: "page", title: "Top pages", keyLabel: "Path" },
			{ dimension: "entry", title: "Entry pages", keyLabel: "Path" },
			{ dimension: "picture", title: "Top pictures", keyLabel: "Slug" },
			{ dimension: "keyword", title: "Keywords", keyLabel: "From links" },
		],
		sources: [
			{ dimension: "referrer", title: "Referrers", keyLabel: "Site", formatKey: direct },
			{ dimension: "utmSource", title: "UTM source" },
			{ dimension: "utmMedium", title: "UTM medium" },
			{ dimension: "utmCampaign", title: "UTM campaign" },
		],
		audience: [
			{ dimension: "device", title: "Devices" },
			{ dimension: "browser", title: "Browsers" },
			{ dimension: "os", title: "Operating systems" },
			{ dimension: "screen", title: "Screen widths", keyLabel: "px" },
			{ dimension: "lang", title: "Languages" },
			{ dimension: "country", title: "Countries", hideIfEmpty: true },
		],
	};
</script>

<div class="traffic-page">
	<div class="title">Traffic</div>

	<div class="range-bar">
		<label>
			Range
			<select value={rangeKey} onchange={(e) => selectRange(e.currentTarget.value as TrafficRangeKey)}>
				{#each RANGES as r (r.key)}
					<option value={r.key}>Last {r.label}</option>
				{/each}
			</select>
		</label>
		<button class="refresh" title="Refresh" onclick={() => refreshCount++}>↻</button>
	</div>

	<Tabs {tabs} active={activeTab} onselect={selectTab} />

	<div
		class="tab-panel"
		id="tab-panel"
		role="tabpanel"
		aria-labelledby="tab-{activeTab}"
	>
		{#if activeTab === "overview"}
			<TrafficOverviewTab {range} {interval} />
		{:else}
			{#key activeTab}
				<TrafficBreakdownTab {range} sections={sections[activeTab]} />
			{/key}
		{/if}
	</div>

	<div class="menu-wrap">
		<Menu />
	</div>
</div>

<style lang="scss">
	// Same frame as Admin: title, controls, tabs and menu stay put while the
	// tab panel scrolls.
	.traffic-page {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}

	.title {
		font-size: 2rem;
		font-weight: bold;
		text-align: center;
		margin: 1rem auto 0.5rem;
		flex: none;
	}

	.range-bar {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
		font-size: 0.85rem;
		flex: none;

		select {
			margin-left: 0.35rem;
		}

		.refresh {
			margin: 0;
			padding: 0.1rem 0.5rem;
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
