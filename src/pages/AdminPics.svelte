<svelte:options runes={true} />

<script lang="ts">
	import {
		getPicAdminList,
		postPic,
		postPicWithImg,
		postDestroyPic,
	} from "../js/db-ops";
	import { getEmptyPicItem, orderBySeq, orderByTs } from "../js/utils";
	import { userSettings } from "../stores/user-settings-store.svelte";
	import { pageState } from "../stores/route-store.svelte";
	import Menu from "../components/Menu.svelte";
	import EditPic from "../components/EditPic.svelte";
	import CleanPics from "../components/CleanPics.svelte";

	let picList = $state([] as PictureItem[]);
	let isListEditMode = $state(false);
	let editingPicId = $state(0);
	let emptyPicItem = $state(getEmptyPicItem());
	let hideDeleted = $state(false);

	let picListDisplay: PictureItem[] = $derived.by(() => {
		const pl = [emptyPicItem, ...picList];
		return hideDeleted ? pl.filter((a) => !a.isDeleted) : pl;
	});

	const loadPicList = async () => {
		try {
			picList = (await getPicAdminList())?.data || [];

			if (pageState.paramObj["newest"]) orderByTs(picList);
			else if (userSettings.value.isNewestFirst) orderByTs(picList);
			else orderBySeq(picList);
		} catch (error) {
			console.error(error);
		}
	};

	$effect(() => {
		if (!picList.length) return;
		const pid = pageState.paramObj["pid"];
		if (!pid) return;
		const el = document.getElementById("pcid-" + pid);
		el?.scrollIntoView({ block: "center", behavior: "instant" });
	});

	const setEditMode = (picId: number, isEdit: boolean) => {
		editingPicId = picId;
		isListEditMode = isEdit;
	};

	const savePic = async (picNew: PictureItem) => {
		const updatedPic = (await postPic(picNew))?.data;
		if (!updatedPic) return;

		const ix = picList.findIndex((a) => a.id === updatedPic.id);
		if (ix >= 0) {
			picList[ix] = updatedPic;

			// Preload the image so the <img> tag never shows a broken state
			setTimeout(() => {
				const imgPath = `/pics/${picNew.fileName}`;
				const probe = new Image();
				probe.onload = () => {
					const el = document.getElementById("pic-" + picNew.id);
					if (el) {
						const img = <HTMLImageElement>el;
						img.src = imgPath;
					}
				};
				probe.onerror = () => {
					console.error(`Failed to load image: ${imgPath}`);
				};

				probe.src = imgPath;
			}, 100);
		}
	};

	const savePicWithImg = async (form: FormData) => {
		const savedPic = (await postPicWithImg(form))?.data;
		if (savedPic) {
			// Preload the image so the <img> tag never shows a broken state
			const imgPath = `/pics/${savedPic.fileName}`;
			const probe = new Image();
			probe.onload = probe.onerror = () => {
				const ix = picList.findIndex((a) => a.id === savedPic.id);
				if (ix >= 0) picList[ix] = savedPic;
				else {
					emptyPicItem = getEmptyPicItem();
					picList = [savedPic, ...picList];
				}
			};
			probe.src = imgPath;
		}
	};

	const destroyPic = async (pic: PictureItem) => {
		const id = pic.id;
		await postDestroyPic(pic);
		picList = picList.filter((a) => a.id !== id);
	};

	const refreshPicList = (pics: PictureItem[]) => {
		picList = pics.sort((a, b) => a.seq - b.seq);
	};

	loadPicList();
</script>

<div class="title">Admin Pictures</div>

<CleanPics {isListEditMode} {refreshPicList} />
<div class="sort">
	{#if !userSettings.value.isNewestFirst}
		<span>Displayed in Curation Order</span>
		<span class="dot">&#8226;</span>
		<a
			href="/"
			onclick={(e) => {
				e.preventDefault();
				orderByTs(picList);
			}}>Show Newest First</a
		>
	{:else}
		<span>Displayed Newest First</span>
		<span class="dot">&#8226;</span>
		<a
			href="/"
			onclick={(e) => {
				e.preventDefault();
				orderBySeq(picList);
			}}>Show in Curation Order</a
		>
	{/if}
	<span class="dot">&#8226;</span>
	<span>Hide Deleted: <input type="checkbox" bind:checked={hideDeleted} /></span
	>
</div>
<div class="pic-list">
	{#each picListDisplay as pic, ix (pic.id)}
		<EditPic
			picItem={pic}
			{picList}
			{isListEditMode}
			{editingPicId}
			{setEditMode}
			{savePic}
			{savePicWithImg}
			{destroyPic}
		/>
	{/each}
</div>

<Menu />

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.title {
		font-size: 2rem;
		font-weight: bold;
		text-align: center;
		margin: 1rem auto;
	}

	.sort {
		text-align: center;

		span {
			font-weight: bold;
		}

		span,
		a {
			display: inline-block;
		}

		@media only screen and (width <= c.$bp-small) {
			span,
			a {
				display: block;
				margin: 0 auto;
			}

			span.dot {
				display: none;
			}
		}
	}

	.pic-list {
		display: grid;
		grid-template-columns: 150px 3fr 1fr;
		gap: 0.5rem 0;
		max-width: 800px;
		margin: 0.5rem auto;
		max-height: 67vh;
		overflow-y: scroll;

		@media only screen and (width <= c.$bp-small) {
			grid-template-columns: 150px 1fr auto;
			margin: 0.25rem auto;
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
