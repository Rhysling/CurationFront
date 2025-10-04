<svelte:options runes={true} />

<script lang="ts">
	let { isOpen = $bindable(false), children } = $props();

	const hideModal = () => (isOpen = false);

	const hideModalKey = (e: KeyboardEvent) => {
		const code = e.code;
		alert(code);
	};
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="modal"
	onclick={hideModal}
	onkeyup={(e) => hideModalKey(e)}
	style="display:{isOpen ? 'flex' : 'none'}"
>
	<span
		class="close"
		onclick={hideModal}
		onkeyup={(e) => hideModalKey(e)}
		title="close">X</span
	>
	<div
		class="content"
		onclick={(e) => e.stopPropagation()}
		onkeyup={(e) => e.stopPropagation()}
	>
		{#if children}
			{@render children()}
		{:else}
			fallback content
		{/if}
	</div>
</div>

<style lang="scss">
	@use "../styles/_custom-variables" as c;

	.modal {
		position: fixed;
		z-index: 100;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		overflow: auto;
		background-color: rgba(0, 0, 0, 0.4);
		justify-content: center;
		align-items: center;
	}

	.close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: block;
		padding: 0.2rem 0.5rem;
		color: white;
		font-size: 2rem;
		font-weight: bold;
		border: 2px solid white;
		border-radius: 2px;
		z-index: 110;

		&:hover,
		&:focus {
			color: white;
			text-decoration: none;
			cursor: pointer;
		}
	}

	.content {
		min-width: 400px;
		min-height: 200px;
		max-width: 80vw;
		max-height: 80vh;
	}
</style>
