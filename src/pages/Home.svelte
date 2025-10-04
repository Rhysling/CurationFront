<svelte:options runes={true} />

<script lang="ts">
	import Menu from "../components/Menu.svelte";

	import {
		getRoutes,
		getCurrentRoute,
		navTo,
	} from "../stores/route-store.svelte";
</script>

<div class="hero-box">
	<div class="hero">
		<img src="assets/img/PolsonLogo_900x400.png" alt="Polson Company" />
		<hr />
		<p class="contact">
			Contact: <a href="mailto:rkummer@polson.com?subject=Polson">Bob Kummer</a>
		</p>
	</div>
</div>

<Menu />

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.hero-box {
		margin: 1rem auto;
		padding: 2rem 2rem 1rem;
		max-width: 980px;
	}

	.hero {
		text-align: center;
		padding: 2rem;
		background-color: #fff;
		border-radius: 16px;
		border: 1px solid rgba(0, 0, 0, 0.2);
		box-shadow: 0 1px 12px 0 rgba(0, 0, 0, 0.5);

		p {
			margin: 1rem 0 0;
			font-size: 1.25rem;
			font-weight: bold;
			color: c.$dark-text;
		}
	}

	@media only screen and (width <= c.$bp-small) {
		.hero {
			padding: 1rem;
			border-radius: 10px;
		}
	}
</style>
