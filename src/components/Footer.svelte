<svelte:options runes={true} />

<script lang="ts">
	import { getName } from "../stores/user-store.svelte";
	import { getBaseURL } from "../js/utils";
	import SignIn from "./SignIn.svelte";

	let isOpenModal = $state(false);
	let displayName = $derived(getName() || "Sign In");

	let rssUrl = `${getBaseURL()}/api/Pictures/Rss`;

	let login = (e: Event) => {
		e && e.preventDefault();
		isOpenModal = true;
	};

	let yr = new Date().getFullYear() - 2000;
</script>

<footer>
	&copy;2001-{yr} Polson Company |
	<a href={rssUrl} target="_blank" rel="noopener noreferrer">RSS</a>
	| <a href="/" onclick={login}>{displayName}</a>
</footer>

<SignIn bind:isOpen={isOpenModal} />

<style lang="scss">
	@use "../styles/_custom-variables" as c;
	@use "sass:color";

	footer {
		line-height: 1.2em;
		padding: 0.5rem 0;
		font-size: 0.9rem;
		color: c.$light-text;
		background-color: c.$dark-background;
		text-align: center;
		vertical-align: middle;
	}

	a {
		color: c.$link-lightest;
		text-decoration: none;
		font-size: 0.9rem;

		&:visited {
			color: c.$link-lightest;
		}

		&:hover,
		&:focus {
			background: none;
			border: none;
			color: color.adjust(c.$link-lightest, $lightness: 15%);
			text-decoration: none;
		}
	}

	@media screen and (max-width: c.$bp-small) {
		footer {
			font-size: 0.8rem;
			a {
				font-size: 0.8rem;
			}
		}
	}
</style>
