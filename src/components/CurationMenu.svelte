<svelte:options runes={true} />

<script lang="ts">
	import {
		updateQueryStringParam,
		pageState,
	} from "../stores/route-store.svelte";
	import { getSlug } from "../js/utils";
	import NavButton from "./NavButton.svelte";

	let {
		gotoSlideIx,
		prev,
		next,
		ixSlide,
		slideCount,
		currentPic,
		keyword,
		setKeyword,
		keywordsList = [],
	}: {
		gotoSlideIx: (ix: number) => void;
		prev: () => void;
		next: () => void;
		ixSlide: number;
		slideCount: number;
		currentPic: PictureItem | null;
		keyword: string;
		setKeyword: (kw: string) => void;
		keywordsList?: string[];
	} = $props();

	//let keyword = $state("");
	let keywordInput = $state("");

	// Keyword autocomplete
	const MAX_SUGGESTIONS = 6;
	let showSuggestions = $state(false);
	let ixSuggestion = $state(-1);

	// Prefix matches first, then substring matches; hide when the input is an exact match.
	let suggestions = $derived.by(() => {
		const term = keywordInput.trim().toLowerCase();
		if (!term) return [];
		const starts = keywordsList.filter((kw) => kw.startsWith(term));
		const contains = keywordsList.filter(
			(kw) => !kw.startsWith(term) && kw.includes(term),
		);
		const list = [...starts, ...contains].slice(0, MAX_SUGGESTIONS);
		return list.length === 1 && list[0] === term ? [] : list;
	});

	const applyKeyword = (kw: string) => {
		keywordInput = kw;
		showSuggestions = false;
		ixSuggestion = -1;
		if (kw.trim()) setKeyword(kw.trim());
	};

	const onKeywordKeydown = (e: KeyboardEvent) => {
		const isOpen = showSuggestions && suggestions.length > 0;
		switch (e.key) {
			case "ArrowDown":
				if (!isOpen) return;
				e.preventDefault();
				ixSuggestion = (ixSuggestion + 1) % suggestions.length;
				break;
			case "ArrowUp":
				if (!isOpen) return;
				e.preventDefault();
				ixSuggestion =
					ixSuggestion <= 0 ? suggestions.length - 1 : ixSuggestion - 1;
				break;
			case "Enter":
				e.preventDefault();
				applyKeyword(
					isOpen && ixSuggestion >= 0
						? suggestions[ixSuggestion]
						: keywordInput,
				);
				break;
			case "Escape":
				showSuggestions = false;
				ixSuggestion = -1;
				break;
		}
	};

	const getRandomIx = () => {
		if (slideCount <= 1) return ixSlide;
		let ix;
		do {
			ix = Math.floor(Math.random() * slideCount);
		} while (ix === ixSlide);
		return ix;
	};

	let currentSlug = $derived.by(() =>
		currentPic?.fileName ? getSlug(currentPic.fileName) : "",
	);

	let isFirst = $derived(ixSlide == 0);
	let isLast = $derived(ixSlide == slideCount - 1);

	$effect(() => {
		if (pageState.isNavFromUrl) return;
		if (!currentPic) return;

		updateQueryStringParam("p", getSlug(currentPic.fileName));
	});
</script>

