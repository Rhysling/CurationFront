<svelte:options runes={true} />

<script lang="ts">
	import {
		getRoutes,
		getCurrentRoute,
		navTo,
	} from "../stores/route-store.svelte";
</script>

<div class="menu">
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
</div>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.menu {
		margin: 1rem auto;
		text-align: center;
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
