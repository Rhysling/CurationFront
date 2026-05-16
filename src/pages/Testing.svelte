<svelte:options runes={true} />

<script lang="ts">
	import {
		getSecuredValue,
		getAdminValue,
		getPicPublicList,
	} from "../js/db-ops";
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
			adminValue = "Error loading secured value";
		}
	};

	// *** PicList ***

	let picList: PictureItem[] = [];
	let picListDisplay: PictureItem[] = $state([]);
	let ix = $state(0);
	let txt = $state("Foo");

	const loadPicList = async () => {
		try {
			picList = (await getPicPublicList()) || [];
			picListDisplay = picList.slice(0, 10);
		} catch (error) {
			console.error("Error loading picture list", error);
		}
	};

	const addText = () => {
		if (ix >= 0 && ix < picListDisplay.length) {
			picListDisplay[ix].fileName += `- ${txt}`;
		}
	};
</script>

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

<div class="list-experiment">
	<div class="title">Pic List</div>
	<div>
		{#if picListDisplay.length === 0}
			<div>No pics loaded</div>
		{:else}
			<ul>
				{#each picListDisplay as pic}
					<li>{pic.fileName}</li>
				{/each}
			</ul>
		{/if}
	</div>
	<div class="buttons">
		<button onclick={loadPicList}>Load Pics</button> x
		<input
			type="number"
			min="0"
			max={picListDisplay.length - 1}
			bind:value={ix}
		/>
		<input type="text" bind:value={txt} placeholder="Text to add" />
		<button onclick={addText}>Add Text</button>
	</div>
</div>

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
		margin: 1rem auto;

		.title {
			font-weight: bold;
		}
	}

	.list-experiment {
		max-width: 600px;
		margin: 2rem auto;
		border: 3px solid c.$main-color;
		border-radius: 0.5rem;
		padding: 0.5rem;

		.title {
			font-size: 1.5rem;
			font-weight: bold;
			text-align: center;
			margin-bottom: 0.5rem;
		}

		ul {
			list-style: none;
			padding: 0;
			margin: 0;

			li {
				padding: 0.25rem 0;
				border-bottom: 1px solid c.$light-background;
			}
		}

		.buttons {
			text-align: center;
			margin-top: 1rem;
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
