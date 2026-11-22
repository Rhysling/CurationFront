<svelte:options runes={true} />

<script lang="ts">
	// Ranked list with a proportional bar behind each row (bar = visitors).
	type Props = {
		title: string;
		rows: TrafficBreakdownRow[] | undefined;
		keyLabel?: string;
		formatKey?: (key: string) => string;
		initialCount?: number;
	};

	let { title, rows, keyLabel = "", formatKey = (k) => k || "(none)", initialCount = 10 }: Props = $props();

	let showAll = $state(false);

	let max = $derived(Math.max(1, ...(rows ?? []).map((r) => r.visitors)));
	let shown = $derived(showAll ? (rows ?? []) : (rows ?? []).slice(0, initialCount));
</script>

<section class="bar-list">
	<div class="head">
		<span class="title">{title}</span>
		<span class="col">{keyLabel}</span>
		<span class="col num">Visitors</span>
		<span class="col num">Views</span>
	</div>

	{#if rows === undefined}
		<div class="empty">Loading…</div>
	{:else if rows.length === 0}
		<div class="empty">No data for this range</div>
	{:else}
		{#each shown as row (row.key)}
			<div class="row" title="{formatKey(row.key)}: {row.visitors.toLocaleString()} visitors, {row.pageviews.toLocaleString()} views">
				<div class="label">
					<span class="bar" style:width="{(row.visitors / max) * 100}%"></span>
					<span class="text">{formatKey(row.key)}</span>
				</div>
				<span class="num">{row.visitors.toLocaleString()}</span>
				<span class="num">{row.pageviews.toLocaleString()}</span>
			</div>
		{/each}
		{#if rows.length > initialCount}
			<button class="more" onclick={() => (showAll = !showAll)}
				>{showAll ? "Show fewer" : `Show all ${rows.length}`}</button
			>
		{/if}
	{/if}
</section>

<style lang="scss">
	@use "sass:color";
	@use "../../styles/custom-variables" as c;

	.bar-list {
		background: c.$light-background;
		border: 1px solid c.$main-color;
		border-radius: 0.5rem;
		padding: 0.5rem 0.75rem;
		font-size: 0.8rem;
		min-width: 0;
	}

	.head,
	.row {
		display: grid;
		grid-template-columns: 1fr 4.5rem 4.5rem;
		gap: 0.5rem;
		align-items: center;
	}

	.head {
		grid-template-columns: auto 1fr 4.5rem 4.5rem;
		font-size: 0.75rem;
		color: #666;
		margin-bottom: 0.35rem;
		white-space: nowrap;

		.col {
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.title {
			font-weight: bold;
			font-size: 0.85rem;
			color: c.$body-text;
		}
	}

	.row {
		padding: 1px 0;
	}

	.label {
		position: relative;
		min-width: 0;
		padding: 0.15rem 0.35rem;

		.bar {
			position: absolute;
			inset: 0 auto 0 0;
			background: color.adjust(c.$main-lightest, $lightness: 18%);
			border-radius: 0 4px 4px 0;
		}

		.text {
			position: relative;
			display: block;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.empty {
		color: #888;
		padding: 0.5rem 0;
		text-align: center;
	}

	.more {
		margin: 0.4rem 0 0;
		font-size: 0.75rem;
		padding: 0.15rem 0.6rem;
	}
</style>
