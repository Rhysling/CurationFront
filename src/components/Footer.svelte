<svelte:options runes={true} />

<script lang="ts">
	import { navTo } from "../stores/route-store.svelte";
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

	let yr = new Date().getFullYear();
</script>

<footer>
	&copy;1885-{yr}
	<a
		href="/"
		onclick={(e) => {
			navTo(e, "/");
		}}>Polson Company</a
	>
	|
	<a href={rssUrl} target="_blank" rel="noopener noreferrer">RSS</a>
	| <a href="/" onclick={login}>{displayName}</a>
</footer>

<SignIn bind:isOpen={isOpenModal} />

<style lang="scss">
	@use "../styles/_custom-variables" as c;

	footer {
		line-height: 1.2em;
		padding: 0.5rem 0;
		font-size: 0.9rem;
		color: var(--light-text);
		background-color: var(--dark-background);
		text-align: center;
		vertical-align: middle;
	}

	a {
		color: var(--link-lightest);
		text-decoration: none;
		font-size: 0.9rem;

		&:visited {
			color: var(--link-lightest);
		}

		&:hover,
		&:focus {
			background: none;
			border: none;
			color: hsl(from var(--link-lightest) h s calc(l + 15));
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
