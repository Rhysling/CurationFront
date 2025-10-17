<svelte:options runes={true} />

<script lang="ts">
	import {
		getRoutes,
		getCurrentRoute,
		navTo,
	} from "../stores/route-store.svelte";
	import { user } from "../stores/user-store.svelte";

	import ButtonStart from "../components/buttons/ButtonStart.svelte";
	import ButtonEnd from "../components/buttons/ButtonEnd.svelte";

	let {
		gotoSlideIx = () => {},
		slideCount = 0,
	}: {
		gotoSlideIx?: (ix: number) => void;
		slideCount?: number;
	} = $props();
</script>

<div class="menu">
	{#if !user.value.isAdmin && getCurrentRoute().path == "/curation"}
		<ButtonStart onclick={() => gotoSlideIx(0)} />
		<ButtonEnd onclick={() => gotoSlideIx(slideCount - 1)} />
	{:else}
		{#if getCurrentRoute().path !== "/"}
			<button class="button" onclick={(e) => navTo(e, "/")}>{"Home"}</button>
		{/if}
		{#each getRoutes().children ?? [] as route (route.path)}
			<button
				class="button"
				disabled={route.path === getCurrentRoute().path}
				onclick={(e) => navTo(e, route.path)}>{route.title}</button
			>
		{/each}
	{/if}
</div>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.menu {
		margin: 0.25rem auto;
		text-align: center;

		button {
			margin-bottom: 0.5rem;
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
