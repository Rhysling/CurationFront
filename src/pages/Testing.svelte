<svelte:options runes={true} />

<script lang="ts">
	import { getSecuredValue, getAdminValue } from "../js/db-ops";
	import Menu from "../components/Menu.svelte";

	let securedValue = $state("Not loaded");
	let adminValue = $state("Not loaded");

	let loadSecuredValue = async () => {
		try {
			securedValue = (await getSecuredValue())?.data || "Get failed";
		} catch (error) {
			securedValue = "Error loading secured value";
		}
	};

	let loadAdminValue = async () => {
		try {
			adminValue = (await getAdminValue())?.data || "Get failed";
		} catch (error) {
			adminValue = "Error loading secured value";
		}
	};
</script>

<div class="mix">Testing Here</div>
<div class="test">
	<div>Admin value:</div>
	<div>{adminValue}</div>
	<div>
		<button onclick={loadAdminValue}>Go</button>
		<button onclick={() => (adminValue = "Reset")}>Reset</button>
	</div>
</div>

<div class="test">
	<div>Secured value:</div>
	<div>{securedValue}</div>
	<div>
		<button onclick={loadSecuredValue}>Go</button>
		<button onclick={() => (securedValue = "Reset")}>Reset</button>
	</div>
</div>
<br />
<br />
<Menu />

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.mix {
		font-size: 3rem;
		font-weight: bold;
		text-align: center;
		margin: 2rem auto;
	}

	.test {
		max-width: 600px;
		margin: 2rem auto;
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
