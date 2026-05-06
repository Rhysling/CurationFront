<svelte:options runes={true} />

<script lang="ts">
	import { getPicBySlug } from "../js/db-ops";
	import { pageState } from "../stores/route-store.svelte";

	const slug: string | undefined = pageState.paramObj.p;
	let pic: PictureItem | undefined = $state();
	let fileName: string | undefined = $derived(pic?.fileName);

	const getPic = async (slug: string) => {
		pic = (await getPicBySlug(slug))?.data;
	};

	if (slug) getPic(slug);

	let modalOpen = $state(false);
	let isDoubleSize = $state(false);
	let isDragging = $state(false);
	let offsetX = $state(0);
	let offsetY = $state(0);
	let dragStartX = 0;
	let dragStartY = 0;

	function openModal() {
		modalOpen = true;
		isDoubleSize = false;
		offsetX = 0;
		offsetY = 0;
	}

	function closeModal() {
		modalOpen = false;
		isDragging = false;
	}

	function toggleSize() {
		isDoubleSize = !isDoubleSize;
		offsetX = 0;
		offsetY = 0;
	}

	function onMouseDown(e: MouseEvent) {
		isDragging = true;
		dragStartX = e.clientX - offsetX;
		dragStartY = e.clientY - offsetY;
		e.preventDefault();
	}

	function onMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		offsetX = e.clientX - dragStartX;
		offsetY = e.clientY - dragStartY;
	}

	function onMouseUp() {
		isDragging = false;
	}

	function onTouchStart(e: TouchEvent) {
		if (e.touches.length !== 1) return;
		isDragging = true;
		dragStartX = e.touches[0].clientX - offsetX;
		dragStartY = e.touches[0].clientY - offsetY;
	}

	function onTouchMove(e: TouchEvent) {
		if (!isDragging || e.touches.length !== 1) return;
		offsetX = e.touches[0].clientX - dragStartX;
		offsetY = e.touches[0].clientY - dragStartY;
		e.preventDefault();
	}

	function onTouchEnd() {
		isDragging = false;
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === "Escape") closeModal();
	}

	function onOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) closeModal();
	}
</script>

<svelte:window onkeydown={onKeyDown} onmousemove={onMouseMove} onmouseup={onMouseUp} />

<div class="pic-container">
	{#if fileName}
		<button class="zoom-btn" onclick={openModal} title="Click to enlarge">
			<img
				src={"./pics/" + fileName}
				title={pic?.description}
				alt={pic?.description}
			/>
		</button>
	{:else}
		<div class="not-found">Picture Not Found</div>
	{/if}
</div>

{#if pic?.description}
	<div class="description">
		{pic.description}
	</div>
{/if}

<div class="to-curation">
	<a href={fileName ? "/curation?p=" + slug : "/curation"}>Go to Curation</a>
</div>

{#if modalOpen && fileName}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={onOverlayClick} role="dialog" aria-modal="true" tabindex="-1">
		<div class="modal-controls">
			<button class="btn-size" onclick={toggleSize} title={isDoubleSize ? "Restore size" : "Double size"}>
				{isDoubleSize ? "1×" : "2×"}
			</button>
			<button class="btn-close" onclick={closeModal} title="Close">✕</button>
		</div>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<img
			src={"./pics/" + fileName}
			alt={pic?.description}
			class="modal-image"
			class:dragging={isDragging}
			style="transform: translate({offsetX}px, {offsetY}px) scale({isDoubleSize ? 2 : 1});"
			onmousedown={onMouseDown}
			ontouchstart={onTouchStart}
			ontouchmove={onTouchMove}
			ontouchend={onTouchEnd}
			draggable="false"
		/>
	</div>
{/if}

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.pic-container {
		display: flex;
		flex-flow: column nowrap;
		justify-content: center;
		align-items: center;
		border: 3px solid c.$main-color;
		border-radius: 1rem;
		background-color: white;
		max-width: min(800px, 92vw);
		max-height: 80vh;
		margin: 1.5rem auto;
		padding: 1rem;

		.zoom-btn {
			display: block;
			width: 100%;
			padding: 0;
			border: none;
			background: none;
			cursor: zoom-in;
		}

		img {
			display: block;
			width: 100%;
			max-height: 75vh;
			object-fit: contain;
		}
	}

	.description {
		text-align: center;
		font-size: 2rem;
		font-weight: bold;
	}

	.not-found {
		font-size: 3rem;
		font-weight: bold;
	}

	.to-curation {
		text-align: center;
		margin: 1rem auto;
	}

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.88);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		overflow: hidden;
	}

	.modal-controls {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		display: flex;
		gap: 0.5rem;
		z-index: 1001;

		button {
			width: 2.75rem;
			height: 2.75rem;
			border: none;
			border-radius: 50%;
			background: rgba(255, 255, 255, 0.9);
			color: #222;
			cursor: pointer;
			font-size: 1.1rem;
			font-weight: bold;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: background 0.15s;

			&:hover {
				background: white;
			}
		}
	}

	.modal-image {
		max-width: 90vw;
		max-height: 85vh;
		object-fit: contain;
		cursor: grab;
		user-select: none;
		transition: transform 0.2s ease;

		&.dragging {
			cursor: grabbing;
			transition: none;
		}
	}

	@media only screen and (height <= 700px) {
		.pic-container {
			margin: 0.5rem auto;
		}

		.description {
			font-size: 1.5rem;
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
