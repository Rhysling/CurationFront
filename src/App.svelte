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
	import AdminDbs from "./pages/AdminDbs.svelte";
	import Picture from "./pages/Picture.svelte";
	import Testing from "./pages/Testing.svelte";

	import { routes, navFromUrl } from "./stores/route-store.svelte";
	//import { user } from "./stores/user-store.js";

	let pages = {
		Home,
		Curation,
		Curation2,
		AdminPics,
		AdminUsers,
		AdminDbs,
		Picture,
		Testing,
	};

	type PK = keyof typeof pages;

	let CurrentPage = $derived.by(() => pages[routes.currentRoute.page as PK]);

	onMount(() => {
		navFromUrl();
	});
</script>

<main>
	<div class="page">
		<CurrentPage />
	</div>
	<Footer />
</main>

<style lang="scss">
	@use "./styles/custom-variables" as c;

	main {
		height: 99.9vh;
		display: grid;
		grid-template-rows: 1fr auto;
	}

	.page {
		min-height: 0;
		overflow: hidden;
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
