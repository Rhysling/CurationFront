<svelte:options runes={true} />

<script lang="ts" generics="K extends string">
	// Folder-style tab row. The page owns the active key (usually from the `tab`
	// query param) and renders the matching panel with id={panelId}.
	type Props = {
		tabs: readonly { key: K; label: string }[];
		active: K;
		onselect: (key: K) => void;
		panelId?: string;
	};

	let { tabs, active, onselect, panelId = "tab-panel" }: Props = $props();
</script>

<div class="tabs" role="tablist">
	{#each tabs as tab (tab.key)}
		<button
			role="tab"
			id="tab-{tab.key}"
			class:active={tab.key === active}
			aria-selected={tab.key === active}
			aria-controls={panelId}
			onclick={() => onselect(tab.key)}>{tab.label}</button
		>
	{/each}
</div>

<style lang="scss">
	@use "../styles/custom-variables" as c;

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
		border-bottom: 3px solid var(--main-color);
		flex: none;

		button {
			margin: 0;
			padding: 0.4rem 1rem;
			color: var(--main-color);
			background-color: var(--light-background);
			border: 1px solid var(--main-color);
			border-bottom: none;
			border-radius: 6px 6px 0 0;
			font-weight: normal;

			&:hover {
				color: var(--main-darker);
				background-color: hsl(from var(--main-lightest) h s calc(l + 15));
			}

			// Show the focus ring for keyboard use only, not after a click
			&:focus:not(:focus-visible) {
				outline: none;
			}

			&.active,
			&.active:hover {
				color: #fff;
				background-color: var(--main-color);
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
</style>
