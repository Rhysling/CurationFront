<svelte:options runes={true} />

<script lang="ts">
	// A grid of ranked breakdowns, one per section. Used for the Content,
	// Sources and Audience tabs.
	import { getTrafficBreakdown } from "../../js/db-traffic-ops";
	import BarList from "./BarList.svelte";
	import type { BreakdownSection } from "./traffic-format";

	type Props = { range: TrafficRange; sections: BreakdownSection[] };

	let { range, sections }: Props = $props();

	let data: Partial<Record<TrafficDimension, TrafficBreakdownRow[]>> = $state({});
	let loadToken = 0;

	const load = async (r: TrafficRange) => {
		const token = ++loadToken;
		data = {};
		const results = await Promise.all(sections.map((s) => getTrafficBreakdown(r, s.dimension)));
		if (token !== loadToken) return; // a newer range won

		const next: typeof data = {};
		sections.forEach((s, i) => (next[s.dimension] = results[i] ?? []));
		data = next;

		if (results.some((r) => r === undefined)) alert("Failed to load some traffic data. Please try again.");
	};

	$effect(() => {
		load(range);
	});

	let visible = $derived(
		sections.filter((s) => !s.hideIfEmpty || data[s.dimension] === undefined || data[s.dimension]!.length > 0),
	);
</script>

<div class="grid">
	{#each visible as s (s.dimension)}
		<BarList title={s.title} keyLabel={s.keyLabel} formatKey={s.formatKey} rows={data[s.dimension]} />
	{/each}
</div>

<style lang="scss">
	@use "../../styles/custom-variables" as c;

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 0.75rem;
		max-width: 1000px;
		margin: 1rem auto;

		@media only screen and (width <= c.$bp-small) {
			grid-template-columns: 1fr;
		}
	}
</style>
