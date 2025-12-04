<svelte:options runes={true} />

<script lang="ts">
	import {
		getPicAdminList,
		postPic,
		postPicWithImg,
		postDestroyPic,
	} from "../js/db-ops";
	import {
		userSettings,
		setIsNewestFirst,
	} from "../stores/user-settings-store.svelte";
	import {
		currentParams,
		updateQueryStringParam,
	} from "../stores/route-store.svelte";
	import Menu from "../components/Menu.svelte";
	import EditPic from "../components/EditPic.svelte";
	import CleanPics from "../components/CleanPics.svelte";

	const getEmptyPicItem = () => {
		const p: PictureItem = {
			id: 0,
			fileName: "",
			seq: 0,
			ts: 0,
			keywords: [],
			description: "",
			isMissing: false,
			isDeleted: false,
		};
		return { ...p };
	};

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

			if (currentParams.paramObj["newest"]) orderByTs();
			else if (userSettings.value.isNewestFirst) orderByTs();
			else orderBySeq();
		} catch (error) {
			console.error(error);
		}
	};

	const orderBySeq = () => {
		picList.sort((a, b) => a.seq - b.seq);
		setIsNewestFirst(false);
		updateQueryStringParam("newest", undefined);
	};

	const orderByTs = () => {
		picList.sort((a, b) => b.ts - a.ts);
		setIsNewestFirst(true);
		updateQueryStringParam("newest", "true");
	};

	const setEditMode = (picId: number, isEdit: boolean) => {
		editingPicId = picId;
		isListEditMode = isEdit;
	};

	const savePic = async (pic: PictureItem) => {
		let p = picList.find((a) => a.id === pic.id);
		if (p) p = pic;
		await postPic(pic);
	};

	const savePicWithImg = async (form: FormData) => {
		const savedPic = (await postPicWithImg(form))?.data;
		if (savedPic) {
			const ix = picList.findIndex((a) => a.id === savedPic.id);
			if (ix >= 0) picList[ix] = savedPic;
			else {
				emptyPicItem = getEmptyPicItem();
				picList = [savedPic, ...picList];
			}
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

<CleanPics {picList} {isListEditMode} {refreshPicList} />
<div class="sort">
	{#if !userSettings.value.isNewestFirst}
		<span>Displayed in Curation Order</span>
		<span class="dot">&#8226;</span>
		<a
			href="/"
			onclick={(e) => {
				e.preventDefault();
				orderByTs();
			}}>Show Newest First</a
		>
	{:else}
		<span>Displayed Newest First</span>
		<span class="dot">&#8226;</span>
		<a
			href="/"
			onclick={(e) => {
				e.preventDefault();
				orderBySeq();
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
		max-height: 70vh;
		overflow-y: scroll;

		@media only screen and (width <= c.$bp-small) {
			margin: 0.25rem auto;
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
