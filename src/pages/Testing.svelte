<svelte:options runes={true} />

<script lang="ts">
	import Menu from "../components/Menu.svelte";
</script>

<div class="mix">Testing Here</div>

<Menu />

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.mix {
		font-size: 3rem;
		font-weight: bold;
		text-align: center;
		margin: 2rem auto;
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
