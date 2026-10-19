<svelte:options runes={true} />

<script lang="ts">
	let {
		isOpen = $bindable(false),
		disableHideModal = false,
		children = null,
	} = $props();

	const hideModal = () => {
		if (!disableHideModal) isOpen = false;
	};

	// Listen on the window so Escape works wherever focus is, not only inside the modal.
	const onWindowKeydown = (e: KeyboardEvent) => {
		if (isOpen && e.key === "Escape") hideModal();
	};
</script>

<svelte:window onkeydown={onWindowKeydown} />

<!-- Escape is handled on the window, so these click targets need no key handlers. -->
<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
<div
	class="modal"
	onclick={hideModal}
	style="display:{isOpen ? 'flex' : 'none'}"
>
	{#if !disableHideModal}
		<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
		<span class="close" onclick={hideModal} title="close">X</span>
	{/if}
	<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
	<div class="content" onclick={(e) => e.stopPropagation()}>
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
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-width: 400px;
		min-height: 200px;
		max-width: 90vw;
		max-height: 90vh;
	}
</style>
