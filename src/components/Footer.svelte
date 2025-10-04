<svelte:options runes={true} />

<script lang="ts">
	import SignIn from "./SignIn.svelte";

	let isOpenModal = $state(false);

	let login = (e: Event) => {
		e && e.preventDefault();
		isOpenModal = true;
	};

	let yr = new Date().getFullYear() - 2000;

	let scrollToTop = (e: Event) => {
		e.preventDefault();
		window.scroll({
			top: 0,
			left: 0,
			behavior: "smooth",
		});
	};
</script>

<footer>
	<a href="/" onclick={scrollToTop}>Top</a> | &copy;2001-{yr} Polson Company |
	<a href="/" onclick={login}>Admin</a>
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
		color: color.adjust(c.$link-color, $lightness: 25%);
		text-decoration: none;
		font-size: 0.9rem;

		&:visited {
			color: color.adjust(c.$link-color, $lightness: 25%);
		}

		&:hover,
		&:focus {
			background: none;
			border: none;
			color: color.adjust(c.$link-color, $lightness: 45%);
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
