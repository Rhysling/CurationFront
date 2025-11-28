<svelte:options runes={true} />

<script lang="ts">
	import {
		getPicAdminList,
		postPic,
		postPicWithImg,
		postDestroyPic,
	} from "../js/db-ops";
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
			picList = ((await getPicAdminList())?.data || []).sort(
				(a, b) => a.seq - b.seq,
			);
		} catch (error) {
			console.error(error);
		}
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
<div class="mgt-bar">
	<span
		>Hide Deleted: = <input type="checkbox" bind:checked={hideDeleted} /></span
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

	.mgt-bar {
		border: 2px solid c.$main-color;
		border-radius: 0.5rem;
		max-width: 800px;
		margin: 1rem auto;
		padding: 0.25rem 0;

		span {
			display: inline-block;
			margin: 0 1rem;
		}
	}

	.pic-list {
		display: grid;
		grid-template-columns: 150px 3fr 1fr;
		gap: 0.5rem 0;
		max-width: 800px;
		margin: 1rem auto;
		max-height: 70vh;
		overflow-y: scroll;
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
