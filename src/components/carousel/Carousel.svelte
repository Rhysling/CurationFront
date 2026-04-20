<script lang="ts" generics="Slide">
	import { cubicOut } from "svelte/easing";
	import type { CarouselProps, CarouselSnippets } from "./carousel-types.js";

	let {
		slides = [],
		key = undefined,
		containerClass = "",
		slideClass = "",
		slide: slideSnippet,
		prev: prevSnippet,
		next: nextSnippet,
		dots: dotsSnippet,
		pagination: paginationSnippet,
	}: CarouselProps<Slide> & CarouselSnippets<Slide> = $props();

	let currentIndex = $state(0);
	let direction = $state(1);
	let stage: HTMLElement | undefined = $state();

	let dragStartX = 0;
	let dragging = false;

	export const next = () => {
		if (currentIndex < slides.length - 1) {
			direction = 1;
			currentIndex++;
		}
	};

	export const prev = () => {
		if (currentIndex > 0) {
			direction = -1;
			currentIndex--;
		}
	};

	export const goTo = (index: number) => {
		const clamped = Math.max(0, Math.min(slides.length - 1, index));
		direction = clamped >= currentIndex ? 1 : -1;
		currentIndex = clamped;
	};

	export const getCurrentSlide = () => currentIndex;

	const canScrollNext = $derived(currentIndex < slides.length - 1);
	const canScrollPrev = $derived(currentIndex > 0);
	const dots = $derived(
		slides.map((_, i) => ({ active: i === currentIndex, index: i })),
	);

	// Entering slide: translate in from off-screen, stays in normal flow to provide height.
	function slideIn(node: HTMLElement, { dir }: { dir: number }) {
		const w = stage?.clientWidth ?? node.clientWidth ?? 800;
		return {
			duration: 280,
			easing: cubicOut,
			css: (t: number, u: number) => `transform: translateX(${dir * u * w}px)`,
		};
	}

	// Exiting slide: translate out, switched to absolute so it doesn't affect layout height.
	function slideOut(node: HTMLElement, { dir }: { dir: number }) {
		const w = stage?.clientWidth ?? node.clientWidth ?? 800;
		return {
			duration: 280,
			easing: cubicOut,
			css: (_t: number, u: number) => `
				position: absolute;
				inset: 0;
				transform: translateX(${dir * u * w}px);
			`,
		};
	}

	const onPointerDown = (e: PointerEvent) => {
		if ((e.target as HTMLElement).closest("a")) return;
		dragStartX = e.clientX;
		dragging = true;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	};

	const onPointerUp = (e: PointerEvent) => {
		if (!dragging) return;
		dragging = false;
		const delta = e.clientX - dragStartX;
		if (Math.abs(delta) > 50) delta < 0 ? next() : prev();
	};

	const onKeydown = (e: KeyboardEvent) => {
		if (e.key === "ArrowRight") {
			e.preventDefault();
			next();
		}
		if (e.key === "ArrowLeft") {
			e.preventDefault();
			prev();
		}
	};
</script>

<svelte:window onkeydown={onKeydown} />

{#if slides.length > 0}
	<div class="c2-root {containerClass}" aria-roledescription="carousel">
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="c2-stage"
			bind:this={stage}
			onpointerdown={onPointerDown}
			onpointerup={onPointerUp}
			onpointercancel={() => {
				dragging = false;
			}}
			role="region"
			aria-label="Slide {currentIndex + 1} of {slides.length}"
		>
			{#key currentIndex}
				<div
					class="c2-slide {slideClass}"
					aria-label="Slide {currentIndex + 1} of {slides.length}"
					aria-roledescription="slide"
					in:slideIn={{ dir: direction }}
					out:slideOut={{ dir: -direction }}
				>
					{@render slideSnippet({
						slide: slides[currentIndex],
						index: currentIndex,
					})}
				</div>
			{/key}
		</div>

		{@render dotsSnippet?.({ dots, scrollTo: (i) => goTo(i) })}
		{@render paginationSnippet?.({ canScrollPrev, prev, canScrollNext, next })}
		{@render prevSnippet?.({ canScrollPrev, prev })}
		{@render nextSnippet?.({ canScrollNext, next })}
	</div>
{/if}

<style>
	.c2-root {
		position: relative;
		container-type: inline-size;
	}

	.c2-stage {
		position: relative;
		overflow: hidden;
		cursor: grab;
		touch-action: pan-y;
		user-select: none;
	}

	.c2-stage:active {
		cursor: grabbing;
	}

	.c2-slide {
		width: 100%;
		will-change: transform;
	}

	/* Prevent images (and any other replaced elements) from overflowing the stage
	.c2-slide :global(img),
	.c2-slide :global(video) {
		display: block;
		max-width: 100%;
		max-height: 100%;
		height: auto;
		object-fit: contain;
	}
	*/
</style>
