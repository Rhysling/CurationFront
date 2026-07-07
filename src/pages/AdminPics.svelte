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
			picList = (await getPicAdminList()) || [];

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

	const savePic = async (picNew: PictureItem): Promise<boolean> => {
		const updatedPic = await postPic(picNew);
		if (!updatedPic) return false;

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
		return true;
	};

	const savePicWithImg = async (form: FormData): Promise<boolean> => {
		const savedPic = await postPicWithImg(form);
		if (!savedPic) return false;

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
		return true;
	};

	const destroyPic = async (pic: PictureItem): Promise<boolean> => {
		const id = pic.id;
		const response = await postDestroyPic(pic);
		if (!response?.ok) {
			alert("Failed to destroy picture. Please try again.");
			return false;
		}
		picList = picList.filter((a) => a.id !== id);
		return true;
	};

	const refreshPicList = (pics: PictureItem[]) => {
		picList = pics.sort((a, b) => a.seq - b.seq);
	};

	loadPicList();
</script>

<div class="page-content">
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
		<span
			>Hide Deleted: <input type="checkbox" bind:checked={hideDeleted} /></span
		>
	</div>
	<div class="pic-list">
		{#each picListDisplay as pic (pic.id)}
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
</div>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.page-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}

	.title {
		font-size: 2rem;
		font-weight: bold;
		text-align: center;
		margin: 1rem auto;
		flex: none;
	}

	.sort {
		text-align: center;
		flex: none;

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
		grid-template-columns: 150px minmax(0, 3fr) minmax(0, 1fr);
		align-content: start;
		gap: 0.5rem 0;
		max-width: min(800px, 96vw);
		margin: 0.5rem auto;
		width: 100%;
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;

		@media only screen and (width <= c.$bp-small) {
			grid-template-columns: minmax(0, min(150px, 1fr)) minmax(0, 2fr) auto;
			margin: 0.25rem auto;
			scrollbar-width: thin;
			width: 98vw;
		}
	}
</style>