{#if keyword}
	<div class="keyword">
		<span>Keyword: {keyword}</span> -
		<a
			aria-label="Clear Keyword"
			href="/"
			onclick={(e) => {
				e.preventDefault();
				keywordInput = "";
				setKeyword("");
			}}>Clear</a
		>
	</div>
{/if}
<div class="c-menu">
	<div class="kw-wrap">
		<input
			type="text"
			class="info"
			placeholder="Search by keyword"
			autocomplete="off"
			enterkeyhint="search"
			role="combobox"
			aria-autocomplete="list"
			aria-controls="kw-suggestions"
			aria-expanded={showSuggestions && suggestions.length > 0}
			aria-activedescendant={ixSuggestion >= 0
				? `kw-suggestion-${ixSuggestion}`
				: undefined}
			bind:value={keywordInput}
			oninput={() => {
				showSuggestions = true;
				ixSuggestion = -1;
			}}
			onkeydown={onKeywordKeydown}
			onblur={() => (showSuggestions = false)}
		/>
		{#if showSuggestions && suggestions.length > 0}
			<ul id="kw-suggestions" class="suggestions" role="listbox">
				{#each suggestions as kw, ix (kw)}
					<li
						id="kw-suggestion-{ix}"
						role="option"
						aria-selected={ix === ixSuggestion}
						class:active={ix === ixSuggestion}
						onmousedown={(e) => {
							// mousedown + preventDefault fires before the input's blur
							e.preventDefault();
							applyKeyword(kw);
						}}
						onmouseenter={() => (ixSuggestion = ix)}
					>
						{kw}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
	<button
		style="font-size:1.2rem;margin:0;"
		title="Clear Keyword"
		aria-label="Clear Keyword"
		onclick={() => {
			keywordInput = "";
			setKeyword("");
		}}
		class="secondary"
	>
		X
	</button>
</div>
<div class="c-menu">
	<NavButton
		buttonType="first"
		disabled={isFirst}
		onclick={() => gotoSlideIx(0)}
	/>
	<NavButton buttonType="prev" disabled={isFirst} onclick={() => prev()} />
	<a
		class="button"
		style="font-size:1.7rem;"
		href="/picture?p={currentSlug}"
		title="Enlarge"
		aria-label="Enlarge">++</a
	>
	<button
		style="margin:0;"
		title="Keyword Search"
		aria-label="Keyword Search"
		onclick={() => {}}
	>
		<svg
			fill="currentColor"
			width="20px"
			height="20px"
			viewBox="0 0 20 20"
			xmlns="http://www.w3.org/2000/svg"
			><path
				d="M17.545 15.467l-3.779-3.779a6.15 6.15 0 0 0 .898-3.21c0-3.417-2.961-6.377-6.378-6.377A6.185 6.185 0 0 0 2.1 8.287c0 3.416 2.961 6.377 6.377 6.377a6.15 6.15 0 0 0 3.115-.844l3.799 3.801a.953.953 0 0 0 1.346 0l.943-.943c.371-.371.236-.84-.135-1.211zM4.004 8.287a4.282 4.282 0 0 1 4.282-4.283c2.366 0 4.474 2.107 4.474 4.474a4.284 4.284 0 0 1-4.283 4.283c-2.366-.001-4.473-2.109-4.473-4.474z"
			/></svg
		>
	</button>
	<button
		style="font-size:1.2rem;"
		title="Random"
		aria-label="Random"
		onclick={() => gotoSlideIx(getRandomIx())}
	>
		??
	</button>
	<NavButton buttonType="next" disabled={isLast} onclick={() => next()} />
	<NavButton
		buttonType="last"
		disabled={isLast}
		onclick={() => gotoSlideIx(slideCount - 1)}
	/>
</div>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.keyword {
		font-size: 0.8rem;
		font-weight: bold;
		text-align: center;
		margin: 0.25rem auto 0;

		span {
			font-weight: bold;
		}
	}

	.c-menu {
		display: flex;
		flex-flow: row wrap;
		justify-content: center;
		align-items: center;
		margin: 0.25rem auto;
		text-align: center;

		a,
		button {
			height: 2rem;
			width: 3rem;
			padding: 0;

			// &:hover {
			// 	text-decoration: none;
			// 	color: white;
			// }
		}

		input {
			width: 10rem;
			height: 2rem;
			margin: 0.25rem 0.5rem 0.25rem 0;
			padding: 0.25rem;
			font-size: 1rem;
		}
	}

	.kw-wrap {
		position: relative;
	}

	// Opens upward since the menu sits at the bottom of the page.
	.suggestions {
		position: absolute;
		bottom: calc(100% - 0.25rem);
		left: 0;
		width: 10rem;
		max-height: 15rem;
		overflow-y: auto;
		margin: 0;
		padding: 0;
		list-style: none;
		text-align: left;
		background: c.$light-background;
		border: 1px solid c.$main-color;
		border-radius: 0.25rem;
		box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.2);
		z-index: 20;

		li {
			padding: 0.25rem 0.5rem;
			cursor: pointer;
			color: c.$body-text;

			&.active {
				background: c.$main-color;
				color: white;
			}
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
