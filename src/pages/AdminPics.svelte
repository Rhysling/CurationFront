<svelte:options runes={true} />

<script lang="ts">
	import { picsGetAdminList } from "../js/db-ops";
	import Menu from "../components/Menu.svelte";
	import EditPic from "../components/EditPic.svelte";

	let picList = $state([] as PictureItem[]);
	let isListEditMode = $state(false);
	let editingPicId = $state(0);
	// let isOpenModal = $state(false);

	let loadPicList = async () => {
		try {
			picList = ((await picsGetAdminList())?.data || []).sort(
				(a, b) => a.seq - b.seq,
			);
		} catch (error) {
			console.error(error);
		}
	};

	var setEditMode = (picId: number, isEdit: boolean) => {
		editingPicId = picId;
		isListEditMode = isEdit;
	};

	var saveItem = (pic: PictureItem) => {
		let p = picList.find((a) => a.id === pic.id);
		if (p) p = pic;
		alert(p?.fileName || "Pic Missing!");
		// SaveToDb()
	};

	loadPicList();
</script>

<div class="title">Admin Pictures Here</div>

<div class="pic-list">
	{#each picList as pic, ix (pic.id)}
		<EditPic
			picItem={pic}
			{isListEditMode}
			{editingPicId}
			{setEditMode}
			{saveItem}
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
