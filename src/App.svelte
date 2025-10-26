<svelte:options runes={true} />

<script lang="ts">
	import { onMount } from "svelte";

	///import Header from "./components/Header.svelte";
	import Footer from "./components/Footer.svelte";

	import Home from "./pages/Home.svelte";
	import Curation from "./pages/Curation.svelte";
	import Curation2 from "./pages/Curation2.svelte";
	import AdminPics from "./pages/AdminPics.svelte";
	import AdminUsers from "./pages/AdminUsers.svelte";
	import Testing from "./pages/Testing.svelte";
	import Picture from "./pages/Picture.svelte";

	import { getCurrentRoute, navFromUrl } from "./stores/route-store.svelte";
	//import { user } from "./stores/user-store.js";

	let pages = {
		Home,
		Curation,
		Curation2,
		AdminPics,
		AdminUsers,
		Testing,
		Picture,
	};

	type PK = keyof typeof pages;

	let CurrentPage = $derived.by(() => pages[getCurrentRoute().page as PK]);

	$effect(() => {
		window.scroll({
			top: 0,
			left: 0,
			behavior: "smooth",
		});
	});

	onMount(() => {
		navFromUrl();
	});
</script>

<main>
	<div>
		<CurrentPage />
	</div>
	<Footer />
</main>

<style lang="scss">
	@use "./styles/custom-variables" as c;

	main {
		min-height: 99.9vh;
		display: grid;
		grid-template-rows: 1fr auto;
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
