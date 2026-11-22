<svelte:options runes={true} />

<script lang="ts">
	// Hand-rolled SVG line chart: one y-axis (all series share a unit), recessive
	// grid, legend + end-of-line labels, crosshair tooltip on hover.
	type Series = { key: string; label: string; color: string };

	type Props = {
		points: TrafficPoint[];
		series: Series[];
		interval: TrafficInterval;
		height?: number;
	};

	let { points, series, interval, height = 220 }: Props = $props();

	let width = $state(600);
	let hoverIx: number | null = $state(null);

	const pad = { top: 12, right: 72, bottom: 26, left: 40 };

	let plotW = $derived(Math.max(10, width - pad.left - pad.right));
	let plotH = $derived(height - pad.top - pad.bottom);

	const valueOf = (p: TrafficPoint, key: string) => (p as unknown as Record<string, number>)[key] ?? 0;

	// "Nice" max and ticks so gridlines land on round numbers.
	let maxRaw = $derived(
		Math.max(1, ...points.flatMap((p) => series.map((s) => valueOf(p, s.key)))),
	);
	let yTicks = $derived.by(() => {
		const rough = maxRaw / 4;
		const mag = Math.pow(10, Math.floor(Math.log10(rough)));
		const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= rough) ?? rough;
		const ticks: number[] = [];
		for (let v = 0; v <= maxRaw + step * 0.001; v += step) ticks.push(Math.round(v));
		if (ticks[ticks.length - 1] < maxRaw) ticks.push(ticks[ticks.length - 1] + step);
		return ticks;
	});
	let yMax = $derived(yTicks[yTicks.length - 1] || 1);

	const x = (i: number) =>
		pad.left + (points.length <= 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
	const y = (v: number) => pad.top + plotH - (v / yMax) * plotH;

	const pathFor = (key: string) =>
		points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(valueOf(p, key)).toFixed(1)}`).join("");

	const fmtTick = (t: number) => {
		const d = new Date(t);
		if (interval === "hour") return d.toLocaleTimeString(undefined, { hour: "numeric" });
		if (interval === "month") return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
		return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
	};
	const fmtFull = (t: number) => {
		const d = new Date(t);
		if (interval === "hour")
			return d.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
		if (interval === "month") return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
		return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
	};

	// About one x label per 80px.
	let xLabelIxs = $derived.by(() => {
		const n = points.length;
		if (!n) return [];
		const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(plotW / 80))));
		const ixs: number[] = [];
		for (let i = 0; i < n; i += every) ixs.push(i);
		return ixs;
	});

	const onMove = (e: PointerEvent) => {
		if (!points.length) return;
		const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect();
		const rel = (e.clientX - rect.left) / rect.width;
		hoverIx = Math.min(points.length - 1, Math.max(0, Math.round(rel * (points.length - 1))));
	};

	let tipLeft = $derived(hoverIx === null ? 0 : x(hoverIx));
	let tipFlip = $derived(tipLeft > width * 0.6);
</script>

<div class="chart">
	<div class="legend">
		{#each series as s (s.key)}
			<span class="item"><span class="swatch" style:background-color={s.color}></span>{s.label}</span>
		{/each}
	</div>

	<div class="plot" bind:clientWidth={width} style:height="{height}px">
		<svg {width} {height} role="img" aria-label={series.map((s) => s.label).join(" and ") + " over time"}>
			{#each yTicks as t (t)}
				<line class="grid" x1={pad.left} x2={pad.left + plotW} y1={y(t)} y2={y(t)} />
				<text class="axis" x={pad.left - 6} y={y(t)} text-anchor="end" dominant-baseline="middle"
					>{t.toLocaleString()}</text
				>
			{/each}

			{#each xLabelIxs as i (i)}
				<text class="axis" x={x(i)} y={height - 8} text-anchor="middle">{fmtTick(points[i].t)}</text>
			{/each}

			{#each series as s (s.key)}
				<path d={pathFor(s.key)} fill="none" stroke={s.color} stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
			{/each}

			<!-- Direct labels at the end of each line -->
			{#if points.length}
				{#each series as s (s.key)}
					<text class="end-label" x={x(points.length - 1) + 8} y={y(valueOf(points[points.length - 1], s.key))} dominant-baseline="middle"
						>{s.label}</text
					>
				{/each}
			{/if}

			{#if hoverIx !== null}
				<line class="crosshair" x1={x(hoverIx)} x2={x(hoverIx)} y1={pad.top} y2={pad.top + plotH} />
				{#each series as s (s.key)}
					<circle cx={x(hoverIx)} cy={y(valueOf(points[hoverIx], s.key))} r="4" fill={s.color} stroke="#fff" stroke-width="2" />
				{/each}
			{/if}

			<rect
				class="hit"
				x={pad.left}
				y={pad.top}
				width={plotW}
				height={plotH}
				role="presentation"
				onpointermove={onMove}
				onpointerleave={() => (hoverIx = null)}
			/>
		</svg>

		{#if hoverIx !== null}
			<div class="tooltip" class:flip={tipFlip} style:left="{tipLeft}px">
				<div class="tip-title">{fmtFull(points[hoverIx].t)}</div>
				{#each series as s (s.key)}
					<div class="tip-row">
						<span class="swatch" style:background-color={s.color}></span>
						<span>{s.label}</span>
						<span class="tip-val">{valueOf(points[hoverIx], s.key).toLocaleString()}</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	@use "../../styles/custom-variables" as c;

	.chart {
		width: 100%;
	}

	.legend {
		display: flex;
		gap: 1rem;
		font-size: 0.8rem;
		color: c.$body-text;
		margin-bottom: 0.25rem;

		.item {
			display: inline-flex;
			align-items: center;
			gap: 0.35rem;
		}
	}

	.swatch {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 2px;
	}

	.plot {
		position: relative;
		width: 100%;
	}

	svg {
		display: block;
		overflow: visible;
	}

	.grid {
		stroke: #e3e3e3;
		stroke-width: 1;
	}

	.axis {
		font-size: 10px;
		fill: #777;
	}

	.end-label {
		font-size: 11px;
		fill: c.$body-text;
	}

	.crosshair {
		stroke: #999;
		stroke-width: 1;
		stroke-dasharray: 3 3;
	}

	.hit {
		fill: transparent;
		cursor: crosshair;
	}

	.tooltip {
		position: absolute;
		top: 0;
		transform: translateX(12px);
		pointer-events: none;
		background: c.$light-background;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-shadow: 0 2px 6px rgb(0 0 0 / 0.15);
		padding: 0.35rem 0.5rem;
		font-size: 0.75rem;
		white-space: nowrap;
		color: c.$body-text;

		&.flip {
			transform: translateX(calc(-100% - 12px));
		}

		.tip-title {
			font-weight: bold;
			margin-bottom: 0.2rem;
		}

		.tip-row {
			display: flex;
			align-items: center;
			gap: 0.35rem;
		}

		.tip-val {
			margin-left: auto;
			padding-left: 0.75rem;
			font-variant-numeric: tabular-nums;
		}
	}
</style>
