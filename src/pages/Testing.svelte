<svelte:options runes={true} />

<script lang="ts">
	import { getSecuredValue, getAdminValue } from "../js/db-ops";
	import Menu from "../components/Menu.svelte";

	let securedValue = $state("Not loaded");
	let adminValue = $state("Not loaded");

	const loadSecuredValue = async () => {
		try {
			securedValue = (await getSecuredValue()) || "Get failed";
		} catch (error) {
			securedValue = "Error loading secured value";
		}
	};

	const loadAdminValue = async () => {
		try {
			adminValue = (await getAdminValue()) || "Get failed";
		} catch (error) {
			adminValue = "Error loading admin value";
		}
	};
</script>

<div class="testing-page">
	<div class="mix">Testing Here</div>
	<div class="test">
		<div class="title">Admin value:</div>
		<div>{adminValue}</div>
		<div>
			<button onclick={loadAdminValue}>Go</button>
			<button onclick={() => (adminValue = "Reset")}>Reset</button>
		</div>
	</div>

	<div class="test">
		<div class="title">Secured value:</div>
		<div>{securedValue}</div>
		<div>
			<button onclick={loadSecuredValue}>Go</button>
			<button onclick={() => (securedValue = "Reset")}>Reset</button>
		</div>
	</div>

	<br />
	<Menu />
</div>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	// App's .page clips to the viewport; this page scrolls within it instead
	.testing-page {
		height: 100%;
		overflow-y: auto;
	}

	.mix {
		font-size: 3rem;
		font-weight: bold;
		text-align: center;
		margin: 2rem auto;
	}

	.test {
		max-width: 600px;
		margin: 1rem auto;

		.title {
			font-weight: bold;
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
