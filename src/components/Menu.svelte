<svelte:options runes={true} />

<script lang="ts">
	import { routes, navTo } from "../stores/route-store.svelte";

	let displayRoutes = $derived(
		(routes.allRoutes.children ?? []).filter((a) => !a.isHidden),
	);
</script>

<div class="menu">
	{#if routes.currentRoute.path !== "/"}
		<button class="button" onclick={(e) => navTo(e, "/")}>{"Home"}</button>
	{/if}
	{#each displayRoutes as route (route.path)}
		<button
			class="button"
			disabled={route.path === routes.currentRoute.path}
			onclick={(e) => navTo(e, route.path)}>{route.title}</button
		>
	{/each}
</div>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.menu {
		margin: 0.5rem auto;
		text-align: center;

		button {
			margin-bottom: 0.5rem;
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
