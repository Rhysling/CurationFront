<svelte:options runes={true} />

<script lang="ts">
	// KPI tile with change vs the previous period. `higherIsBetter = false` (e.g.
	// bounce rate) flips which direction reads as good.
	type Props = {
		label: string;
		value: string;
		current?: number;
		previous?: number;
		higherIsBetter?: boolean;
		hint?: string;
	};

	let { label, value, current, previous, higherIsBetter = true, hint }: Props = $props();

	let delta = $derived.by(() => {
		if (current === undefined || previous === undefined) return null;
		if (previous === 0) return current === 0 ? 0 : null;
		return (current - previous) / previous;
	});

	let tone = $derived(
		delta === null || Math.abs(delta) < 0.005 ? "flat" : (delta > 0) === higherIsBetter ? "good" : "bad",
	);
</script>

<div class="tile" title={hint}>
	<div class="label">{label}</div>
	<div class="value">{value}</div>
	<div class="delta {tone}">
		{#if delta === null}
			&nbsp;
		{:else if tone === "flat"}
			– no change
		{:else}
			{delta > 0 ? "▲" : "▼"} {Math.abs(delta * 100).toFixed(0)}%
			<span class="vs">vs prev.</span>
		{/if}
	</div>
</div>

<style lang="scss">

	.tile {
		background: var(--light-background);
		border: 1px solid var(--main-color);
		border-radius: 0.5rem;
		padding: 0.5rem 0.75rem;
		min-width: 0;
	}

	.label {
		font-size: 0.75rem;
		color: #666;
	}

	.value {
		font-size: 1.4rem;
		font-weight: bold;
		color: var(--body-text);
		font-variant-numeric: tabular-nums;
	}

	.delta {
		font-size: 0.75rem;
		color: #666;

		&.good {
			color: var(--color-success-text);
		}

		&.bad {
			color: var(--color-error-text);
		}

		.vs {
			color: #888;
		}
	}
</style>
