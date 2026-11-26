<svelte:options runes={true} />

<script lang="ts">
	import {
		getTrafficSummary,
		getTrafficTimeSeries,
		getTrafficRealtime,
	} from "../../js/db-traffic-ops";
	import StatTile from "./StatTile.svelte";
	import LineChart from "./LineChart.svelte";
	import { fmtInt, fmtPct, fmtDuration, fmtRatio } from "./traffic-format";

	type Props = { range: TrafficRange; interval: TrafficInterval };

	let { range, interval }: Props = $props();

	// Validated pair (brand blue + orange): distinct under CVD, ≥3:1 on white.
	const SERIES = [
		{ key: "visitors", label: "Visitors", color: "#006ba6" },
		{ key: "pageviews", label: "Pageviews", color: "#d9730d" },
	];

	let summary: TrafficSummary | undefined = $state();
	let points: TrafficPoint[] | undefined = $state();
	let liveVisitors: number | undefined = $state();
	let loadToken = 0;

	const load = async (r: TrafficRange, iv: TrafficInterval) => {
		const token = ++loadToken;
		summary = undefined;
		points = undefined;
		const [s, p] = await Promise.all([getTrafficSummary(r), getTrafficTimeSeries(r, iv)]);
		if (token !== loadToken) return;
		summary = s;
		points = p ?? [];
		if (!s || !p) alert("Failed to load traffic data. Please try again.");
	};

	$effect(() => {
		load(range, interval);
	});

	// "Now" refreshes once a minute while the tab is open. Failures stay quiet.
	$effect(() => {
		const refresh = async () => {
			liveVisitors = (await getTrafficRealtime())?.visitors;
		};
		refresh();
		const timer = setInterval(refresh, 60_000);
		return () => clearInterval(timer);
	});

	let cur = $derived(summary?.current);
	let prev = $derived(summary?.previous);
	let hasData = $derived(!!points && points.some((p) => p.pageviews > 0));
</script>

<div class="overview">
	<div class="tiles">
		<StatTile
			label="Visitors"
			value={fmtInt(cur?.visitors)}
			current={cur?.visitors}
			previous={prev?.visitors}
			hint="Unique visitors per day, summed: the cookieless ID resets daily, so a person who returns on another day counts again."
		/>
		<StatTile label="Visits" value={fmtInt(cur?.visits)} current={cur?.visits} previous={prev?.visits} />
		<StatTile label="Pageviews" value={fmtInt(cur?.pageviews)} current={cur?.pageviews} previous={prev?.pageviews} />
		<StatTile
			label="Views / visit"
			value={fmtRatio(cur?.pageviews, cur?.visits)}
			current={cur && cur.visits ? cur.pageviews / cur.visits : undefined}
			previous={prev && prev.visits ? prev.pageviews / prev.visits : undefined}
		/>
		<StatTile
			label="Bounce rate"
			value={fmtPct(cur?.bounceRate)}
			current={cur?.bounceRate}
			previous={prev?.bounceRate}
			higherIsBetter={false}
			hint="Visits with only one pageview"
		/>
		<StatTile
			label="Avg visit"
			value={fmtDuration(cur?.avgVisitMs)}
			current={cur?.avgVisitMs}
			previous={prev?.avgVisitMs}
		/>
		<div class="live" title="Visitors in the last 5 minutes">
			<span class="dot"></span>
			<span><b>{fmtInt(liveVisitors)}</b> now</span>
		</div>
	</div>

	<div class="chart-box">
		{#if points === undefined}
			<div class="empty">Loading…</div>
		{:else if !hasData}
			<div class="empty">No data for this range</div>
		{:else}
			<LineChart {points} series={SERIES} {interval} />
		{/if}
	</div>
</div>

<style lang="scss">

	.overview {
		max-width: 1000px;
		margin: 1rem auto;
	}

	.tiles {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 0.75rem;
	}

	.live {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		font-size: 0.9rem;
		border: 1px dashed var(--main-color);
		border-radius: 0.5rem;
		background: var(--light-background);

		.dot {
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: var(--color-success);
		}
	}

	.chart-box {
		margin-top: 0.75rem;
		background: var(--light-background);
		border: 1px solid var(--main-color);
		border-radius: 0.5rem;
		padding: 0.75rem;
	}

	.empty {
		color: #888;
		text-align: center;
		padding: 3rem 0;
	}
</style>
