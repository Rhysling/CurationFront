<svelte:options runes={true} />

<script lang="ts">
	import { getPicAdminList, postPic, postPicWithImg } from "../js/db-ops";
	import Menu from "../components/Menu.svelte";
	import EditPic from "../components/EditPic.svelte";
	import CleanPics from "../components/CleanPics.svelte";

	const getEmptyPicItem = () => {
		const p: PictureItem = {
			id: 0,
			fileName: "",
			seq: 0,
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

	let picListDisplay: PictureItem[] = $derived([emptyPicItem, ...picList]);

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

	const refreshPicList = (pics: PictureItem[]) => {
		picList = pics.sort((a, b) => a.seq - b.seq);
	};

	loadPicList();
</script>

<div class="title">Admin Pictures Here</div>

<CleanPics {picList} {isListEditMode} {refreshPicList} />

<div class="pic-list">
	{#each picListDisplay as pic, ix (pic.id)}
		<EditPic
			picItem={pic}
			{isListEditMode}
			{editingPicId}
			{setEditMode}
			{savePic}
			{savePicWithImg}
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

	.pic-list {
		display: grid;
		grid-template-columns: 150px 3fr 1fr;
		gap: 0.5rem 0;
		max-width: 800px;
		margin: 1rem auto;
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
