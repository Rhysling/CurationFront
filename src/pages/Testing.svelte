<svelte:options runes={true} />

<script lang="ts">
	import { getSecuredValue, getAdminValue } from "../js/db-ops";
	import Menu from "../components/Menu.svelte";

	import ButtonStart from "../components/buttons/ButtonStart.svelte";
	import ButtonLeft from "../components/buttons/ButtonLeft.svelte";
	import ButtonRight from "../components/buttons/ButtonRight.svelte";
	import ButtonEnd from "../components/buttons/ButtonEnd.svelte";

	let securedValue = $state("Not loaded");
	let adminValue = $state("Not loaded");

	const loadSecuredValue = async () => {
		try {
			securedValue = (await getSecuredValue())?.data || "Get failed";
		} catch (error) {
			securedValue = "Error loading secured value";
		}
	};

	const loadAdminValue = async () => {
		try {
			adminValue = (await getAdminValue())?.data || "Get failed";
		} catch (error) {
			adminValue = "Error loading secured value";
		}
	};

	const foo = () => {
		alert("Foo!");
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

<div class="arrows">
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<button title="foo" class="" onclick={() => {}} disabled={false}>
		<svg
			fill="currentColor"
			viewBox="0 0 24 24"
			stroke="currentColor"
			version="1.1"
			id="svg-L2"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="m 9.4655179,5.3408093 a 1,1 0 0 1 0.7070011,1.707 l -4.9500021,4.9500007 4.9500021,4.95 a 1,1 0 0 1 -1.4140021,1.414 l -5.6569991,-5.657 a 1,1 0 0 1 0,-1.414 L 8.7585169,5.6338093 a 1,1 0 0 1 0.707001,-0.293 z"
				transform-origin="center"
				id="path1"
			/>
			<path
				d="m 20.422304,5.3408187 a 1,1 0 0 1 0.707,1.707 l -4.950001,4.9499993 4.950001,4.95 a 1,1 0 0 1 -1.414001,1.414 l -5.656999,-5.657 a 1,1 0 0 1 0,-1.414 l 5.656999,-5.6569993 a 1,1 0 0 1 0.707001,-0.293 z"
				transform-origin="center"
				id="path1-8"
			/>
		</svg>
	</button>

	<button title="foo" class="" onclick={() => {}} disabled={false}>
		<svg
			fill="currentColor"
			viewBox="0 0 24 24"
			stroke="currentColor"
			version="1.1"
			id="svg-L1"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="m 14.824643,5.3408183 a 1,1 0 0 1 0.707,1.707 l -4.950001,4.9499997 4.950001,4.95 a 1,1 0 0 1 -1.414001,1.414 l -5.6569991,-5.657 a 1,1 0 0 1 0,-1.414 L 14.117642,5.6338183 a 1,1 0 0 1 0.707001,-0.293 z"
				transform-origin="center"
				id="path1"
			/>
		</svg>
	</button>

	<button title="foo" class="" onclick={() => {}} disabled={false}>
		<svg
			fill="currentColor"
			viewBox="0 0 24 24"
			stroke="currentColor"
			version="1.1"
			id="svg-R1"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="m 14.824643,5.3408183 a 1,1 0 0 1 0.707,1.707 l -4.950001,4.9499997 4.950001,4.95 a 1,1 0 0 1 -1.414001,1.414 l -5.6569991,-5.657 a 1,1 0 0 1 0,-1.414 L 14.117642,5.6338183 a 1,1 0 0 1 0.707001,-0.293 z"
				transform-origin="center"
				transform="rotate(180)"
				id="path1"
			/>
		</svg>
	</button>

	<button title="foo" class="" onclick={() => {}} disabled={false}>
		<svg
			fill="currentColor"
			viewBox="0 0 24 24"
			stroke="currentColor"
			version="1.1"
			id="svg-R2"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="m 9.4655179,5.3408093 a 1,1 0 0 1 0.7070011,1.707 l -4.9500021,4.9500007 4.9500021,4.95 a 1,1 0 0 1 -1.4140021,1.414 l -5.6569991,-5.657 a 1,1 0 0 1 0,-1.414 L 8.7585169,5.6338093 a 1,1 0 0 1 0.707001,-0.293 z"
				transform-origin="center"
				transform="rotate(180)"
				id="path1"
			/>
			<path
				d="m 20.422304,5.3408187 a 1,1 0 0 1 0.707,1.707 l -4.950001,4.9499993 4.950001,4.95 a 1,1 0 0 1 -1.414001,1.414 l -5.656999,-5.657 a 1,1 0 0 1 0,-1.414 l 5.656999,-5.6569993 a 1,1 0 0 1 0.707001,-0.293 z"
				transform-origin="center"
				transform="rotate(180)"
				id="path1-8"
			/>
		</svg>
	</button>
</div>
<div class="imports">
	<span>Imports:</span>
	<ButtonStart onclick={foo} />
	<ButtonLeft onclick={foo} />
	<ButtonRight onclick={foo} />
	<ButtonEnd onclick={foo} />
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

	.arrows {
		max-width: 600px;
		margin: 2rem auto;

		button {
			padding: 0;
			margin: 1rem;
			width: 3rem;
			height: 3rem;
		}
	}

	.imports {
		max-width: 600px;
		margin: 2rem auto;
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
